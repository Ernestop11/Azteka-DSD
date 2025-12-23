import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireEmployee, unauthorizedResponse } from '../../lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Require employee-level authentication for warehouse access
  const user = await requireEmployee()
  if (!user) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause for warehouse-relevant statuses
    const whereClause: Record<string, unknown> = {}

    if (status) {
      whereClause.status = status
    } else {
      // Default: show orders that need warehouse attention
      whereClause.status = {
        in: ['pending', 'NEW', 'PICKING', 'PICKED', 'processing']
      }
    }

    // Fetch orders with related data
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          OrderItem: {
            include: {
              Product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  imageUrl: true
                }
              }
            }
          },
          User: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ])

    // Transform orders for frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      customerName: order.customerName,
      total: Number(order.total),
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      driverId: order.driverId,
      items: order.OrderItem.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: Number(item.price),
        product: item.Product
      })),
      user: order.User
    }))

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching warehouse orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch warehouse orders' },
      { status: 500 }
    )
  }
}
