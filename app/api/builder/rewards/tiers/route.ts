import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all reward tiers
export async function GET() {
  try {
    const tiers = await prisma.rewardTier.findMany({
      orderBy: { position: 'asc' },
    })

    const transformed = tiers.map(tier => ({
      ...tier,
      minSpend: Number(tier.minSpend),
    }))

    return NextResponse.json({ data: transformed })
  } catch (error: any) {
    console.error('[Reward Tiers API] Error:', error)
    return NextResponse.json({ data: [] })
  }
}

// POST - Create a new reward tier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, minSpend, color, multiplier } = body

    // Get the next position
    const lastTier = await prisma.rewardTier.findFirst({
      orderBy: { position: 'desc' }
    })
    const position = (lastTier?.position || 0) + 1

    const tier = await prisma.rewardTier.create({
      data: {
        name,
        minSpend: minSpend || 0,
        color: color || '#6b7280',
        multiplier: multiplier || 1.0,
        position,
        active: true,
      }
    })

    return NextResponse.json({ data: { ...tier, minSpend: Number(tier.minSpend) } }, { status: 201 })
  } catch (error: any) {
    console.error('[Reward Tiers API] POST Error:', error)
    return NextResponse.json({ error: 'Failed to create tier' }, { status: 500 })
  }
}

// PUT - Update tier positions (reorder)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tiers } = body // Array of { id, position }

    await prisma.$transaction(
      tiers.map((t: { id: string; position: number }) =>
        prisma.rewardTier.update({
          where: { id: t.id },
          data: { position: t.position }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Reward Tiers API] PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update tier positions' }, { status: 500 })
  }
}
