import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get all order items for this customer with product details
    const orderItems = await prisma.orderItem.findMany({
      where: {
        Order: { customerId }
      },
      select: {
        productId: true,
        quantity: true,
        price: true,
        Order: {
          select: {
            createdAt: true,
            total: true
          }
        },
        Product: {
          select: {
            id: true,
            name: true,
            sku: true,
            imageUrl: true,
            Category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Calculate top 10 products by quantity
    const productMap = new Map<string, {
      id: string
      name: string
      sku: string
      imageUrl: string | null
      totalQuantity: number
      orderCount: number
      lastOrdered: Date
    }>()

    orderItems.forEach(item => {
      if (!item.Product) return

      const existing = productMap.get(item.productId)
      const orderDate = item.Order.createdAt

      if (existing) {
        existing.totalQuantity += item.quantity
        existing.orderCount += 1
        if (orderDate > existing.lastOrdered) {
          existing.lastOrdered = orderDate
        }
      } else {
        productMap.set(item.productId, {
          id: item.Product.id,
          name: item.Product.name,
          sku: item.Product.sku,
          imageUrl: item.Product.imageUrl,
          totalQuantity: item.quantity,
          orderCount: 1,
          lastOrdered: orderDate
        })
      }
    })

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10)
      .map(p => ({
        ...p,
        lastOrdered: p.lastOrdered.toISOString()
      }))

    // Get orders for monthly analytics (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const orders = await prisma.order.findMany({
      where: {
        customerId,
        createdAt: { gte: twelveMonthsAgo }
      },
      select: {
        id: true,
        total: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Group orders by month
    const monthlyData: { month: string; total: number; orderCount: number }[] = []
    const monthMap = new Map<string, { total: number; orderCount: number }>()

    orders.forEach(order => {
      const monthKey = order.createdAt.toISOString().slice(0, 7) // YYYY-MM
      const existing = monthMap.get(monthKey)
      const orderTotal = Number(order.total)

      if (existing) {
        existing.total += orderTotal
        existing.orderCount += 1
      } else {
        monthMap.set(monthKey, { total: orderTotal, orderCount: 1 })
      }
    })

    // Fill in missing months with zeros
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().slice(0, 7)
      const data = monthMap.get(monthKey) || { total: 0, orderCount: 0 }
      monthlyData.push({
        month: monthKey,
        total: Math.round(data.total * 100) / 100,
        orderCount: data.orderCount
      })
    }

    // Calculate averages
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate order frequency (average days between orders)
    let orderFrequency = 0
    if (orders.length > 1) {
      const sortedOrders = [...orders].sort((a, b) =>
        a.createdAt.getTime() - b.createdAt.getTime()
      )
      let totalDays = 0
      for (let i = 1; i < sortedOrders.length; i++) {
        const daysDiff = (sortedOrders[i].createdAt.getTime() - sortedOrders[i-1].createdAt.getTime()) / (1000 * 60 * 60 * 24)
        totalDays += daysDiff
      }
      orderFrequency = Math.round(totalDays / (sortedOrders.length - 1))
    }

    // Get category breakdown from already-fetched data
    const categoryMap = new Map<string, { name: string; total: number; count: number }>()

    for (const item of orderItems) {
      if (!item.Product?.Category) continue

      const category = item.Product.Category
      const existing = categoryMap.get(category.id)
      const itemTotal = Number(item.price) * item.quantity

      if (existing) {
        existing.total += itemTotal
        existing.count += item.quantity
      } else {
        categoryMap.set(category.id, {
          name: category.name,
          total: itemTotal,
          count: item.quantity
        })
      }
    }

    const categoryBreakdown = Array.from(categoryMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    return NextResponse.json({
      topProducts,
      monthlyData,
      stats: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        orderFrequency // days between orders
      },
      categoryBreakdown
    })
  } catch (error) {
    console.error('[Customer Analytics API] Error:', error)
    // Return detailed error in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: 'Failed to load analytics',
      details: errorMessage
    }, { status: 500 })
  }
}
