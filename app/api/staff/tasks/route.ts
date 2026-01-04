import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// GET /api/staff/tasks - Get tasks for current employee
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('employee_session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let employeeId: string
    try {
      const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      if (!sessionData.employeeId || sessionData.exp < Date.now()) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
      employeeId = sessionData.employeeId
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Get pending and assigned tasks for this employee
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: employeeId,
        status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get count of new tasks (assigned in last 5 minutes that haven't been acknowledged)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const newTasks = tasks.filter(t =>
      t.status === 'PENDING' &&
      new Date(t.createdAt) > fiveMinutesAgo
    )

    return NextResponse.json({
      tasks,
      newTaskCount: newTasks.length,
      hasNewTasks: newTasks.length > 0
    })
  } catch (error) {
    console.error('Staff tasks error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/staff/tasks - Acknowledge or update task status
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('employee_session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let employeeId: string
    try {
      const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      if (!sessionData.employeeId || sessionData.exp < Date.now()) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 })
      }
      employeeId = sessionData.employeeId
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const { taskId, action } = await request.json()

    if (!taskId || !action) {
      return NextResponse.json({ error: 'taskId and action required' }, { status: 400 })
    }

    // Verify task belongs to this employee
    const task = await prisma.task.findFirst({
      where: { id: taskId, assigneeId: employeeId }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    let newStatus: string = task.status
    let startedAt = task.startedAt
    let completedAt = task.completedAt

    switch (action) {
      case 'acknowledge':
        newStatus = 'ASSIGNED'
        break
      case 'start':
        newStatus = 'IN_PROGRESS'
        startedAt = new Date()
        break
      case 'complete':
        newStatus = 'COMPLETED'
        completedAt = new Date()
        break
      case 'queue':
        newStatus = 'ASSIGNED'
        break
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus as any,
        startedAt,
        completedAt
      }
    })

    return NextResponse.json({ task: updated })
  } catch (error) {
    console.error('Staff task update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
