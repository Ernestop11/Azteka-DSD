import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all cart blocks with their products
export async function GET() {
  try {
    const blocks = await prisma.cartBlock.findMany({
      where: { enabled: true },
      orderBy: { position: 'asc' },
      include: {
        products: {
          orderBy: { displayOrder: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                description: true,
                price: true,
                imageUrl: true,
                unitsPerCase: true,
                inStock: true,
                featured: true,
                sellByHalfCase: true,
                Brand: { select: { id: true, name: true } },
                Category: { select: { id: true, name: true } },
              }
            }
          }
        }
      }
    })

    // Transform to flat format expected by admin block builder
    const transformed = blocks.map(block => ({
      id: block.id,
      type: block.type,
      title: block.title,
      config: typeof block.config === 'string' ? JSON.parse(block.config) : block.config,
      position: block.position,
      enabled: block.enabled,
      products: block.products.map(bp => ({
        id: bp.id,
        productId: bp.productId,
        displayOrder: bp.displayOrder,
        product: {
          id: bp.product.id,
          name: bp.product.name,
          sku: bp.product.sku,
          description: bp.product.description,
          price: Number(bp.product.price),
          imageUrl: bp.product.imageUrl,
          unitsPerCase: bp.product.unitsPerCase,
          inStock: bp.product.inStock,
          featured: bp.product.featured,
          sellByHalfCase: bp.product.sellByHalfCase ?? false,
          brand: bp.product.Brand,
          category: bp.product.Category,
        }
      }))
    }))

    return NextResponse.json({ data: transformed })
  } catch (error: any) {
    console.error('[Cart Blocks API] Error:', error)
    return NextResponse.json({ data: [] })
  }
}

// POST - Create a new cart block
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, config, productIds } = body

    // Get the next position
    const lastBlock = await prisma.cartBlock.findFirst({
      orderBy: { position: 'desc' }
    })
    const position = (lastBlock?.position || 0) + 1

    // Create the block
    const block = await prisma.cartBlock.create({
      data: {
        type,
        title,
        config: config || {},
        position,
        enabled: true,
      }
    })

    // Add products if provided
    if (productIds && productIds.length > 0) {
      await prisma.cartBlockProduct.createMany({
        data: productIds.map((productId: string, index: number) => ({
          blockId: block.id,
          productId,
          displayOrder: index
        }))
      })
    }

    return NextResponse.json({ data: block }, { status: 201 })
  } catch (error: any) {
    console.error('[Cart Blocks API] POST Error:', error)
    return NextResponse.json({ error: 'Failed to create block' }, { status: 500 })
  }
}

// PUT - Update block positions (reorder)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { blocks } = body // Array of { id, position }

    // Update positions in a transaction
    await prisma.$transaction(
      blocks.map((b: { id: string; position: number }) =>
        prisma.cartBlock.update({
          where: { id: b.id },
          data: { position: b.position }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Cart Blocks API] PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update block positions' }, { status: 500 })
  }
}
