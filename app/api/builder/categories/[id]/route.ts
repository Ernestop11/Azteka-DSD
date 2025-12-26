import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get category with its layout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        Subcategory: {
          orderBy: { displayOrder: 'asc' },
        },
        Product: {
          take: 20,
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            imageUrl: true,
            inStock: true,
            Brand: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get the layout
    const layout = await prisma.categoryLayout.findUnique({
      where: { categoryId: id },
    })

    return NextResponse.json({
      data: {
        ...category,
        products: category.Product.map(p => ({
          ...p,
          price: Number(p.price),
          brand: p.Brand,
        })),
        layout,
      }
    })
  } catch (error: unknown) {
    console.error('[Category Layout API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

// PUT - Update category layout
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params
    const body = await request.json()
    const {
      config,
      heroImage,
      heroTitle,
      heroSubtitle,
      showSubcategories,
      showBundles,
      gridColumns,
    } = body

    // Upsert the layout
    const layout = await prisma.categoryLayout.upsert({
      where: { categoryId },
      update: {
        ...(config !== undefined && { config }),
        ...(heroImage !== undefined && { heroImage }),
        ...(heroTitle !== undefined && { heroTitle }),
        ...(heroSubtitle !== undefined && { heroSubtitle }),
        ...(showSubcategories !== undefined && { showSubcategories }),
        ...(showBundles !== undefined && { showBundles }),
        ...(gridColumns !== undefined && { gridColumns }),
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

    return NextResponse.json({ data: layout })
  } catch (error: unknown) {
    console.error('[Category Layout API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update layout' }, { status: 500 })
  }
}

// DELETE - Delete category layout (revert to defaults)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params

    await prisma.categoryLayout.delete({
      where: { categoryId },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Category Layout API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete layout' }, { status: 500 })
  }
}
