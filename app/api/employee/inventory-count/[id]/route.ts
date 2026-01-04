import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/employee/inventory-count/[id] - Get single count session with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const count = await prisma.inventoryCount.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            counter: {
              select: { id: true, firstName: true, lastName: true }
            },
            checker: {
              select: { id: true, firstName: true, lastName: true }
            }
          },
          orderBy: { countedAt: 'desc' }
        },
        _count: {
          select: { items: true }
        }
      }
    })

    if (!count) {
      return NextResponse.json(
        { error: 'Inventory count not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to fetch inventory count:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory count' },
      { status: 500 }
    )
  }
}

// PATCH /api/employee/inventory-count/[id] - Update count session (close, add notes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, totalCases, totalCapitalCost, totalCapitalSell } = body

    const updateData: Record<string, unknown> = {}

    if (notes !== undefined) updateData.notes = notes
    if (totalCases !== undefined) updateData.totalCases = totalCases
    if (totalCapitalCost !== undefined) updateData.totalCapitalCost = totalCapitalCost
    if (totalCapitalSell !== undefined) updateData.totalCapitalSell = totalCapitalSell

    if (status === 'CLOSED') {
      updateData.status = 'CLOSED'
      updateData.closedAt = new Date()
    } else if (status === 'ARCHIVED') {
      updateData.status = 'ARCHIVED'
    }

    const count = await prisma.inventoryCount.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to update inventory count:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory count' },
      { status: 500 }
    )
  }
}

// DELETE /api/employee/inventory-count/[id] - Delete count session (only if empty/cancelled)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if there are items
    const count = await prisma.inventoryCount.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } }
    })

    if (!count) {
      return NextResponse.json(
        { error: 'Inventory count not found' },
        { status: 404 }
      )
    }

    if (count._count.items > 0) {
      return NextResponse.json(
        { error: 'Cannot delete count session with items. Archive it instead.' },
        { status: 400 }
      )
    }

    await prisma.inventoryCount.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete inventory count:', error)
    return NextResponse.json(
      { error: 'Failed to delete inventory count' },
      { status: 500 }
    )
  }
}
