import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/work-orders
 * Get all work orders with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')

    const workOrders = await prisma.workOrder.findMany({
      where: {
        ...(status && { status }),
        ...(type && { type }),
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            imageUrl: true,
            price: true,
            cost: true,
            landedCost: true,
            suggestedPrice: true,
            needsReview: true,
            Category: { select: { id: true, name: true } },
            Brand: { select: { id: true, name: true } },
            Vendor: { select: { id: true, name: true } },
          },
        },
        // purchaseOrderId is stored, but no relation defined
        // We'll fetch PO separately if needed
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { priority: 'desc' }, // Higher priority first
        { createdAt: 'desc' },
      ],
      take: limit,
    })

    // Get counts by status
    const counts = await prisma.workOrder.groupBy({
      by: ['status'],
      _count: true,
    })

    const stats = {
      pending: counts.find(c => c.status === 'PENDING')?._count || 0,
      inProgress: counts.find(c => c.status === 'IN_PROGRESS')?._count || 0,
      completed: counts.find(c => c.status === 'COMPLETED')?._count || 0,
      total: counts.reduce((sum, c) => sum + c._count, 0),
    }

    return NextResponse.json({
      data: workOrders,
      stats,
    })
  } catch (error: unknown) {
    console.error('[GET /api/admin/work-orders] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch work orders', details: message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/work-orders
 * Update a work order status
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, assigneeId, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Work order ID is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (status) {
      updateData.status = status
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId
    if (notes !== undefined) {
      const existing = await prisma.workOrder.findUnique({
        where: { id },
        select: { metadata: true },
      })
      updateData.metadata = {
        ...(existing?.metadata as object || {}),
        notes,
      }
    }

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    })

    return NextResponse.json({ data: workOrder })
  } catch (error: unknown) {
    console.error('[PUT /api/admin/work-orders] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update work order', details: message },
      { status: 500 }
    )
  }
}
