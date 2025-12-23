import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/employee/tasks/[id]
 * Get a specific task with full details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            OrderItem: {
              include: {
                Product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    imageUrl: true,
                    warehouseLocation: true,
                    unitsPerCase: true,
                  },
                },
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('[GET /api/employee/tasks/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/employee/tasks/[id]
 * Update task status (start, complete, etc.)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, assigneeId } = body

    // Get current task
    const currentTask = await prisma.task.findUnique({
      where: { id },
    })

    if (!currentTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (status) {
      updateData.status = status

      // Set timestamps based on status
      if (status === 'IN_PROGRESS' && !currentTask.startedAt) {
        updateData.startedAt = new Date()
      }
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }

    if (assigneeId !== undefined) {
      updateData.assigneeId = assigneeId
      if (assigneeId && currentTask.status === 'PENDING') {
        updateData.status = 'ASSIGNED'
      }
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        order: true,
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // If task completed, update order status
    if (status === 'COMPLETED' && task.orderId) {
      await prisma.order.update({
        where: { id: task.orderId },
        data: {
          status: task.type === 'PICKING' ? 'PICKED' : task.type === 'PACKING' ? 'PACKED' : 'processing'
        },
      })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('[PUT /api/employee/tasks/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/employee/tasks/[id]
 * Cancel a task
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('[DELETE /api/employee/tasks/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel task' },
      { status: 500 }
    )
  }
}
