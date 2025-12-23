import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '../../../lib/auth'

// PUT /api/admin/price-overrides/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const body = await request.json()
    const {
      overrideType,
      fixedPrice,
      discountPercent,
      discountAmount,
      minQuantity,
      maxQuantity,
      contractNumber,
      notes,
      startDate,
      endDate,
      active,
    } = body

    const override = await prisma.customerPriceOverride.findUnique({
      where: { id: params.id },
    })

    if (!override) {
      return NextResponse.json(
        { error: 'Price override not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (overrideType !== undefined) updateData.overrideType = overrideType
    if (fixedPrice !== undefined)
      updateData.fixedPrice = fixedPrice ? parseFloat(fixedPrice) : null
    if (discountPercent !== undefined)
      updateData.discountPercent = discountPercent
        ? parseFloat(discountPercent)
        : null
    if (discountAmount !== undefined)
      updateData.discountAmount = discountAmount
        ? parseFloat(discountAmount)
        : null
    if (minQuantity !== undefined)
      updateData.minQuantity = minQuantity ? parseInt(minQuantity) : null
    if (maxQuantity !== undefined)
      updateData.maxQuantity = maxQuantity ? parseInt(maxQuantity) : null
    if (contractNumber !== undefined) updateData.contractNumber = contractNumber
    if (notes !== undefined) updateData.notes = notes
    if (startDate !== undefined)
      updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null
    if (active !== undefined) updateData.active = active

    const updated = await prisma.customerPriceOverride.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            businessName: true,
            priceTier: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: updated,
      message: 'Price override updated',
    })
  } catch (error) {
    console.error('Error updating price override:', error)
    return NextResponse.json(
      { error: 'Failed to update price override' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/price-overrides/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const override = await prisma.customerPriceOverride.findUnique({
      where: { id: params.id },
    })

    if (!override) {
      return NextResponse.json(
        { error: 'Price override not found' },
        { status: 404 }
      )
    }

    await prisma.customerPriceOverride.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Price override deleted',
    })
  } catch (error) {
    console.error('Error deleting price override:', error)
    return NextResponse.json(
      { error: 'Failed to delete price override' },
      { status: 500 }
    )
  }
}




