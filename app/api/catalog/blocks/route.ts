import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all catalog blocks with their products
export async function GET() {
  try {
    const blocks = await prisma.catalogBlock.findMany({
      where: { active: true },
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
      subtitle: block.subtitle,
      badgeText: block.badgeText,
      ctaText: block.ctaText,
      ctaLink: block.ctaLink,
      config: typeof block.config === 'string' ? JSON.parse(block.config) : block.config,
      position: block.position,
      active: block.active,
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
    console.error('[Catalog Blocks API] Error:', error)
    return NextResponse.json({ data: [] })
  }
}

// POST - Create a new block
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, subtitle, badgeText, ctaText, ctaLink, config, productIds } = body

    // Get the next position
    const lastBlock = await prisma.catalogBlock.findFirst({
      orderBy: { position: 'desc' }
    })
    const position = (lastBlock?.position || 0) + 1

    // Create the block
    const block = await prisma.catalogBlock.create({
      data: {
        type,
        title,
        subtitle,
        badgeText,
        ctaText,
        ctaLink,
        config: config || {},
        position,
        active: true,
      }
    })

    // Add products if provided
    if (productIds && productIds.length > 0) {
      await prisma.catalogBlockProduct.createMany({
        data: productIds.map((productId: string, index: number) => ({
          blockId: block.id,
          productId,
          displayOrder: index
        }))
      })
    }

    return NextResponse.json({ data: block }, { status: 201 })
  } catch (error: any) {
    console.error('[Catalog Blocks API] POST Error:', error)
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
        prisma.catalogBlock.update({
          where: { id: b.id },
          data: { position: b.position }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Catalog Blocks API] PUT Error:', error)
    return NextResponse.json({ error: 'Failed to update block positions' }, { status: 500 })
  }
}
