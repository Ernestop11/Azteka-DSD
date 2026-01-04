import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/apiErrors'
import type { TApiResponse, ErrorResponse } from '@/types/api'
import { processNewOrder } from '@/lib/services/autoWorkflow'
import { getCustomerPrice } from '@/lib/pricing/getCustomerPrice'
import { sendOrderConfirmationEmails } from '@/lib/email/resend'

const OrderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
})

const CreateOrderSchema = z.object({
  customerId: z.string().min(1),
  userId: z.string().optional(),
  items: z.array(OrderItemInputSchema).min(1),
})

const toNumber = (value: unknown, fallback = 0) => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const parsed = Number((value as { toString(): string }).toString())
    return Number.isFinite(parsed) ? parsed : fallback
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function recordOrderEvent(orderId: string, type: string, payload: Prisma.JsonValue) {
  // TODO: OrderEvent model doesn't exist in schema - logging instead
  console.log(`[OrderEvent] ${type}:`, { orderId, ...payload as object })
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const customerId = url.searchParams.get('customerId') ?? undefined
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100)

    const orders = await prisma.order.findMany({
      where: customerId ? { customerId } : undefined,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, businessName: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
      },
    })

    const response: TApiResponse<typeof orders> = { data: orders }
    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error, 'Failed to fetch orders')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = CreateOrderSchema.parse(body)

    const productIds = payload.items.map((item) => item.productId)

    // Fetch products
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    })

    // Calculate prices with customer overrides
    let total = 0
    let overridesUsed = 0

    const itemsData = await Promise.all(
      payload.items.map(async (item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) {
          throw new ApiError(404, `Product ${item.productId} not found`)
        }

        // Get customer-specific price (includes overrides, tiers, etc.)
        const priceResult = await getCustomerPrice(
          item.productId,
          payload.customerId,
          item.quantity
        )

        const priceCase = priceResult.finalPrice
        if (priceCase <= 0) {
          throw new ApiError(400, `Invalid price for product ${item.productId}`)
        }

        // Track if override was used
        if (priceResult.overridePrice !== null || priceResult.priceTierUsed !== null) {
          overridesUsed++
        }

        total += priceCase * item.quantity

        return {
          productId: item.productId,
          quantity: item.quantity,
          priceCase,
          basePrice: priceResult.basePrice,
          overridePrice: priceResult.overridePrice,
          discountAmount: priceResult.discountAmount,
          discountPercent: priceResult.discountPercent,
        }
      })
    )

    const metadata: Prisma.JsonObject = {
      createdBy: payload.userId ?? null,
      overridesUsed,
      items: itemsData.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceCase: item.priceCase,
        basePrice: item.basePrice,
        overridePrice: item.overridePrice,
        discountAmount: item.discountAmount,
        discountPercent: item.discountPercent,
      })),
      createdAt: new Date().toISOString(),
    }

    // Get customer name for the order
    const customer = await prisma.customer.findUnique({
      where: { id: payload.customerId },
      select: { businessName: true, contactName: true },
    })

    const customerName = customer?.businessName || customer?.contactName || 'Unknown Customer'

    // Generate unique IDs (schema doesn't use auto-generated UUIDs for Order/OrderItem)
    const orderId = crypto.randomUUID()

    // For La Superior stores, append store number to order reference
    // Extract store number from businessName (e.g., "La Superior #1" -> "1")
    let orderSuffix = ''
    const superiorMatch = customerName.match(/la\s*superior\s*#?(\d+)/i)
    if (superiorMatch) {
      orderSuffix = `-${superiorMatch[1]}`
    }

    // Create a readable order number: last 6 chars of UUID + store suffix
    const orderNumber = orderId.slice(-6).toUpperCase() + orderSuffix

    const order = await prisma.order.create({
      data: {
        id: orderId,
        customerName,
        customerId: payload.customerId,
        total,
        userId: payload.userId,
        notes: `Order #${orderNumber}`,
        updatedAt: new Date(),
        OrderItem: {
          create: itemsData.map((item) => ({
            id: crypto.randomUUID(),
            productId: item.productId,
            quantity: item.quantity,
            price: item.priceCase,
            updatedAt: new Date(),
          })),
        },
      },
      include: {
        OrderItem: {
          include: { Product: { select: { id: true, name: true, sku: true } } },
        },
      },
    })

    await recordOrderEvent(order.id, 'ORDER_CREATED', {
      total,
      overridesUsed,
      itemCount: order.OrderItem.length,
    } as Prisma.JsonObject)

    // Auto-workflow: Create picking task, assign to employee, auto-print picking list
    let workflow = null
    try {
      workflow = await processNewOrder(order.id)
      if (workflow.success) {
        console.log(`[Order ${order.id}] Workflow started: Task ${workflow.taskId}, Assignee: ${workflow.assigneeName || 'unassigned'}, Printed: ${workflow.printed}`)
      }
    } catch (workflowError) {
      // Don't fail the order creation if workflow fails
      console.error('[Order Workflow Error]', workflowError)
    }

    // Send order confirmation emails (async, don't block response)
    try {
      const customerData = await prisma.customer.findUnique({
        where: { id: payload.customerId },
        select: { businessName: true, contactName: true, email: true }
      })

      if (customerData?.email) {
        // Send emails in background (don't await to avoid slowing response)
        sendOrderConfirmationEmails({
          orderId: order.id,
          customerName: customerData.contactName || customerData.businessName,
          customerEmail: customerData.email,
          businessName: customerData.businessName,
          items: order.OrderItem.map(item => ({
            name: item.Product?.name || 'Unknown Product',
            quantity: item.quantity,
            price: Number(item.price)
          })),
          subtotal: Number(order.total),
          total: Number(order.total),
          orderDate: order.createdAt,
          notes: order.notes || undefined
        }).then(result => {
          console.log(`[Order ${order.id}] Email results:`, result)
        }).catch(err => {
          console.error(`[Order ${order.id}] Email error:`, err)
        })
      }
    } catch (emailError) {
      // Don't fail order if email fails
      console.error('[Order Email Setup Error]', emailError)
    }

    const response: TApiResponse<typeof order & { workflow?: typeof workflow }> = {
      data: { ...order, workflow }
    }
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const err: ErrorResponse = { error: 'Validation failed', details: error.flatten() }
      return NextResponse.json(err, { status: 400 })
    }
    return handleApiError(error, 'Failed to create order')
  }
}
