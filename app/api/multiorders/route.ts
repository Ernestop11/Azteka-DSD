import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { TApiResponse, ErrorResponse } from '@/types/api'
import { sanitizeMultiOrder } from '@/lib/orders/sanitizeOrder'
import { validateMultiOrder } from '@/lib/orders/validateOrder'

interface MultiOrderItem {
  productId: string
  quantity: number
  priceCase: number
}

interface MultiOrderRequest {
  customerId: string
  items: MultiOrderItem[]
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()

    // Step 1: Sanitize input
    const sanitizedOrders = sanitizeMultiOrder(Array.isArray(rawBody) ? rawBody : [rawBody])

    if (sanitizedOrders.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body. No valid orders found after sanitization.' },
        { status: 400 }
      )
    }

    // Step 2: Validate orders
    const validation = await validateMultiOrder(sanitizedOrders)

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Order validation failed',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Step 3: Create orders with safe error handling
    const createdOrders = []
    const errors: Array<{ orderIndex: number; error: string }> = []

    for (let i = 0; i < sanitizedOrders.length; i++) {
      const orderData = sanitizedOrders[i]

      try {
        // Calculate total
        let total = 0
        for (const item of orderData.items) {
          total += item.priceCase * item.quantity
        }

        // Create order
        const order = await prisma.order.create({
          data: {
            customerId: orderData.customerId,
            status: 'NEW',
            total,
            metadata: orderData.metadata || {},
            items: {
              create: orderData.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                priceCase: item.priceCase,
              })),
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            customer: true,
          },
        })

        createdOrders.push(order)
      } catch (error: any) {
        console.error(`Error creating order ${i}:`, error)
        errors.push({
          orderIndex: i,
          error: error?.message || 'Unknown error',
        })
        // Continue processing other orders
      }
    }

    // Return partial success if some orders failed
    if (errors.length > 0 && createdOrders.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to create all orders',
          details: errors,
        },
        { status: 500 }
      )
    }

    const response: TApiResponse<typeof createdOrders> = {
      data: createdOrders,
      ...(errors.length > 0 && { warnings: errors }),
    }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error in multi-orders endpoint:', error)
    const err: ErrorResponse = {
      error: 'Failed to process orders',
      details: error?.message || String(error),
    }
    return NextResponse.json(err, { status: 500 })
  }
}

