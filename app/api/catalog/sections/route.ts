import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Public endpoint to fetch active sections for catalog display
export async function GET(request: NextRequest) {
  try {
    const sections = await prisma.catalogSection.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
      include: {
        items: {
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
                seasonal: true,
                trending: true,
                badge: true,
                backgroundColor: true,
                backgroundGradient: true,
                Brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
                Category: { select: { id: true, name: true, slug: true } },
              }
            }
          }
        }
      }
    })

    // Transform to frontend-friendly format
    const transformed = sections.map(section => ({
      id: section.id,
      name: section.name,
      description: section.description,
      type: section.type,
      hero: section.hero,
      imageUrl: section.imageUrl,
      badgeText: section.badgeText,
      badgeColor: section.badgeColor,
      position: section.position,
      products: section.items
        .filter(item => item.product.inStock)
        .map(item => ({
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          description: item.product.description,
          price: Number(item.product.price),
          imageUrl: item.product.imageUrl,
          unitsPerCase: item.product.unitsPerCase,
          inStock: item.product.inStock,
          featured: item.featured || item.product.featured,
          seasonal: item.product.seasonal,
          trending: item.product.trending,
          badge: item.product.badge,
          backgroundColor: item.product.backgroundColor,
          backgroundGradient: item.product.backgroundGradient,
          brand: item.product.Brand,
          category: item.product.Category,
          displayOrder: item.displayOrder,
        }))
    }))

    return NextResponse.json({ data: transformed })
  } catch (error: any) {
    console.error('[Catalog Sections API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
}
