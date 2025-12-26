import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get single reward tier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tier = await prisma.rewardTier.findUnique({
      where: { id },
    })

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    return NextResponse.json({ data: { ...tier, minSpend: Number(tier.minSpend) } })
  } catch (error: unknown) {
    console.error('[Reward Tier API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch tier' }, { status: 500 })
  }
}

// PUT - Update reward tier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, minSpend, color, multiplier, active } = body

    const tier = await prisma.rewardTier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(minSpend !== undefined && { minSpend }),
        ...(color !== undefined && { color }),
        ...(multiplier !== undefined && { multiplier }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json({ data: { ...tier, minSpend: Number(tier.minSpend) } })
  } catch (error: unknown) {
    console.error('[Reward Tier API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 })
  }
}

// DELETE - Delete reward tier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.rewardTier.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Reward Tier API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete tier' }, { status: 500 })
  }
}
