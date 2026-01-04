import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get orders that are marked for delivery
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['READY', 'OUT_FOR_DELIVERY', 'DELIVERED']
        }
      },
      include: {
        customer: {
          select: {
            businessName: true,
            address: true,
            phone: true
          }
        },
        items: {
          select: {
            quantity: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const deliveries = orders.map(order => ({
      id: order.id,
      orderId: order.id.slice(-8).toUpperCase(),
      customer: order.customer?.businessName || 'Unknown Customer',
      address: order.customer?.address || 'No address',
      driver: null, // TODO: Add driver assignment
      status: order.status === 'DELIVERED' ? 'DELIVERED' :
              order.status === 'OUT_FOR_DELIVERY' ? 'IN_TRANSIT' : 'PENDING',
      scheduledDate: order.createdAt.toISOString(),
      completedAt: order.status === 'DELIVERED' ? order.updatedAt.toISOString() : null,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: Number(order.total)
    }))

    return NextResponse.json({ deliveries })
  } catch (error) {
    console.error('Deliveries error:', error)
    return NextResponse.json({ deliveries: [] })
  }
}
