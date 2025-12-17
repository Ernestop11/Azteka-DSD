import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import type { TApiResponse, ErrorResponse } from '@/types/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, direction } = body

    if (!id || !direction) {
      const err: ErrorResponse = { error: 'ID and direction are required' }
      return NextResponse.json(err, { status: 400 })
    }

    const promo = await prisma.billboardPromo.findUnique({
      where: { id },
    })

    if (!promo) {
      const err: ErrorResponse = { error: 'Promo not found' }
      return NextResponse.json(err, { status: 404 })
    }

    const allPromos = await prisma.billboardPromo.findMany({
      orderBy: { displayOrder: 'asc' },
    })

    const currentIndex = allPromos.findIndex((p) => p.id === id)
    if (currentIndex === -1) {
      const err: ErrorResponse = { error: 'Promo not found in list' }
      return NextResponse.json(err, { status: 404 })
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= allPromos.length) {
      const err: ErrorResponse = { error: 'Cannot move promo in that direction' }
      return NextResponse.json(err, { status: 400 })
    }

    const swapPromo = allPromos[newIndex]

    // Swap display orders
    await prisma.$transaction([
      prisma.billboardPromo.update({
        where: { id },
        data: { displayOrder: swapPromo.displayOrder },
      }),
      prisma.billboardPromo.update({
        where: { id: swapPromo.id },
        data: { displayOrder: promo.displayOrder },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating promo order:', error)
    const err: ErrorResponse = { error: 'Failed to update promo order', details: error?.message }
    return NextResponse.json(err, { status: 500 })
  }
}

