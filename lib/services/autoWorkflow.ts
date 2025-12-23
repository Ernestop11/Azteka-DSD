/**
 * Auto-Workflow Engine for Azteka DSD
 *
 * Handles automatic task creation and assignment when orders come in:
 * 1. New order → Create PICKING task
 * 2. Auto-assign to available warehouse employee (round-robin)
 * 3. Auto-print picking list
 * 4. Track status through picking → packing → delivery
 */

import prisma from '@/lib/prisma'
import { printPickingList } from './autoPrint'

// Task priorities based on order type or customer tier
type Priority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'

interface WorkflowResult {
  success: boolean
  taskId?: string
  assigneeId?: string
  assigneeName?: string
  printed?: boolean
  error?: string
}

/**
 * Main entry point: Process a new order through the workflow
 */
export async function processNewOrder(orderId: string): Promise<WorkflowResult> {
  try {
    // 1. Get order details (Order model doesn't have customer relation)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        OrderItem: {
          include: { Product: true },
        },
      },
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // 2. Determine priority based on customer or order properties
    const priority = determineOrderPriority(order)

    // 3. Create picking task
    const task = await createPickingTask(orderId, priority)

    // 4. Auto-assign to available warehouse employee
    const assignment = await autoAssignTask(task.id)

    // 5. Auto-print picking list
    let printed = false
    if (process.env.AUTO_PRINT_ENABLED !== 'false') {
      const printResult = await printPickingList(orderId, priority, 1)
      printed = printResult.success

      if (printed) {
        // Mark task as auto-printed
        await prisma.task.update({
          where: { id: task.id },
          data: { autoPrinted: true },
        })
      }
    }

    // 6. Log the workflow event
    await logWorkflowEvent(orderId, 'ORDER_PROCESSED', {
      taskId: task.id,
      assigneeId: assignment.assigneeId,
      priority,
      printed,
    })

    return {
      success: true,
      taskId: task.id,
      assigneeId: assignment.assigneeId,
      assigneeName: assignment.assigneeName,
      printed,
    }
  } catch (error) {
    console.error('[processNewOrder] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Workflow processing failed',
    }
  }
}

/**
 * Determine order priority based on customer tier, order value, or urgency flags
 */
function determineOrderPriority(order: {
  total?: unknown
  notes?: string | null
}): Priority {
  // Check for explicit urgency in notes
  if (order.notes?.toLowerCase().includes('urgent') ||
      order.notes?.toLowerCase().includes('rush')) {
    return 'URGENT'
  }

  // Check order value (high-value orders get priority)
  const total = Number(order.total) || 0
  if (total > 1000) {
    return 'HIGH'
  }

  return 'NORMAL'
}

/**
 * Create a picking task for an order
 */
async function createPickingTask(
  orderId: string,
  priority: Priority
): Promise<{ id: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  })

  const task = await prisma.task.create({
    data: {
      type: 'PICKING',
      title: `Pick Order ${orderId.slice(-8).toUpperCase()}`,
      description: order?.customerName
        ? `Customer: ${order.customerName}`
        : 'Walk-in order',
      orderId,
      status: 'PENDING',
      priority,
    },
  })

  return { id: task.id }
}

/**
 * Auto-assign a task to an available warehouse employee
 * Uses round-robin assignment based on current workload
 */
async function autoAssignTask(taskId: string): Promise<{
  assigneeId?: string
  assigneeName?: string
}> {
  // Get available warehouse employees (clocked in today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const availableEmployees = await prisma.employee.findMany({
    where: {
      role: 'WAREHOUSE',
      active: true,
      // Check if they have a clock-in today without clock-out
      timeEntries: {
        some: {
          clockIn: { gte: today },
          clockOut: null,
        },
      },
    },
    include: {
      tasks: {
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      },
    },
    orderBy: {
      tasks: {
        _count: 'asc', // Prioritize employees with fewer active tasks
      },
    },
  })

  if (availableEmployees.length === 0) {
    // No one clocked in - leave unassigned for manual assignment
    console.log('[autoAssignTask] No warehouse employees available')
    return {}
  }

  // Assign to employee with least active tasks (round-robin-ish)
  const assignee = availableEmployees[0]

  await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId: assignee.id },
  })

  // Log the assignment activity
  await prisma.employeeActivity.create({
    data: {
      employeeId: assignee.id,
      action: 'TASK_ASSIGNED',
      details: `Auto-assigned picking task ${taskId}`,
    },
  })

  return {
    assigneeId: assignee.id,
    assigneeName: `${assignee.firstName} ${assignee.lastName}`,
  }
}

/**
 * Log a workflow event for tracking
 */
async function logWorkflowEvent(
  orderId: string,
  event: string,
  details: Record<string, unknown>
): Promise<void> {
  // For now, just console log - could be expanded to a dedicated events table
  console.log(`[Workflow] ${event}:`, {
    orderId,
    timestamp: new Date().toISOString(),
    ...details,
  })
}

/**
 * Re-assign a task to a different employee
 */
export async function reassignTask(
  taskId: string,
  newAssigneeId: string
): Promise<WorkflowResult> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true },
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    const newAssignee = await prisma.employee.findUnique({
      where: { id: newAssigneeId },
    })

    if (!newAssignee) {
      return { success: false, error: 'Employee not found' }
    }

    // Update task assignment
    await prisma.task.update({
      where: { id: taskId },
      data: { assigneeId: newAssigneeId },
    })

    // Log the reassignment
    if (task.assignee) {
      await prisma.employeeActivity.create({
        data: {
          employeeId: task.assignee.id,
          action: 'TASK_UNASSIGNED',
          details: `Task ${taskId} reassigned to ${newAssignee.firstName}`,
        },
      })
    }

    await prisma.employeeActivity.create({
      data: {
        employeeId: newAssigneeId,
        action: 'TASK_ASSIGNED',
        details: `Task ${taskId} assigned`,
      },
    })

    return {
      success: true,
      taskId,
      assigneeId: newAssigneeId,
      assigneeName: `${newAssignee.firstName} ${newAssignee.lastName}`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Reassignment failed',
    }
  }
}

/**
 * Complete a picking task and move order to next stage
 */
export async function completePickingTask(taskId: string): Promise<WorkflowResult> {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { order: true },
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    if (task.status === 'COMPLETED') {
      return { success: false, error: 'Task already completed' }
    }

    // Mark task as completed
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    // Update order status to PICKED
    if (task.orderId) {
      await prisma.order.update({
        where: { id: task.orderId },
        data: { status: 'PICKED' },
      })

      // Create packing task
      const packingTask = await prisma.task.create({
        data: {
          type: 'PACKING',
          title: `Pack Order ${task.order?.orderNumber || task.orderId.slice(-8)}`,
          orderId: task.orderId,
          status: 'PENDING',
          priority: task.priority,
        },
      })

      // Auto-assign packing task to same employee if available
      if (task.assigneeId) {
        await prisma.task.update({
          where: { id: packingTask.id },
          data: { assigneeId: task.assigneeId },
        })
      }

      return {
        success: true,
        taskId: packingTask.id,
        assigneeId: task.assigneeId || undefined,
      }
    }

    return { success: true, taskId }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to complete task',
    }
  }
}

/**
 * Get workflow status for an order
 */
export async function getOrderWorkflowStatus(orderId: string): Promise<{
  order: { id: string; status: string; orderNumber?: string }
  tasks: Array<{
    id: string
    type: string
    status: string
    assignee?: string
    startedAt?: Date
    completedAt?: Date
  }>
  currentStage: string
}> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      Task: {
        include: { assignee: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  const tasks = order.Task.map((t) => ({
    id: t.id,
    type: t.type,
    status: t.status,
    assignee: t.assignee
      ? `${t.assignee.firstName} ${t.assignee.lastName}`
      : undefined,
    startedAt: t.startedAt || undefined,
    completedAt: t.completedAt || undefined,
  }))

  // Determine current stage
  let currentStage = 'NEW'
  if (tasks.some((t) => t.type === 'PICKING' && t.status === 'IN_PROGRESS')) {
    currentStage = 'PICKING'
  } else if (tasks.some((t) => t.type === 'PICKING' && t.status === 'COMPLETED')) {
    if (tasks.some((t) => t.type === 'PACKING' && t.status === 'IN_PROGRESS')) {
      currentStage = 'PACKING'
    } else if (tasks.some((t) => t.type === 'PACKING' && t.status === 'COMPLETED')) {
      currentStage = 'READY_FOR_DELIVERY'
    } else {
      currentStage = 'PICKED'
    }
  }

  return {
    order: {
      id: order.id,
      status: order.status,
      orderNumber: order.orderNumber || undefined,
    },
    tasks,
    currentStage,
  }
}

/**
 * Get dashboard stats for Ana's control tower
 */
export async function getDashboardStats(): Promise<{
  pendingTasks: number
  inProgressTasks: number
  completedToday: number
  activeEmployees: number
  ordersToday: number
  ordersDelivered: number
}> {
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
    prisma.task.count({ where: { status: 'PENDING' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: today },
      },
    }),
    prisma.timeEntry.count({
      where: {
        clockIn: { gte: today },
        clockOut: null,
      },
    }),
    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: today },
        status: 'DELIVERED',
      },
    }),
  ])

  return {
    pendingTasks,
    inProgressTasks,
    completedToday,
    activeEmployees,
    ordersToday,
    ordersDelivered,
  }
}
