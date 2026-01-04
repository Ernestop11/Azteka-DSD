import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/customer/multi-store - Get all stores for an owner with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID required' }, { status: 400 })
    }

    // Get the owner customer
    const owner = await prisma.customer.findUnique({
      where: { id: ownerId },
      select: {
        id: true,
        businessName: true,
        contactName: true,
        role: true,
      }
    })

    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Not an owner account' }, { status: 403 })
    }

    // Get all sub-stores
    const stores = await prisma.customer.findMany({
      where: { parentCustomerId: ownerId },
      select: {
        id: true,
        businessName: true,
        contactName: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
      },
      orderBy: { businessName: 'asc' }
    })

    // Get orders for all stores
    const storeIds = stores.map(s => s.id)
    const orders = await prisma.order.findMany({
      where: {
        customerId: { in: storeIds }
      },
      select: {
        id: true,
        customerId: true,
        total: true,
        status: true,
        createdAt: true,
        OrderItem: {
          select: { quantity: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Build stats per store
    const storeStats = stores.map(store => {
      const storeOrders = orders.filter(o => o.customerId === store.id)
      const totalSpent = storeOrders.reduce((sum, o) => sum + Number(o.total), 0)
      const lastOrder = storeOrders[0] || null

      return {
        ...store,
        orderCount: storeOrders.length,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt?.toISOString() || null,
        lastOrderStatus: lastOrder?.status || null,
        pendingOrders: storeOrders.filter(o =>
          ['pending', 'processing', 'picking'].includes(o.status.toLowerCase())
        ).length,
        inTransitOrders: storeOrders.filter(o =>
          ['shipped', 'in_transit'].includes(o.status.toLowerCase())
        ).length,
      }
    })

    // Aggregate stats
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return NextResponse.json({
      owner: {
        id: owner.id,
        businessName: owner.businessName,
        contactName: owner.contactName,
      },
      stores: storeStats,
      aggregateStats: {
        totalStores: stores.length,
        totalOrders,
        totalRevenue,
        avgOrderValue,
        pendingOrders: storeStats.reduce((sum, s) => sum + s.pendingOrders, 0),
        inTransitOrders: storeStats.reduce((sum, s) => sum + s.inTransitOrders, 0),
      }
    })
  } catch (error) {
    console.error('[Multi-Store API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}
