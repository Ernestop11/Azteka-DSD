import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Add product to cart block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: blockId } = await params
    const body = await request.json()
    const { productId } = body

    // Check if block exists
    const block = await prisma.cartBlock.findUnique({
      where: { id: blockId },
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product already in block
    const existing = await prisma.cartBlockProduct.findUnique({
      where: {
        blockId_productId: {
          blockId,
          productId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Product already in block' }, { status: 400 })
    }

    // Get next display order
    const lastProduct = await prisma.cartBlockProduct.findFirst({
      where: { blockId },
      orderBy: { displayOrder: 'desc' },
    })
    const displayOrder = (lastProduct?.displayOrder || 0) + 1

    // Add product to block
    const blockProduct = await prisma.cartBlockProduct.create({
      data: {
        blockId,
        productId,
        displayOrder,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            imageUrl: true,
            inStock: true,
          },
        },
      },
    })

    return NextResponse.json({ data: blockProduct }, { status: 201 })
  } catch (error: unknown) {
    console.error('[Cart Block Products API] POST error:', error)
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 })
  }
}

// PUT - Reorder products in block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: blockId } = await params
    const body = await request.json()
    const { products } = body // Array of { productId, displayOrder }

    // Update display orders in a transaction
    await prisma.$transaction(
      products.map((p: { productId: string; displayOrder: number }) =>
        prisma.cartBlockProduct.update({
          where: {
            blockId_productId: {
              blockId,
              productId: p.productId,
            },
          },
          data: { displayOrder: p.displayOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Cart Block Products API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to reorder products' }, { status: 500 })
  }
}
