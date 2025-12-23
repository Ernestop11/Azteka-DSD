import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin, unauthorizedResponse } from '../../lib/auth'
import type { Prisma } from '@prisma/client'

// GET /api/admin/price-overrides
// Query params: customerId?, productId?, active?, page?, pageSize?
export async function GET(request: NextRequest) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const productId = searchParams.get('productId')
    const active = searchParams.get('active')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    const where: Prisma.CustomerPriceOverrideWhereInput = {
      ...(customerId && { customerId }),
      ...(productId && { productId }),
      ...(active !== null && { active: active === 'true' }),
    }

    const [overrides, total] = await Promise.all([
      prisma.customerPriceOverride.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              businessName: true,
              priceTier: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customerPriceOverride.count({ where }),
    ])

    return NextResponse.json({
      data: overrides,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Error fetching price overrides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price overrides' },
      { status: 500 }
    )
  }
}

// POST /api/admin/price-overrides
export async function POST(request: NextRequest) {
  const user = await requireAdmin(request)
  if (!user) return unauthorizedResponse()

  try {
    const body = await request.json()
    const {
      customerId,
      productId,
      overrideType,
      fixedPrice,
      discountPercent,
      discountAmount,
      minQuantity,
      maxQuantity,
      contractNumber,
      notes,
      startDate,
      endDate,
      active = true,
    } = body

    // Validate required fields
    if (!customerId || !productId || !overrideType) {
      return NextResponse.json(
        { error: 'customerId, productId, and overrideType are required' },
        { status: 400 }
      )
    }

    // Validate override type specific fields
    if (overrideType === 'FIXED_PRICE' && !fixedPrice) {
      return NextResponse.json(
        { error: 'fixedPrice is required for FIXED_PRICE override' },
        { status: 400 }
      )
    }

    if (overrideType === 'PERCENTAGE_DISCOUNT' && !discountPercent) {
      return NextResponse.json(
        { error: 'discountPercent is required for PERCENTAGE_DISCOUNT override' },
        { status: 400 }
      )
    }

    if (overrideType === 'FIXED_DISCOUNT' && !discountAmount) {
      return NextResponse.json(
        { error: 'discountAmount is required for FIXED_DISCOUNT override' },
        { status: 400 }
      )
    }

    // Verify customer and product exist
    const [customer, product] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.product.findUnique({ where: { id: productId } }),
    ])

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check for existing override (upsert logic)
    const existing = await prisma.customerPriceOverride.findFirst({
      where: {
        customerId,
        productId,
        minQuantity: minQuantity || null,
        active: true,
      },
    })

    const overrideData = {
      customerId,
      productId,
      overrideType,
      fixedPrice: fixedPrice ? parseFloat(fixedPrice) : null,
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      discountAmount: discountAmount ? parseFloat(discountAmount) : null,
      minQuantity: minQuantity ? parseInt(minQuantity) : null,
      maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
      contractNumber: contractNumber || null,
      notes: notes || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      active,
      createdById: user.id,
    }

    const priceOverride = existing
      ? await prisma.customerPriceOverride.update({
          where: { id: existing.id },
          data: overrideData,
        })
      : await prisma.customerPriceOverride.create({
          data: overrideData,
        })

    return NextResponse.json({
      data: priceOverride,
      message: existing ? 'Price override updated' : 'Price override created',
    })
  } catch (error) {
    console.error('Error creating price override:', error)
    return NextResponse.json(
      { error: 'Failed to create price override' },
      { status: 500 }
    )
  }
}



