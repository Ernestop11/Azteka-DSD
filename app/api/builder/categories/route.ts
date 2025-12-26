import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch all categories with their layouts
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        Subcategory: {
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { Product: true }
        }
      }
    })

    // Get layouts for all categories
    const layouts = await prisma.categoryLayout.findMany()
    const layoutMap = new Map(layouts.map(l => [l.categoryId, l]))

    const transformed = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      displayOrder: cat.displayOrder,
      productCount: cat._count.Product,
      subcategories: cat.Subcategory.map(sub => ({
        id: sub.id,
        name: sub.name,
        displayOrder: sub.displayOrder,
      })),
      layout: layoutMap.get(cat.id) || null,
    }))

    return NextResponse.json({ data: transformed })
  } catch (error: any) {
    console.error('[Category Layouts API] Error:', error)
    return NextResponse.json({ data: [] })
  }
}

// POST - Create or update a category layout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      categoryId,
      config,
      heroImage,
      heroTitle,
      heroSubtitle,
      showSubcategories,
      showBundles,
      gridColumns,
    } = body

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Upsert the layout
    const layout = await prisma.categoryLayout.upsert({
      where: { categoryId },
      update: {
        config: config || {},
        heroImage,
        heroTitle,
        heroSubtitle,
        showSubcategories: showSubcategories ?? true,
        showBundles: showBundles ?? true,
        gridColumns: gridColumns || 4,
      },
      create: {
        categoryId,
        config: config || {},
        heroImage,
        heroTitle,
        heroSubtitle,
        showSubcategories: showSubcategories ?? true,
        showBundles: showBundles ?? true,
        gridColumns: gridColumns || 4,
      },
    })

    return NextResponse.json({ data: layout }, { status: 201 })
  } catch (error: any) {
    console.error('[Category Layouts API] POST Error:', error)
    return NextResponse.json({ error: 'Failed to save layout' }, { status: 500 })
  }
}
