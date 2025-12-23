import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/app/api/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * POST /api/employee/receiving/complete
 * Complete a receiving task
 *
 * - Updates PO status to RECEIVED
 * - Updates product stock levels
 * - Calculates landed costs
 * - Creates work orders for new products
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, notes } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        purchaseOrder: {
          include: {
            vendor: true,
            items: {
              include: {
                product: true,
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

    const po = task.purchaseOrder
    if (!po) {
      return NextResponse.json(
        { error: 'No purchase order associated with this task' },
        { status: 400 }
      )
    }

    // Calculate landed costs
    const totalProductCost = po.items.reduce(
      (sum, item) => sum + Number(item.totalCost),
      0
    )

    const shippingCost = Number(po.shippingCost || 0)
    const shippingRatio = totalProductCost > 0 ? shippingCost / totalProductCost : 0

    // Update each product's stock and landed cost
    const productUpdates: Array<{
      productId: string
      stockAdded: number
      landedCost: number
      suggestedPrice: number
    }> = []

    for (const item of po.items) {
      if (!item.productId || !item.product) continue

      // Calculate landed cost for this item
      const itemShippingAllocation = Number(item.totalCost) * shippingRatio
      const landedCostPerUnit =
        Number(item.unitCost) + itemShippingAllocation / item.quantityOrdered

      // Calculate sellable units
      const sellableUnits = item.sellableUnits || item.quantityReceived

      // Update product stock and costs
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: sellableUnits },
          inStock: true,
          landedCost: Math.round(landedCostPerUnit * 100) / 100,
          suggestedPrice: Math.round(landedCostPerUnit * 1.50 * 100) / 100, // 50% margin
          cost: Number(item.unitCost),
          // Clear needsReview if it was set (for new products that have been received)
          needsReview: false,
        },
      })

      productUpdates.push({
        productId: item.productId,
        stockAdded: sellableUnits,
        landedCost: Math.round(landedCostPerUnit * 100) / 100,
        suggestedPrice: Math.round(landedCostPerUnit * 1.50 * 100) / 100, // 50% margin
      })
    }

    // Update task as completed
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        notes: notes || null,
      },
    })

    // Update PO status
    await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: {
        status: 'RECEIVED',
        receivedDate: new Date(),
        receivedById: user.id,
      },
    })

    // Get new products that need catalog work
    const newProductItems = po.items.filter(
      (item) => item.isNewProduct && item.productId
    )

    // Ensure work orders exist for new products
    const existingWorkOrders = await prisma.workOrder.findMany({
      where: {
        purchaseOrderId: po.id,
        type: 'NEW_PRODUCT_CATALOG',
      },
    })

    const existingProductIds = new Set(
      existingWorkOrders
        .filter((wo) => wo.productId)
        .map((wo) => wo.productId as string)
    )

    // Create any missing work orders
    for (const item of newProductItems) {
      if (!item.productId || existingProductIds.has(item.productId)) continue

      await prisma.workOrder.create({
        data: {
          type: 'NEW_PRODUCT_CATALOG',
          title: `Add to catalog: ${item.description}`,
          description: `New product received from ${po.vendor?.name || 'vendor'}. Needs: SKU, category, brand, image, pricing.`,
          status: 'PENDING',
          priority: 'NORMAL',
          productId: item.productId,
          purchaseOrderId: po.id,
          metadata: {
            vendorId: po.vendorId,
            vendorName: po.vendor?.name,
            poNumber: po.poNumber,
            landedCost: productUpdates.find((u) => u.productId === item.productId)
              ?.landedCost,
            suggestedPrice: productUpdates.find(
              (u) => u.productId === item.productId
            )?.suggestedPrice,
          },
        },
      })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: 'RECEIVING_COMPLETED',
        description: `Completed receiving for PO ${po.poNumber || po.id.slice(0, 8)}`,
        metadata: {
          taskId,
          purchaseOrderId: po.id,
          itemCount: po.items.length,
          newProductCount: newProductItems.length,
          productUpdates,
        },
        employeeId: user.id,
      },
    })

    // Get work orders count
    const workOrderCount = await prisma.workOrder.count({
      where: {
        purchaseOrderId: po.id,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      data: {
        success: true,
        stats: {
          itemsReceived: po.items.length,
          productsUpdated: productUpdates.length,
          newProducts: newProductItems.length,
          workOrdersCreated: workOrderCount,
        },
        productUpdates,
      },
    })
  } catch (error: unknown) {
    console.error('[POST /api/employee/receiving/complete] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to complete receiving', details: message },
      { status: 500 }
    )
  }
}
