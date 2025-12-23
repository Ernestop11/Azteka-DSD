import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/admin/control-tower/orders
 * Get recent orders for Ana's Control Tower
 */
export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: today }
      },
      include: {
        OrderItem: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 12
    })

    const formatted = orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      total: order.total,
      status: order.status,
      itemCount: order.OrderItem.length,
      createdAt: order.createdAt.toISOString()
    }))

    return NextResponse.json({ data: formatted })
  } catch (error: any) {
    console.error('[GET /api/admin/control-tower/orders] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    )
  }
}
