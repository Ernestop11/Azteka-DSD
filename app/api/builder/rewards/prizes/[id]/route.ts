import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get single reward prize
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const prize = await prisma.rewardPrize.findUnique({
      where: { id },
    })

    if (!prize) {
      return NextResponse.json({ error: 'Prize not found' }, { status: 404 })
    }

    return NextResponse.json({ data: prize })
  } catch (error: unknown) {
    console.error('[Reward Prize API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch prize' }, { status: 500 })
  }
}

// PUT - Update reward prize
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, imageUrl, pointsCost, stock, active } = body

    const prize = await prisma.rewardPrize.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(pointsCost !== undefined && { pointsCost }),
        ...(stock !== undefined && { stock }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json({ data: prize })
  } catch (error: unknown) {
    console.error('[Reward Prize API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update prize' }, { status: 500 })
  }
}

// DELETE - Delete reward prize
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.rewardPrize.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Reward Prize API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete prize' }, { status: 500 })
  }
}
