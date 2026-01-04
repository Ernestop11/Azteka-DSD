import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Search products for pricing rules dropdown
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const brandId = searchParams.get('brandId')
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { active: true }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (brandId) {
      where.brandId = brandId
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        brand: true,
        price: true,
        priceTierA: true,
        priceTierB: true,
        priceTierC: true,
        imageUrl: true,
        Category: { select: { id: true, name: true } }
      },
      take: limit,
      orderBy: { name: 'asc' }
    })

    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      brand: p.brand,
      price: Number(p.price),
      priceTierA: p.priceTierA ? Number(p.priceTierA) : null,
      priceTierB: p.priceTierB ? Number(p.priceTierB) : null,
      priceTierC: p.priceTierC ? Number(p.priceTierC) : null,
      imageUrl: p.imageUrl,
      category: p.Category?.name || null
    }))

    return NextResponse.json({ products: formatted })
  } catch (error) {
    console.error('Product search error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
