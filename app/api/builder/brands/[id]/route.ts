import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get brand with its layout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
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
            Category: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Get the layout
    const layout = await prisma.brandLayout.findUnique({
      where: { brandId: id },
    })

    return NextResponse.json({
      data: {
        ...brand,
        products: brand.Product.map(p => ({
          ...p,
          price: Number(p.price),
          category: p.Category,
        })),
        layout,
      }
    })
  } catch (error: unknown) {
    console.error('[Brand Layout API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch brand' }, { status: 500 })
  }
}

// PUT - Update brand layout
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await params
    const body = await request.json()
    const {
      config,
      heroImage,
      heroGradient,
      showLogo,
      featured,
      gridColumns,
    } = body

    // Upsert the layout
    const layout = await prisma.brandLayout.upsert({
      where: { brandId },
      update: {
        ...(config !== undefined && { config }),
        ...(heroImage !== undefined && { heroImage }),
        ...(heroGradient !== undefined && { heroGradient }),
        ...(showLogo !== undefined && { showLogo }),
        ...(featured !== undefined && { featured }),
        ...(gridColumns !== undefined && { gridColumns }),
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

    return NextResponse.json({ data: layout })
  } catch (error: unknown) {
    console.error('[Brand Layout API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update layout' }, { status: 500 })
  }
}

// DELETE - Delete brand layout (revert to defaults)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await params

    await prisma.brandLayout.delete({
      where: { brandId },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Brand Layout API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete layout' }, { status: 500 })
  }
}
