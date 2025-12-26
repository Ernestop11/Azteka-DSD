import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE - Remove product from cart block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { id: blockId, productId } = await params

    await prisma.cartBlockProduct.delete({
      where: {
        blockId_productId: {
          blockId,
          productId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Cart Block Product API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to remove product' }, { status: 500 })
  }
}
