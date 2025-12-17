import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// PUT - Reorder blocks
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { blockIds } = body

    if (!Array.isArray(blockIds)) {
      return NextResponse.json({ error: 'blockIds must be an array' }, { status: 400 })
    }

    // Update positions in a transaction
    await prisma.$transaction(
      blockIds.map((id, index) =>
        prisma.catalogBlock.update({
          where: { id },
          data: { position: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Block Reorder API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to reorder blocks' }, { status: 500 })
  }
}
