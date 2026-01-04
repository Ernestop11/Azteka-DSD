import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface StoreOrder {
  storeId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
}

// POST /api/customer/multi-store/bulk-order - Submit orders for multiple stores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ownerId, orders } = body as {
      ownerId: string
      orders: StoreOrder[]
    }

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID required' }, { status: 400 })
    }

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'Orders required' }, { status: 400 })
    }

    // Verify owner
    const owner = await prisma.customer.findUnique({
      where: { id: ownerId },
      select: { id: true, role: true, businessName: true }
    })

    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Not an owner account' }, { status: 403 })
    }

    // Get valid store IDs
    const stores = await prisma.customer.findMany({
      where: { parentCustomerId: ownerId },
      select: { id: true, businessName: true }
    })
    const validStoreIds = new Set(stores.map(s => s.id))

    // Create orders for each store
    const createdOrders: Array<{ storeId: string; storeName: string; orderId: string; total: number; itemCount: number }> = []
    const errors: Array<{ storeId: string; error: string }> = []

    for (const storeOrder of orders) {
      if (!validStoreIds.has(storeOrder.storeId)) {
        errors.push({ storeId: storeOrder.storeId, error: 'Invalid store ID' })
        continue
      }

      if (!storeOrder.items || storeOrder.items.length === 0) {
        continue // Skip stores with no items
      }

      const store = stores.find(s => s.id === storeOrder.storeId)
      const storeName = store?.businessName || 'Unknown Store'

      // Calculate total
      const total = storeOrder.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      try {
        // Create the order with items
        const order = await prisma.order.create({
          data: {
            customerId: storeOrder.storeId,
            status: 'pending',
            total,
            notes: `Bulk order placed by ${owner.businessName}`,
            OrderItem: {
              create: storeOrder.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              }))
            }
          },
          select: {
            id: true,
            total: true,
            OrderItem: { select: { id: true } }
          }
        })

        createdOrders.push({
          storeId: storeOrder.storeId,
          storeName,
          orderId: order.id,
          total: Number(order.total),
          itemCount: order.OrderItem.length
        })
      } catch (err) {
        console.error(`Error creating order for store ${storeOrder.storeId}:`, err)
        errors.push({
          storeId: storeOrder.storeId,
          error: err instanceof Error ? err.message : 'Failed to create order'
        })
      }
    }

    // Summary
    const totalOrders = createdOrders.length
    const totalItems = createdOrders.reduce((sum, o) => sum + o.itemCount, 0)
    const totalValue = createdOrders.reduce((sum, o) => sum + o.total, 0)

    return NextResponse.json({
      success: true,
      summary: {
        ordersCreated: totalOrders,
        totalItems,
        totalValue,
        storesWithErrors: errors.length
      },
      orders: createdOrders,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('[Multi-Store Bulk Order API] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process bulk order' },
      { status: 500 }
    )
  }
}
