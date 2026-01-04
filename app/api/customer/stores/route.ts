import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/customer/stores?ownerId=xxx - Get sub-stores for an owner
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get('ownerId')

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID required' }, { status: 400 })
    }

    // Verify owner exists and is OWNER role
    const owner = await prisma.customer.findUnique({
      where: { id: ownerId },
      select: { id: true, role: true, businessName: true }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Owner not found' }, { status: 404 })
    }

    if (owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Not an owner account' }, { status: 403 })
    }

    // Get all sub-stores
    const subStores = await prisma.customer.findMany({
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
        orders: {
          select: {
            id: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // Calculate stats for each store
    const stores = subStores.map(store => {
      const orderCount = store.orders.length
      const totalSpent = store.orders.reduce((sum, o) => sum + Number(o.total), 0)
      const lastOrderDate = store.orders[0]?.createdAt?.toISOString() || null

      return {
        id: store.id,
        businessName: store.businessName,
        contactName: store.contactName,
        phone: store.phone,
        email: store.email,
        address: store.address,
        city: store.city,
        state: store.state,
        zipCode: store.zipCode,
        orderCount,
        totalSpent,
        lastOrderDate,
      }
    })

    // Calculate aggregate stats
    const totalOrders = stores.reduce((sum, s) => sum + s.orderCount, 0)
    const totalRevenue = stores.reduce((sum, s) => sum + s.totalSpent, 0)

    return NextResponse.json({
      stores,
      stats: {
        totalStores: stores.length,
        totalOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      }
    })
  } catch (error) {
    console.error('[Customer Stores API] Error:', error)
    return NextResponse.json({ error: 'Failed to load stores' }, { status: 500 })
  }
}
