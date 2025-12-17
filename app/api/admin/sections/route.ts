import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Fetch all sections with their items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeItems = searchParams.get('includeItems') !== 'false'

    const sections = await prisma.catalogSection.findMany({
      orderBy: { position: 'asc' },
      include: includeItems ? {
        items: {
          orderBy: { displayOrder: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                imageUrl: true,
                unitsPerCase: true,
                inStock: true,
                brand: { select: { id: true, name: true } },
                category: { select: { id: true, name: true } },
              }
            }
          }
        },
        _count: { select: { items: true } }
      } : {
        _count: { select: { items: true } }
      }
    })

    return NextResponse.json({ data: sections })
  } catch (error: any) {
    console.error('[Sections API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
}

// POST - Create a new section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, hero, imageUrl, badgeText, badgeColor, active } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Get the highest position
    const maxPosition = await prisma.catalogSection.aggregate({
      _max: { position: true }
    })

    const section = await prisma.catalogSection.create({
      data: {
        name,
        description: description || null,
        type: type || 'GROCERY',
        position: (maxPosition._max.position ?? -1) + 1,
        hero: hero || false,
        imageUrl: imageUrl || null,
        badgeText: badgeText || null,
        badgeColor: badgeColor || '#10b981',
        active: active !== false,
      },
      include: {
        _count: { select: { items: true } }
      }
    })

    return NextResponse.json({ data: section }, { status: 201 })
  } catch (error: any) {
    console.error('[Sections API] POST error:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}

// PUT - Update a section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, type, hero, imageUrl, badgeText, badgeColor, active, position } = body

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (hero !== undefined) updateData.hero = hero
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (badgeText !== undefined) updateData.badgeText = badgeText
    if (badgeColor !== undefined) updateData.badgeColor = badgeColor
    if (active !== undefined) updateData.active = active
    if (position !== undefined) updateData.position = position

    const section = await prisma.catalogSection.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          orderBy: { displayOrder: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                imageUrl: true,
              }
            }
          }
        },
        _count: { select: { items: true } }
      }
    })

    return NextResponse.json({ data: section })
  } catch (error: any) {
    console.error('[Sections API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

// DELETE - Delete a section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 })
    }

    // Delete section (cascade will delete items)
    await prisma.catalogSection.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Sections API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}

// PATCH - Reorder sections
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { order } = body // Array of section IDs in new order

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'Order array is required' }, { status: 400 })
    }

    // Update positions in a transaction
    await prisma.$transaction(
      order.map((sectionId: string, index: number) =>
        prisma.catalogSection.update({
          where: { id: sectionId },
          data: { position: index }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Sections API] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 })
  }
}
