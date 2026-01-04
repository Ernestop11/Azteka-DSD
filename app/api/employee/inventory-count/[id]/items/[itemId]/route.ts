import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/employee/inventory-count/[id]/items/[itemId] - Verify, correct, or flag item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params
    const body = await request.json()

    const {
      action, // 'verify', 'recount', 'correct', 'clear_flag', 'set_expiration'
      checkerId,
      correctedTotal,
      correctionNote,
      expirationDate,
      needsDateCheck
    } = body

    const item = await prisma.inventoryCountItem.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = {}

    switch (action) {
      case 'verify':
        // Checker approves the count
        if (!checkerId) {
          return NextResponse.json(
            { error: 'checkerId required for verification' },
            { status: 400 }
          )
        }
        updateData.status = 'VERIFIED'
        updateData.checkerId = checkerId
        updateData.verifiedAt = new Date()
        break

      case 'recount':
        // Checker flags for recount
        if (!checkerId) {
          return NextResponse.json(
            { error: 'checkerId required' },
            { status: 400 }
          )
        }
        updateData.status = 'RECOUNT_NEEDED'
        updateData.checkerId = checkerId
        if (correctionNote) updateData.correctionNote = correctionNote
        break

      case 'correct':
        // Checker corrects the count
        if (!checkerId || correctedTotal === undefined) {
          return NextResponse.json(
            { error: 'checkerId and correctedTotal required for correction' },
            { status: 400 }
          )
        }
        if (!correctionNote) {
          return NextResponse.json(
            { error: 'correctionNote required when correcting' },
            { status: 400 }
          )
        }
        // Save original count before overwriting
        updateData.originalCount = item.countedTotal
        updateData.countedTotal = correctedTotal
        updateData.variance = correctedTotal - item.expectedQuantity
        updateData.status = 'CORRECTED'
        updateData.checkerId = checkerId
        updateData.correctionNote = correctionNote
        updateData.verifiedAt = new Date()
        break

      case 'clear_flag':
        // Clear the "needs date check" flag
        updateData.needsDateCheck = false
        if (expirationDate) {
          updateData.expirationDate = new Date(expirationDate)
        }
        break

      case 'set_expiration':
        // Set expiration date
        updateData.expirationDate = expirationDate ? new Date(expirationDate) : null
        if (needsDateCheck !== undefined) {
          updateData.needsDateCheck = needsDateCheck
        }
        break

      default:
        // Generic update (for partial updates)
        if (needsDateCheck !== undefined) updateData.needsDateCheck = needsDateCheck
        if (expirationDate !== undefined) {
          updateData.expirationDate = expirationDate ? new Date(expirationDate) : null
        }
    }

    const updatedItem = await prisma.inventoryCountItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        counter: {
          select: { id: true, firstName: true, lastName: true }
        },
        checker: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    })

    return NextResponse.json({ item: updatedItem })
  } catch (error) {
    console.error('Failed to update inventory count item:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory count item' },
      { status: 500 }
    )
  }
}

// DELETE /api/employee/inventory-count/[id]/items/[itemId] - Delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params

    await prisma.inventoryCountItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete inventory count item:', error)
    return NextResponse.json(
      { error: 'Failed to delete inventory count item' },
      { status: 500 }
    )
  }
}
