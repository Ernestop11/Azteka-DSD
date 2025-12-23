import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/delivery/confirm/[token]
 * Get delivery details for customer confirmation (public - no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const confirmation = await prisma.deliveryConfirmation.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            customer: {
              select: { name: true },
            },
            OrderItem: {
              include: {
                Product: {
                  select: { id: true, name: true, imageUrl: true },
                },
              },
            },
          },
        },
      },
    })

    if (!confirmation) {
      return NextResponse.json(
        { error: 'Delivery confirmation not found or expired' },
        { status: 404 }
      )
    }

    // Check if already confirmed
    if (confirmation.confirmedAt && confirmation.customerSignature) {
      return NextResponse.json(
        { error: 'This delivery has already been confirmed' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data: {
        orderId: confirmation.orderId,
        orderNumber: confirmation.order?.orderNumber,
        customer: confirmation.order?.customer?.name,
        items: confirmation.order?.OrderItem.map((item) => ({
          id: item.id,
          productName: item.Product.name,
          productImage: item.Product.imageUrl,
          quantity: item.quantity,
        })),
        driverName: confirmation.driverName,
      },
    })
  } catch (error) {
    console.error('[GET /api/delivery/confirm/[token]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delivery' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/delivery/confirm/[token]
 * Submit customer confirmation (public - no auth required)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { confirmedItems, customerSignature, customerName, notes } = body

    const confirmation = await prisma.deliveryConfirmation.findUnique({
      where: { token },
      include: {
        order: true,
      },
    })

    if (!confirmation) {
      return NextResponse.json(
        { error: 'Delivery confirmation not found' },
        { status: 404 }
      )
    }

    // Check if already confirmed
    if (confirmation.confirmedAt && confirmation.customerSignature) {
      return NextResponse.json(
        { error: 'This delivery has already been confirmed' },
        { status: 400 }
      )
    }

    // Update confirmation record
    const updated = await prisma.deliveryConfirmation.update({
      where: { token },
      data: {
        confirmedItems: confirmedItems || [],
        customerSignature,
        customerName,
        notes,
        confirmedAt: new Date(),
      },
    })

    // Update order status to DELIVERED
    if (confirmation.orderId) {
      await prisma.order.update({
        where: { id: confirmation.orderId },
        data: { status: 'DELIVERED' },
      })

      // Mark any associated boxes as delivered
      await prisma.box.updateMany({
        where: { orderId: confirmation.orderId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      })

      // Complete any delivery tasks
      await prisma.task.updateMany({
        where: {
          orderId: confirmation.orderId,
          type: 'DELIVERY',
          status: { not: 'COMPLETED' },
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })
    }

    // Check for issues
    const hasIssues = confirmedItems?.some(
      (item: { issue?: string }) => item.issue
    )

    if (hasIssues) {
      // Log issues for follow-up
      console.log(`[Delivery ${confirmation.orderId}] Issues reported:`, confirmedItems)
      // TODO: Create a follow-up task or notification for issues
    }

    return NextResponse.json({
      data: {
        success: true,
        orderId: confirmation.orderId,
        confirmedAt: updated.confirmedAt,
        hasIssues,
      },
    })
  } catch (error) {
    console.error('[POST /api/delivery/confirm/[token]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm delivery' },
      { status: 500 }
    )
  }
}
