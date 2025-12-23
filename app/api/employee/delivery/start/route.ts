import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateDeliveryConfirmationQR } from '@/lib/services/qrGenerator'

/**
 * POST /api/employee/delivery/start
 * Start a delivery - generates customer confirmation QR code
 *
 * Body: { orderId: string, driverId?: string, driverName?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, driverId, driverName } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      )
    }

    // Check if order exists and is in valid state
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: {
          include: {
            Product: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status to shipped
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'shipped' },
    })

    // Get or create delivery confirmation record
    let confirmation = await prisma.deliveryConfirmation.findUnique({
      where: { orderId },
    })

    if (!confirmation) {
      confirmation = await prisma.deliveryConfirmation.create({
        data: {
          orderId,
          driverId,
          driverName,
        },
      })
    } else if (driverId || driverName) {
      // Update driver info if provided
      confirmation = await prisma.deliveryConfirmation.update({
        where: { orderId },
        data: {
          driverId: driverId || confirmation.driverId,
          driverName: driverName || confirmation.driverName,
        },
      })
    }

    // Generate QR code for customer confirmation
    const qrCode = await generateDeliveryConfirmationQR(orderId)

    // Update any delivery tasks to in_progress
    await prisma.task.updateMany({
      where: {
        orderId,
        type: 'DELIVERY',
        status: { not: 'COMPLETED' },
      },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    })

    return NextResponse.json({
      data: {
        orderId,
        orderNumber: orderId.slice(-8).toUpperCase(),
        customerName: order.customerName,
        confirmationToken: confirmation.token,
        confirmationUrl: qrCode.url,
        qrCodeDataUrl: qrCode.dataUrl,
        qrCodeSvg: qrCode.svg,
        items: order.OrderItem.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.Product.name,
          productImage: item.Product.imageUrl,
          quantity: item.quantity,
        })),
      },
    })
  } catch (error: any) {
    console.error('[POST /api/employee/delivery/start] Error:', error)
    return NextResponse.json(
      { error: 'Failed to start delivery', details: error.message },
      { status: 500 }
    )
  }
}
