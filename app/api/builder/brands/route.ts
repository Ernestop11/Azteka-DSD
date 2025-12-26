import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all brands with their layouts
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: { Product: true }
        }
      }
    })

    // Get layouts for all brands
    const layouts = await prisma.brandLayout.findMany()
    const layoutMap = new Map(layouts.map(l => [l.brandId, l]))

    const transformed = brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logoUrl: brand.logoUrl,
      imageUrl: brand.imageUrl,
      isFeatured: brand.isFeatured,
      displayOrder: brand.displayOrder,
      productCount: brand._count.Product,
      layout: layoutMap.get(brand.id) || null,
    }))

    return NextResponse.json({ data: transformed })
  } catch (error: any) {
    console.error('[Brand Layouts API] Error:', error)
    return NextResponse.json({ data: [] })
  }
}

// POST - Create or update a brand layout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      brandId,
      config,
      heroImage,
      heroGradient,
      showLogo,
      featured,
      gridColumns,
    } = body

    if (!brandId) {
      return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 })
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Upsert the layout
    const layout = await prisma.brandLayout.upsert({
      where: { brandId },
      update: {
        config: config || {},
        heroImage,
        heroGradient,
        showLogo: showLogo ?? true,
        featured: featured ?? false,
        gridColumns: gridColumns || 4,
      },
      create: {
        brandId,
        config: config || {},
        heroImage,
        heroGradient,
        showLogo: showLogo ?? true,
        featured: featured ?? false,
        gridColumns: gridColumns || 4,
      },
    })

    return NextResponse.json({ data: layout }, { status: 201 })
  } catch (error: any) {
    console.error('[Brand Layouts API] POST Error:', error)
    return NextResponse.json({ error: 'Failed to save layout' }, { status: 500 })
  }
}
