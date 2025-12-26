import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all reward prizes
export async function GET() {
  try {
    const prizes = await prisma.rewardPrize.findMany({
      orderBy: { pointsCost: 'asc' },
    })

    return NextResponse.json({ data: prizes })
  } catch (error: any) {
    console.error('[Reward Prizes API] Error:', error)
    return NextResponse.json({ data: [] })
  }
}

// POST - Create a new reward prize
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, imageUrl, pointsCost, stock } = body

    const prize = await prisma.rewardPrize.create({
      data: {
        name,
        description,
        imageUrl,
        pointsCost: pointsCost || 100,
        stock: stock || 0,
        active: true,
      }
    })

    return NextResponse.json({ data: prize }, { status: 201 })
  } catch (error: any) {
    console.error('[Reward Prizes API] POST Error:', error)
    return NextResponse.json({ error: 'Failed to create prize' }, { status: 500 })
  }
}
