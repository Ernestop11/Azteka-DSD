import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all trade-off deals
export async function GET() {
  try {
    const tradeoffs = await prisma.tradeOffDeal.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const transformed = tradeoffs.map(deal => ({
      ...deal,
      rewardPrice: Number(deal.rewardPrice),
      minSpend: Number(deal.minSpend),
    }))

    return NextResponse.json({ data: transformed })
  } catch (error: any) {
    console.error('[Trade-Off Deals API] Error:', error)
    return NextResponse.json({ data: [] })
  }
}

// POST - Create a new trade-off deal
export async function POST(request: NextRequest) {
  try {
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
    } = body

    const deal = await prisma.tradeOffDeal.create({
      data: {
        name,
        description,
        rewardProductId,
        rewardBrandId,
        rewardPrice: rewardPrice || 0,
        rewardMaxQty: rewardMaxQty || 1,
        requirementType: requirementType || 'MIN_ORDER',
        minSpend: minSpend || 0,
        excludeBrandId,
        excludeCategoryId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        active: true,
      }
    })

    return NextResponse.json({
      data: {
        ...deal,
        rewardPrice: Number(deal.rewardPrice),
        minSpend: Number(deal.minSpend),
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('[Trade-Off Deals API] POST Error:', error)
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
  }
}
