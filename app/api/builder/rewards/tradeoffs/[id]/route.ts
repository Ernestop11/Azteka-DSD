import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get single trade-off deal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deal = await prisma.tradeOffDeal.findUnique({
      where: { id },
    })

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        ...deal,
        rewardPrice: Number(deal.rewardPrice),
        minSpend: Number(deal.minSpend),
      }
    })
  } catch (error: unknown) {
    console.error('[Trade-Off Deal API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 })
  }
}

// PUT - Update trade-off deal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      rewardProductId,
      rewardBrandId,
      rewardPrice,
      rewardMaxQty,
      requirementType,
      minSpend,
      excludeBrandId,
      excludeCategoryId,
      startDate,
      endDate,
      active,
    } = body

    const deal = await prisma.tradeOffDeal.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(rewardProductId !== undefined && { rewardProductId }),
        ...(rewardBrandId !== undefined && { rewardBrandId }),
        ...(rewardPrice !== undefined && { rewardPrice }),
        ...(rewardMaxQty !== undefined && { rewardMaxQty }),
        ...(requirementType !== undefined && { requirementType }),
        ...(minSpend !== undefined && { minSpend }),
        ...(excludeBrandId !== undefined && { excludeBrandId }),
        ...(excludeCategoryId !== undefined && { excludeCategoryId }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json({
      data: {
        ...deal,
        rewardPrice: Number(deal.rewardPrice),
        minSpend: Number(deal.minSpend),
      }
    })
  } catch (error: unknown) {
    console.error('[Trade-Off Deal API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
  }
}

// DELETE - Delete trade-off deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.tradeOffDeal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Trade-Off Deal API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
  }
}
