import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/admin/control-tower/tasks
 * Get active tasks for Ana's Control Tower
 */
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      },
      include: {
        assignee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: 20
    })

    const formatted = tasks.map(task => ({
      id: task.id,
      type: task.type,
      title: task.title,
      status: task.status,
      priority: task.priority,
      orderId: task.orderId,
      assignee: task.assignee
        ? `${task.assignee.firstName} ${task.assignee.lastName}`
        : undefined,
      startedAt: task.startedAt?.toISOString()
    }))

    return NextResponse.json({ data: formatted })
  } catch (error: any) {
    console.error('[GET /api/admin/control-tower/tasks] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error.message },
      { status: 500 }
    )
  }
}
