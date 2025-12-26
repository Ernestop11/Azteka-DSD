import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get single cart block
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const block = await prisma.cartBlock.findUnique({
      where: { id },
      include: {
        products: {
          orderBy: { displayOrder: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                imageUrl: true,
                inStock: true,
                Brand: { select: { id: true, name: true } },
                Category: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    return NextResponse.json({ data: block })
  } catch (error: unknown) {
    console.error('[Cart Block API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch block' }, { status: 500 })
  }
}

// PUT - Update cart block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, config, enabled } = body

    const block = await prisma.cartBlock.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(config !== undefined && { config }),
        ...(enabled !== undefined && { enabled }),
      },
      include: {
        products: {
          orderBy: { displayOrder: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ data: block })
  } catch (error: unknown) {
    console.error('[Cart Block API] PUT error:', error)
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 })
  }
}

// DELETE - Delete cart block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete block (products will cascade delete due to onDelete: Cascade)
    await prisma.cartBlock.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[Cart Block API] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 })
  }
}
