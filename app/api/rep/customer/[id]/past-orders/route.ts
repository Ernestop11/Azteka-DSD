import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/rep/customer/[id]/past-orders - Get past orders with items for credit processing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params

    // Fetch past orders with items (last 90 days, delivered or completed orders)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const orders = await prisma.order.findMany({
      where: {
        customerId,
        createdAt: { gte: ninetyDaysAgo },
        // Only show orders that have been delivered (eligible for credits)
        status: { in: ['delivered', 'completed', 'DELIVERED', 'COMPLETED', 'pending', 'PENDING'] }
      },
      include: {
        OrderItem: {
          include: {
            Product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
                unitsPerCase: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to last 20 orders
    })

    // Format the response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      createdAt: order.createdAt.toISOString(),
      status: order.status,
      total: Number(order.total),
      items: order.OrderItem.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.Product?.name || 'Unknown Product',
        productSku: item.Product?.sku || '',
        productImage: item.Product?.imageUrl || null,
        quantity: item.quantity,
        price: Number(item.price),
        unitsPerCase: item.Product?.unitsPerCase || 12,
      }))
    }))

    return NextResponse.json({ orders: formattedOrders })
  } catch (error) {
    console.error('[Past Orders API] Error:', error)
    return NextResponse.json({ error: 'Failed to load past orders' }, { status: 500 })
  }
}
