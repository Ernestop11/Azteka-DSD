import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - List price overrides for this customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params

    const overrides = await prisma.customerPriceOverride.findMany({
      where: { customerId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      overrides: overrides.map(o => ({
        id: o.id,
        productId: o.productId,
        productName: o.product.name,
        productSku: o.product.sku,
        productImage: o.product.imageUrl,
        basePrice: Number(o.product.price),
        overrideType: o.overrideType,
        fixedPrice: o.fixedPrice ? Number(o.fixedPrice) : null,
        discountPercent: o.discountPercent ? Number(o.discountPercent) : null,
        discountAmount: o.discountAmount ? Number(o.discountAmount) : null,
        notes: o.notes,
        isActive: o.isActive,
        createdAt: o.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('[Price Overrides GET] Error:', error)
    return NextResponse.json({ error: 'Failed to load overrides' }, { status: 500 })
  }
}

// POST - Create or update price override
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params
    const body = await request.json()

    const { productId, overrideType, fixedPrice, discountPercent, notes, createdById } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Verify customer and product exist
    const [customer, product] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } }),
      prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
    ])

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Upsert the price override
    const override = await prisma.customerPriceOverride.upsert({
      where: {
        customerId_productId: {
          customerId,
          productId
        }
      },
      create: {
        customerId,
        productId,
        overrideType: overrideType || 'FIXED_PRICE',
        fixedPrice: fixedPrice ? parseFloat(fixedPrice) : null,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        notes: notes || null,
        createdById: createdById || 'unknown',
        isActive: true
      },
      update: {
        overrideType: overrideType || 'FIXED_PRICE',
        fixedPrice: fixedPrice ? parseFloat(fixedPrice) : null,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        notes: notes || null,
        updatedById: createdById || 'unknown',
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      override: {
        id: override.id,
        productId: override.productId,
        overrideType: override.overrideType,
        fixedPrice: override.fixedPrice ? Number(override.fixedPrice) : null,
        discountPercent: override.discountPercent ? Number(override.discountPercent) : null
      }
    })
  } catch (error) {
    console.error('[Price Overrides POST] Error:', error)
    return NextResponse.json({ error: 'Failed to save override' }, { status: 500 })
  }
}

// DELETE - Remove a price override
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    await prisma.customerPriceOverride.deleteMany({
      where: {
        customerId,
        productId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Price Overrides DELETE] Error:', error)
    return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 })
  }
}
