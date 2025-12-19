import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/employee/orders
 * Fetches orders for warehouse picking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
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
                warehouseLocation: true,
                unitsPerCase: true
              }
            }
          }
        }
      },
      take: 50 // Limit to recent orders
    })

    // Transform to expected format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      customerName: order.customerName,
      total: order.total,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      items: order.OrderItem.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.Product.id,
          name: item.Product.name,
          sku: item.Product.sku,
          imageUrl: item.Product.imageUrl,
          warehouseLocation: item.Product.warehouseLocation,
          unitsPerCase: item.Product.unitsPerCase
        }
      }))
    }))

    return NextResponse.json({ data: transformedOrders })
  } catch (error: any) {
    console.error('[GET /api/employee/orders] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    )
  }
}
