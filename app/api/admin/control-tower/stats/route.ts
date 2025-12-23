import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/admin/control-tower/stats
 * Get dashboard statistics for Ana's Control Tower
 */
export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      pendingTasks,
      inProgressTasks,
      completedToday,
      activeEmployees,
      ordersToday,
      ordersDelivered,
    ] = await Promise.all([
      // Pending tasks
      prisma.task.count({
        where: { status: 'PENDING' }
      }),

      // In-progress tasks
      prisma.task.count({
        where: { status: 'IN_PROGRESS' }
      }),

      // Tasks completed today
      prisma.task.count({
        where: {
          status: 'COMPLETED',
          completedAt: { gte: today }
        }
      }),

      // Active employees (clocked in today, not clocked out)
      prisma.timeEntry.count({
        where: {
          clockIn: { gte: today },
          clockOut: null
        }
      }),

      // Orders created today
      prisma.order.count({
        where: { createdAt: { gte: today } }
      }),

      // Orders delivered today
      prisma.order.count({
        where: {
          createdAt: { gte: today },
          status: 'delivered'
        }
      }),
    ])

    return NextResponse.json({
      data: {
        pendingTasks,
        inProgressTasks,
        completedToday,
        activeEmployees,
        ordersToday,
        ordersDelivered,
      }
    })
  } catch (error: any) {
    console.error('[GET /api/admin/control-tower/stats] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    )
  }
}
