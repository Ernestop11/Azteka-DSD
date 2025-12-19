import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/employee/delivery
 * Fetches orders ready for delivery or out for delivery
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Only show packed and shipped orders for delivery
    const where: any = {
      status: {
        in: ['packed', 'shipped']
      }
    }

    if (status && ['packed', 'shipped'].includes(status.toLowerCase())) {
      where.status = status.toLowerCase()
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        OrderItem: {
          select: {
            id: true
          }
        }
      },
      take: 50
    })

    // Transform to expected format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      customerName: order.customerName,
      total: order.total,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      itemCount: order.OrderItem.length
    }))

    return NextResponse.json({ data: transformedOrders })
  } catch (error: any) {
    console.error('[GET /api/employee/delivery] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delivery orders', details: error.message },
      { status: 500 }
    )
  }
}
