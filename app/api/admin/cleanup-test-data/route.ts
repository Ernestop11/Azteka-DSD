import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/admin/cleanup-test-data - Remove test customers and orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { confirmPhrase } = body

    // Safety check - require confirmation phrase
    if (confirmPhrase !== 'DELETE_TEST_DATA') {
      return NextResponse.json({
        error: 'Confirmation phrase required: DELETE_TEST_DATA'
      }, { status: 400 })
    }

    // Keep these customers (real business)
    const keepBusinessNames = [
      'Mi Familia Market',
    ]

    // Get all customers to check what will be deleted
    const allCustomersRaw = await prisma.customer.findMany({
      select: { id: true, email: true, businessName: true }
    })

    const customersToKeepByName = allCustomersRaw.filter(c =>
      keepBusinessNames.some(name =>
        c.businessName?.toLowerCase().includes(name.toLowerCase())
      )
    )
    const customersToDeleteByName = allCustomersRaw.filter(c =>
      !keepBusinessNames.some(name =>
        c.businessName?.toLowerCase().includes(name.toLowerCase())
      )
    )

    const customersToKeep = customersToKeepByName
    const customersToDelete = customersToDeleteByName

    console.log(`Keeping ${customersToKeep.length} customers, deleting ${customersToDelete.length}`)

    // Delete in order to respect foreign keys
    const customerIdsToDelete = customersToDelete.map(c => c.id)

    // 1. Delete customer sessions
    const deletedSessions = await prisma.customerSession.deleteMany({
      where: { customerId: { in: customerIdsToDelete } }
    })

    // 2. Delete customer messages
    const deletedMessages = await prisma.customerMessage.deleteMany({
      where: {
        OR: [
          { senderId: { in: customerIdsToDelete } },
          { recipientId: { in: customerIdsToDelete } }
        ]
      }
    })

    // 3. Delete price overrides
    const deletedOverrides = await prisma.customerPriceOverride.deleteMany({
      where: { customerId: { in: customerIdsToDelete } }
    })

    // 4. Delete order items first (for orders of deleted customers)
    const ordersToDelete = await prisma.order.findMany({
      where: { customerId: { in: customerIdsToDelete } },
      select: { id: true }
    })
    const orderIdsToDelete = ordersToDelete.map(o => o.id)

    const deletedOrderItems = await prisma.orderItem.deleteMany({
      where: { orderId: { in: orderIdsToDelete } }
    })

    // 5. Delete delivery confirmations
    await prisma.deliveryConfirmation.deleteMany({
      where: { orderId: { in: orderIdsToDelete } }
    }).catch(() => {}) // May not exist

    // 6. Delete orders
    const deletedOrders = await prisma.order.deleteMany({
      where: { customerId: { in: customerIdsToDelete } }
    })

    // 7. Delete product requests
    await prisma.productRequest.deleteMany({
      where: { customerId: { in: customerIdsToDelete } }
    }).catch(() => {})

    // 8. Delete customer surveys
    await prisma.customerSurvey.deleteMany({
      where: { customerId: { in: customerIdsToDelete } }
    }).catch(() => {})

    // 9. Delete customer documents
    await prisma.customerDocument.deleteMany({
      where: { customerId: { in: customerIdsToDelete } }
    }).catch(() => {})

    // 10. Finally delete customers
    const deletedCustomers = await prisma.customer.deleteMany({
      where: { id: { in: customerIdsToDelete } }
    })

    return NextResponse.json({
      success: true,
      deleted: {
        customers: deletedCustomers.count,
        orders: deletedOrders.count,
        orderItems: deletedOrderItems.count,
        sessions: deletedSessions.count,
        messages: deletedMessages.count,
        priceOverrides: deletedOverrides.count,
      },
      kept: customersToKeep.map(c => ({ id: c.id, businessName: c.businessName }))
    })
  } catch (error) {
    console.error('[Cleanup Test Data API] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to cleanup data'
    }, { status: 500 })
  }
}

// GET - Preview what will be deleted
export async function GET() {
  try {
    const keepBusinessNames = [
      'Mi Familia Market',
    ]

    const allCustomers = await prisma.customer.findMany({
      select: {
        id: true,
        email: true,
        businessName: true,
        _count: { select: { orders: true } }
      }
    })

    const toKeep = allCustomers.filter(c =>
      keepBusinessNames.some(name =>
        c.businessName?.toLowerCase().includes(name.toLowerCase())
      )
    )
    const toDelete = allCustomers.filter(c =>
      !keepBusinessNames.some(name =>
        c.businessName?.toLowerCase().includes(name.toLowerCase())
      )
    )

    const totalOrders = await prisma.order.count({
      where: { customerId: { in: toDelete.map(c => c.id) } }
    })

    return NextResponse.json({
      preview: true,
      toKeep: toKeep.map(c => ({
        businessName: c.businessName,
        email: c.email,
        orders: c._count.orders
      })),
      toDelete: toDelete.map(c => ({
        businessName: c.businessName,
        email: c.email,
        orders: c._count.orders
      })),
      summary: {
        keepCount: toKeep.length,
        deleteCount: toDelete.length,
        ordersToDelete: totalOrders,
      }
    })
  } catch (error) {
    console.error('[Cleanup Preview] Error:', error)
    return NextResponse.json({ error: 'Failed to preview cleanup' }, { status: 500 })
  }
}
