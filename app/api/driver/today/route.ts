import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get orders ready for delivery or out for delivery
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PICKED', 'OUT_FOR_DELIVERY', 'pending', 'processing'] },
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
      take: 20
    })

    // Get customers for address info
    const customers = await prisma.customer.findMany({
      where: { active: true },
      take: 50
    })

    // Create a map of customer names to customer info
    const customerMap = new Map(customers.map(c => [c.businessName.toLowerCase(), c]))

    // Transform orders into route stops
    const stops = orders.map((order, index) => {
      // Try to find matching customer by name
      const customer = customerMap.get(order.customerName.toLowerCase())

      return {
        id: order.id,
        type: 'delivery' as const,
        customerName: order.customerName,
        address: customer?.address || '123 Business St',
        city: customer?.city || 'San Antonio',
        state: customer?.state || 'TX',
        phone: customer?.phone || '',
        orderId: order.id,
        items: order.OrderItem.map(item => ({
          id: item.id,
          name: item.Product.name,
          sku: item.Product.sku,
          quantity: item.quantity,
          price: Number(item.price),
          imageUrl: item.Product.imageUrl || '',
          unitsPerCase: item.Product.unitsPerCase
        })),
        total: Number(order.total),
        status: order.status === 'OUT_FOR_DELIVERY' ? 'in_transit' :
                order.status === 'PICKED' ? 'pending' : 'pending',
        priority: 'normal' as const,
        notes: order.notes || '',
        createdAt: order.createdAt.toISOString()
      }
    })

    // Get products for truck inventory
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
        stock: { gt: 0 }
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        price: true,
        imageUrl: true,
        unitsPerCase: true,
      },
      orderBy: { name: 'asc' },
      take: 50
    })

    // Transform products for truck inventory
    const truckInventory = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: Math.min(p.stock, 20), // Simulated truck quantity
      maxCapacity: 30,
      price: Number(p.price),
      imageUrl: p.imageUrl || ''
    }))

    return NextResponse.json({
      stops,
      truckInventory,
      summary: {
        totalStops: stops.length,
        totalValue: stops.reduce((sum, s) => sum + s.total, 0),
        totalItems: stops.reduce((sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0)
      }
    })
  } catch (error) {
    console.error('Driver schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch driver schedule' },
      { status: 500 }
    )
  }
}
