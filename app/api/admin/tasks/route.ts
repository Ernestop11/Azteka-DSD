import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assigneeId = searchParams.get('assigneeId')
    const type = searchParams.get('type')

    const where: any = {}
    if (status) where.status = status
    if (assigneeId) where.assigneeId = assigneeId
    if (type) where.type = type

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            Customer: { select: { storeName: true } }
          }
        }
      }
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Admin tasks list error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/admin/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      title,
      description,
      assigneeId,
      orderId,
      priority = 'NORMAL'
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        type: type || 'PICKING',
        title,
        description,
        assigneeId,
        orderId,
        priority,
        status: assigneeId ? 'PENDING' : 'PENDING'
      },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    console.log(`[TASK] Created task "${title}" for ${assigneeId || 'unassigned'}`)

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Admin task create error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
