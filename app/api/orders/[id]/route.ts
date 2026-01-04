import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        Customer: {
          select: { id: true, businessName: true }
        },
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
        deliveryConfirmation: {
          select: {
            id: true,
            driverSignature: true,
            customerSignature: true,
            confirmedItems: true,
            driverName: true,
            customerName: true,
            notes: true,
            hasIssues: true,
            createdAt: true,
            confirmedAt: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Format the response with delivery story
    const formattedOrder = {
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      status: order.status,
      total: Number(order.total),
      customerName: order.Customer?.businessName || order.customerName,
      customerId: order.customerId,
      notes: order.notes,
      items: order.OrderItem.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.Product?.name || 'Unknown Product',
        productSku: item.Product?.sku || '',
        productImage: item.Product?.imageUrl || null,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity
      })),
      // Delivery confirmation details for order story
      delivery: order.deliveryConfirmation ? {
        id: order.deliveryConfirmation.id,
        hasDriverSignature: !!order.deliveryConfirmation.driverSignature,
        hasCustomerSignature: !!order.deliveryConfirmation.customerSignature,
        driverName: order.deliveryConfirmation.driverName,
        customerName: order.deliveryConfirmation.customerName,
        notes: order.deliveryConfirmation.notes,
        hasIssues: order.deliveryConfirmation.hasIssues,
        confirmedItems: order.deliveryConfirmation.confirmedItems,
        deliveryStarted: order.deliveryConfirmation.createdAt?.toISOString(),
        confirmedAt: order.deliveryConfirmation.confirmedAt?.toISOString()
      } : null
    }

    return NextResponse.json({ order: formattedOrder })
  } catch (error) {
    console.error('[Order Detail API] Error:', error)
    return NextResponse.json({ error: 'Failed to load order' }, { status: 500 })
  }
}
