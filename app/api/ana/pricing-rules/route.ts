import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all pricing rules
export async function GET() {
  try {
    const rules = await prisma.priceOverride.findMany({
      include: {
        customer: { select: { id: true, businessName: true } },
        product: { select: { id: true, name: true, brand: true, price: true } },
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get customers for dropdown
    const customers = await prisma.customer.findMany({
      where: { active: true },
      select: { id: true, businessName: true, priceTier: true },
      orderBy: { businessName: 'asc' }
    })

    // Get customer groups
    const groups = await prisma.customerGroup.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })

    // Get brands for batch rules
    const brands = await prisma.brand.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })

    // Get categories
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })

    // Format rules
    const formattedRules = rules.map(rule => ({
      id: rule.id,
      customerId: rule.customerId,
      customerName: rule.customer?.businessName || 'Todos',
      productId: rule.productId,
      productName: rule.product?.name || null,
      productBrand: rule.product?.brand || null,
      basePrice: rule.product ? Number(rule.product.price) : null,
      categoryId: rule.categoryId,
      categoryName: rule.category?.name || null,
      brandId: rule.brandId,
      brandName: rule.brand?.name || null,
      overridePrice: Number(rule.overridePrice),
      discountPercent: rule.discountPercent ? Number(rule.discountPercent) : null,
      startDate: rule.startDate?.toISOString() || null,
      endDate: rule.endDate?.toISOString() || null,
      active: rule.active,
      notes: rule.notes,
      createdAt: rule.createdAt.toISOString()
    }))

    return NextResponse.json({
      rules: formattedRules,
      customers,
      groups,
      brands,
      categories
    })
  } catch (error) {
    console.error('Pricing rules error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create a new pricing rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerId,
      productId,
      categoryId,
      brandId,
      overridePrice,
      discountPercent,
      startDate,
      endDate,
      notes
    } = body

    // Validate required fields
    if (!overridePrice && !discountPercent) {
      return NextResponse.json(
        { error: 'Se requiere un precio fijo o porcentaje de descuento' },
        { status: 400 }
      )
    }

    const rule = await prisma.priceOverride.create({
      data: {
        customerId: customerId || null,
        productId: productId || null,
        categoryId: categoryId || null,
        brandId: brandId || null,
        overridePrice: overridePrice || 0,
        discountPercent: discountPercent || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes: notes || null,
        active: true
      },
      include: {
        customer: { select: { id: true, businessName: true } },
        product: { select: { id: true, name: true, brand: true } },
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      rule: {
        id: rule.id,
        customerId: rule.customerId,
        customerName: rule.customer?.businessName || 'Todos',
        productId: rule.productId,
        productName: rule.product?.name || null,
        categoryId: rule.categoryId,
        categoryName: rule.category?.name || null,
        brandId: rule.brandId,
        brandName: rule.brand?.name || null,
        overridePrice: Number(rule.overridePrice),
        discountPercent: rule.discountPercent ? Number(rule.discountPercent) : null,
        active: rule.active
      }
    })
  } catch (error) {
    console.error('Create pricing rule error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Remove a pricing rule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await prisma.priceOverride.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete pricing rule error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
