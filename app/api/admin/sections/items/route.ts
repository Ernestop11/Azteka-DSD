import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST - Add product(s) to a section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sectionId, productId, productIds, featured } = body

    if (!sectionId) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 })
    }

    // Handle single product or array of products
    const idsToAdd = productIds || (productId ? [productId] : [])

    if (idsToAdd.length === 0) {
      return NextResponse.json({ error: 'Product ID(s) required' }, { status: 400 })
    }

    // Get current max displayOrder for this section
    const maxOrder = await prisma.catalogSectionItem.aggregate({
      where: { sectionId },
      _max: { displayOrder: true }
    })

    let currentOrder = (maxOrder._max.displayOrder ?? -1) + 1

    // Add items (skip if already exists due to unique constraint)
    const results = await Promise.allSettled(
      idsToAdd.map((pid: string) =>
        prisma.catalogSectionItem.create({
          data: {
            sectionId,
            productId: pid,
            displayOrder: currentOrder++,
            featured: featured || false,
          },
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
        })
      )
    )

    const created = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value)

    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message || 'Unknown error')

    return NextResponse.json({
      data: created,
      errors: errors.length > 0 ? errors : undefined,
      added: created.length,
      skipped: errors.length
    }, { status: 201 })
  } catch (error: any) {
    console.error('[Section Items API] POST error:', error)
    return NextResponse.json({ error: 'Failed to add items' }, { status: 500 })
  }
}

// DELETE - Remove product from section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')
    const productId = searchParams.get('productId')
    const itemId = searchParams.get('id')

    if (itemId) {
      // Delete by item ID
      await prisma.catalogSectionItem.delete({
        where: { id: itemId }
      })
    } else if (sectionId && productId) {
      // Delete by section + product combination
      await prisma.catalogSectionItem.delete({
        where: {
          sectionId_productId: { sectionId, productId }
        }
      })
    } else {
      return NextResponse.json({ error: 'Item ID or (sectionId + productId) required' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Section Items API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
  }
}

// PATCH - Reorder items within a section
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { sectionId, order } = body // order = array of item IDs in new order

    if (!sectionId || !Array.isArray(order)) {
      return NextResponse.json({ error: 'sectionId and order array required' }, { status: 400 })
    }

    // Update displayOrder for each item
    await prisma.$transaction(
      order.map((itemId: string, index: number) =>
        prisma.catalogSectionItem.update({
          where: { id: itemId },
          data: { displayOrder: index }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Section Items API] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 })
  }
}
