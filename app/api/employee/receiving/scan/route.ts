import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/app/api/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/employee/receiving/scan
 * Scan an item SKU during receiving
 *
 * Body: { taskId, sku, quantity?, lotNumber?, expirationDate?, location? }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      taskId,
      sku,
      quantity = 1,
      lotNumber,
      expirationDate,
      location,
      isMasterCase = false,
    } = body

    if (!taskId || !sku) {
      return NextResponse.json(
        { error: 'taskId and sku are required' },
        { status: 400 }
      )
    }

    // Get the task and verify ownership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
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
                    unitsPerCase: true,
                    masterCaseUnits: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.assigneeId !== user.id) {
      return NextResponse.json(
        { error: 'This task is not assigned to you' },
        { status: 403 }
      )
    }

    if (task.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Task is not in progress' },
        { status: 400 }
      )
    }

    const po = task.purchaseOrder
    if (!po) {
      return NextResponse.json(
        { error: 'No purchase order associated with this task' },
        { status: 400 }
      )
    }

    // Find the matching item by vendor SKU or internal SKU
    let matchedItem = po.items.find(
      (item) =>
        item.vendorSku.toLowerCase() === sku.toLowerCase() ||
        item.product?.sku?.toLowerCase() === sku.toLowerCase()
    )

    // If not found directly, try to find via VendorSkuMapping
    if (!matchedItem && po.vendorId) {
      const mapping = await prisma.vendorSkuMapping.findFirst({
        where: {
          vendorId: po.vendorId,
          OR: [
            { vendorSku: { equals: sku, mode: 'insensitive' } },
            { internalSku: { equals: sku, mode: 'insensitive' } },
          ],
        },
        include: {
          product: true,
        },
      })

      if (mapping?.productId) {
        matchedItem = po.items.find(
          (item) => item.productId === mapping.productId
        )
      }
    }

    if (!matchedItem) {
      return NextResponse.json(
        {
          error: 'Item not found on this PO',
          scannedSku: sku,
          suggestion: 'Check that the SKU is on this purchase order',
        },
        { status: 404 }
      )
    }

    // Calculate actual units to add
    let unitsToAdd = quantity

    // If it's a master case, multiply by the master case units
    if (isMasterCase && matchedItem.product?.masterCaseUnits) {
      unitsToAdd = quantity * matchedItem.product.masterCaseUnits
    }

    // Check if we're receiving more than ordered
    const newReceivedQty = matchedItem.quantityReceived + unitsToAdd
    const isOverReceiving = newReceivedQty > matchedItem.quantityOrdered

    // Update the item
    const updatedItem = await prisma.purchaseOrderItem.update({
      where: { id: matchedItem.id },
      data: {
        quantityReceived: newReceivedQty,
        receivedAt: new Date(),
        lotNumber: lotNumber || matchedItem.lotNumber,
        expirationDate: expirationDate
          ? new Date(expirationDate)
          : matchedItem.expirationDate,
        warehouseLocation: location || matchedItem.warehouseLocation,
      },
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
    })

    // Calculate total progress
    const allItems = await prisma.purchaseOrderItem.findMany({
      where: { purchaseOrderId: po.id },
    })

    const totalOrdered = allItems.reduce(
      (sum, item) => sum + item.quantityOrdered,
      0
    )
    const totalReceived = allItems.reduce(
      (sum, item) => sum + item.quantityReceived,
      0
    )
    const progress = Math.round((totalReceived / totalOrdered) * 100)

    // Check if all items are fully received
    const allComplete = allItems.every(
      (item) => item.quantityReceived >= item.quantityOrdered
    )

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'ITEM_RECEIVED',
        description: `Received ${unitsToAdd}x ${updatedItem.description} (${sku})`,
        metadata: {
          taskId,
          purchaseOrderId: po.id,
          itemId: matchedItem.id,
          sku,
          quantityReceived: unitsToAdd,
          isMasterCase,
          lotNumber,
        },
        employeeId: user.id,
      },
    })

    return NextResponse.json({
      data: {
        item: updatedItem,
        quantityAdded: unitsToAdd,
        newTotal: newReceivedQty,
        ordered: matchedItem.quantityOrdered,
        isComplete: newReceivedQty >= matchedItem.quantityOrdered,
        isOverReceiving,
        progress,
        allComplete,
      },
    })
  } catch (error: unknown) {
    console.error('[POST /api/employee/receiving/scan] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to process scan', details: message },
      { status: 500 }
    )
  }
}
