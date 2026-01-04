import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET single adjustment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adjustment = await prisma.payrollAdjustment.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    if (!adjustment) {
      return NextResponse.json({ error: 'Adjustment not found' }, { status: 404 })
    }

    return NextResponse.json(adjustment)
  } catch (error) {
    console.error('Error fetching adjustment:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Update adjustment (approve, reject, edit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { amount, description, status, approvedBy } = body

    const updateData: any = {}

    if (amount !== undefined) updateData.amount = amount
    if (description !== undefined) updateData.description = description
    if (status) {
      updateData.status = status
      if (status === 'APPROVED' && approvedBy) {
        updateData.approvedBy = approvedBy
        updateData.approvedAt = new Date()
      }
    }

    const updated = await prisma.payrollAdjustment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating adjustment:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Remove adjustment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.payrollAdjustment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting adjustment:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
