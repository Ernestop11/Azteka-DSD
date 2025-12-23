import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/app/api/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/employee/receiving
 * Get active receiving task for the current employee or available unclaimed tasks
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First check for any task already claimed by this employee
    const myTask = await prisma.task.findFirst({
      where: {
        type: 'RECEIVING',
        status: 'IN_PROGRESS',
        assigneeId: user.id,
      },
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    imageUrl: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    if (myTask) {
      return NextResponse.json({
        data: {
          task: myTask,
          status: 'active',
        },
      })
    }

    // Check for unclaimed receiving tasks (PENDING status)
    const availableTasks = await prisma.task.findMany({
      where: {
        type: 'RECEIVING',
        status: 'PENDING',
        assigneeId: null,
      },
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
            _count: { select: { items: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      data: {
        availableTasks,
        status: 'available',
      },
    })
  } catch (error: unknown) {
    console.error('[GET /api/employee/receiving] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch receiving tasks', details: message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/employee/receiving
 * Claim a receiving task
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taskId } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    // Check if the task exists and is unclaimed
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        purchaseOrder: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.assigneeId) {
      return NextResponse.json(
        { error: 'Task already claimed by another employee' },
        { status: 400 }
      )
    }

    if (task.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Task is not available for claiming' },
        { status: 400 }
      )
    }

    // Claim the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assigneeId: user.id,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    imageUrl: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    })

    // Update PO status to RECEIVING
    if (task.purchaseOrderId) {
      await prisma.purchaseOrder.update({
        where: { id: task.purchaseOrderId },
        data: { status: 'RECEIVING' },
      })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'RECEIVING_CLAIMED',
        description: `Claimed receiving task for PO ${task.purchaseOrder?.poNumber || task.purchaseOrderId}`,
        metadata: {
          taskId,
          purchaseOrderId: task.purchaseOrderId,
        },
        employeeId: user.id,
      },
    })

    return NextResponse.json({ data: updatedTask })
  } catch (error: unknown) {
    console.error('[POST /api/employee/receiving] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to claim receiving task', details: message },
      { status: 500 }
    )
  }
}
