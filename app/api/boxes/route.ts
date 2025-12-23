import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createBox, generateBoxQR, generateBoxLabelHTML } from '@/lib/services/qrGenerator'

/**
 * GET /api/boxes
 * Get boxes for an order
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const orderId = url.searchParams.get('orderId')
    const qrCode = url.searchParams.get('qrCode')

    if (qrCode) {
      // Public lookup by QR code
      const box = await prisma.box.findUnique({
        where: { qrCode },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true },
              },
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              customer: {
                select: { name: true },
              },
            },
          },
        },
      })

      if (!box) {
        return NextResponse.json({ error: 'Box not found' }, { status: 404 })
      }

      return NextResponse.json({
        data: {
          qrCode: box.qrCode,
          orderId: box.orderId,
          orderNumber: box.order?.orderNumber,
          customer: box.order?.customer?.name,
          status: box.status,
          items: box.items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl,
          })),
          sealedAt: box.sealedAt,
        },
      })
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId or qrCode is required' },
        { status: 400 }
      )
    }

    const boxes = await prisma.box.findMany({
      where: { orderId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ data: boxes })
  } catch (error) {
    console.error('[GET /api/boxes] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch boxes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/boxes
 * Create a new box for an order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, items } = body

    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'orderId and items array are required' },
        { status: 400 }
      )
    }

    // Validate order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Create the box
    const box = await createBox(orderId, items)

    // Generate QR code
    const qr = await generateBoxQR(box.id)

    return NextResponse.json({
      data: {
        id: box.id,
        qrCode: box.qrCode,
        qrDataUrl: qr.dataUrl,
        qrUrl: qr.url,
      },
    })
  } catch (error) {
    console.error('[POST /api/boxes] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create box' },
      { status: 500 }
    )
  }
}
