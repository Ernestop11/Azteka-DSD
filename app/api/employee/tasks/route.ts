import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/employee/tasks
 * Fetch tasks for the current employee
 * Query params: type, status (comma-separated)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // e.g., "PICKING"
    const statuses = searchParams.get('status')?.split(',') // e.g., "PENDING,IN_PROGRESS"

    // Build where clause
    const where: Record<string, unknown> = {}

    if (type) {
      where.type = type
    }

    if (statuses && statuses.length > 0) {
      where.status = { in: statuses }
    }

    // Fetch tasks with order and items
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { priority: 'desc' }, // URGENT first
        { createdAt: 'asc' }, // Oldest first
      ],
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
          },
        },
      },
    })

    // Transform tasks for the picking UI
    const transformedTasks = tasks.map((task) => ({
      id: task.id,
      orderId: task.orderId || '',
      customerName: task.order?.customerName || 'Unknown',
      priority: task.priority,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
      assignee: task.assignee
        ? `${task.assignee.firstName} ${task.assignee.lastName}`
        : null,
      items: task.order?.OrderItem.map((item) => ({
        id: item.id,
        productId: item.Product.id,
        productName: item.Product.name,
        productSku: item.Product.sku,
        productImage: item.Product.imageUrl,
        quantity: item.quantity,
        location: item.Product.warehouseLocation,
        picked: false, // TODO: Track picked status per item
      })) || [],
    }))

    return NextResponse.json({ tasks: transformedTasks })
  } catch (error) {
    console.error('[GET /api/employee/tasks] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/employee/tasks
 * Create a new task (usually auto-created when order comes in)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, type = 'PICKING', priority = 'NORMAL', assigneeId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        type,
        title: `Pick order for ${order.customerName}`,
        orderId,
        priority,
        assigneeId,
        status: assigneeId ? 'ASSIGNED' : 'PENDING',
      },
      include: {
        order: true,
        assignee: true,
      },
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('[POST /api/employee/tasks] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
