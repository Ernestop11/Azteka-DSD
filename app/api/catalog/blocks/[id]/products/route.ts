import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Add product to block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: blockId } = await params
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    // Check if product already in block
    const existing = await prisma.catalogBlockProduct.findUnique({
      where: {
        blockId_productId: { blockId, productId },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Product already in block' }, { status: 400 })
    }

    // Get max display order
    const maxOrder = await prisma.catalogBlockProduct.aggregate({
      where: { blockId },
      _max: { displayOrder: true },
    })

    const blockProduct = await prisma.catalogBlockProduct.create({
      data: {
        blockId,
        productId,
        displayOrder: (maxOrder._max.displayOrder || 0) + 1,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json({ data: blockProduct })
  } catch (error: unknown) {
    console.error('[Block Products API] POST error:', error)
    return NextResponse.json({ error: 'Failed to add product to block' }, { status: 500 })
  }
}
