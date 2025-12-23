import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateBoxQR, generateBoxLabelHTML, sealBox } from '@/lib/services/qrGenerator'

/**
 * GET /api/boxes/[id]
 * Get a specific box with QR code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const box = await prisma.box.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, sku: true },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            customer: {
              select: { id: true, name: true, address: true },
            },
          },
        },
      },
    })

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 })
    }

    // Generate QR code
    const qr = await generateBoxQR(id)

    return NextResponse.json({
      data: {
        ...box,
        qrDataUrl: qr.dataUrl,
        qrUrl: qr.url,
      },
    })
  } catch (error) {
    console.error('[GET /api/boxes/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch box' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/boxes/[id]
 * Update box status (seal, mark delivered, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action } = body

    const box = await prisma.box.findUnique({
      where: { id },
    })

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 })
    }

    switch (action) {
      case 'seal':
        await sealBox(id)
        return NextResponse.json({
          data: { id, status: 'SEALED', sealedAt: new Date() },
        })

      case 'mark_delivered':
        await prisma.box.update({
          where: { id },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date(),
          },
        })
        return NextResponse.json({
          data: { id, status: 'DELIVERED', deliveredAt: new Date() },
        })

      case 'in_transit':
        await prisma.box.update({
          where: { id },
          data: { status: 'IN_TRANSIT' },
        })
        return NextResponse.json({
          data: { id, status: 'IN_TRANSIT' },
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: seal, mark_delivered, in_transit' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[PUT /api/boxes/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update box' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/boxes/[id]
 * Delete a box (only if still in packing status)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const box = await prisma.box.findUnique({
      where: { id },
    })

    if (!box) {
      return NextResponse.json({ error: 'Box not found' }, { status: 404 })
    }

    if (box.status !== 'PACKING') {
      return NextResponse.json(
        { error: 'Cannot delete sealed or delivered box' },
        { status: 400 }
      )
    }

    // Delete box items first, then the box
    await prisma.boxItem.deleteMany({ where: { boxId: id } })
    await prisma.box.delete({ where: { id } })

    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error('[DELETE /api/boxes/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete box' },
      { status: 500 }
    )
  }
}
