import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST /api/employee/picks
 * Log a pick action for activity tracking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, itemId, productId, action = 'PICK_ITEM' } = body

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Get task details for logging
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        order: true,
        assignee: true,
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Get product details if provided
    let productDetails = null
    if (productId || itemId) {
      const orderItem = itemId
        ? await prisma.orderItem.findUnique({
            where: { id: itemId },
            include: { Product: true },
          })
        : null

      productDetails = orderItem?.Product
    }

    // Log the activity (using EmployeeActivity if user is linked)
    // For now, we'll just return success
    // TODO: Link employee to user and log EmployeeActivity

    console.log(`[PICK] Task ${taskId}: ${action} - Product: ${productDetails?.name || 'Unknown'}`)

    return NextResponse.json({
      success: true,
      logged: {
        taskId,
        itemId,
        action,
        productName: productDetails?.name,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[POST /api/employee/picks] Error:', error)
    return NextResponse.json(
      { error: 'Failed to log pick action' },
      { status: 500 }
    )
  }
}
