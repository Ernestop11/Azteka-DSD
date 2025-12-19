import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { revalidateTag, revalidatePath } from 'next/cache'

const VALID_STATUSES = ['pending', 'picking', 'packed', 'shipped', 'delivered']

/**
 * PATCH /api/employee/orders/[id]/status
 * Updates the status of an order
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status.toLowerCase() },
      select: {
        id: true,
        status: true,
        customerName: true,
        updatedAt: true
      }
    })

    // Revalidate caches
    revalidateTag('orders')
    revalidatePath('/employee/orders')

    return NextResponse.json({
      data: updatedOrder,
      message: `Order status updated to ${status}`
    })
  } catch (error: any) {
    console.error('[PATCH /api/employee/orders/[id]/status] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update order status', details: error.message },
      { status: 500 }
    )
  }
}
