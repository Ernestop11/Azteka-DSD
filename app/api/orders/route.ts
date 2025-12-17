import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/prisma'
import { ApiError, handleApiError } from '@/lib/apiErrors'
import type { TApiResponse, ErrorResponse } from '@/types/api'

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
  await prisma.orderEvent.create({
    data: {
      orderId,
      type,
      payload: payload as Prisma.InputJsonValue,
    },
  })
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

    const [products, overrides] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true },
      }),
      prisma.customerPriceOverride.findMany({
        where: { customerId: payload.customerId, productId: { in: productIds } },
      }),
    ])

    const productPriceMap = new Map<string, number>()
    products.forEach((product) => {
      const price = toNumber(product.price)
      productPriceMap.set(product.id, price)
    })

    const overrideMap = new Map<string, number>()
    overrides.forEach((override) => {
      overrideMap.set(override.productId, override.priceCase)
    })

    let total = 0

    const itemsData = payload.items.map((item) => {
      const basePrice = productPriceMap.get(item.productId)
      if (basePrice === undefined) {
        throw new ApiError(404, `Product ${item.productId} not found`)
      }

      const priceCase = overrideMap.get(item.productId) ?? basePrice
      if (priceCase <= 0) {
        throw new ApiError(400, `Invalid price for product ${item.productId}`)
      }

      total += priceCase * item.quantity

      return {
        productId: item.productId,
        quantity: item.quantity,
        priceCase,
      }
    })

    const overridesUsed = itemsData.filter((item) => {
      const overridePrice = overrideMap.get(item.productId)
      return overridePrice !== undefined && overridePrice !== productPriceMap.get(item.productId)
    }).length

    const metadata: Prisma.JsonObject = {
      createdBy: payload.userId ?? null,
      overridesUsed,
      items: itemsData.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceCase: item.priceCase,
      })),
      createdAt: new Date().toISOString(),
    }

    const order = await prisma.order.create({
      data: {
        customerId: payload.customerId,
        userId: payload.userId,
        total,
        metadata,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
    })

    await recordOrderEvent(order.id, 'ORDER_CREATED', {
      total,
      overridesUsed,
      itemCount: order.items.length,
    } as Prisma.JsonObject)

    const response: TApiResponse<typeof order> = { data: order }
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const err: ErrorResponse = { error: 'Validation failed', details: error.flatten() }
      return NextResponse.json(err, { status: 400 })
    }
    return handleApiError(error, 'Failed to create order')
  }
}
