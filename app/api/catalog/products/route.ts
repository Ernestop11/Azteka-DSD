import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { normalizeProductImage } from '@/lib/imageUrl'
import type { PaginationMeta, TApiResponse, ErrorResponse } from '@/types/api'

type CatalogProductPayload = {
  id: string
  name: string
  sku: string
  description: string | null | undefined
  price: number
  unitsPerCase: number
  imageUrl: string | null
  backgroundColor: string | null
  backgroundGradient: string | null
  featured: boolean
  seasonal: boolean
  trending: boolean
  category: { id: string; name: string } | null
  brand: { id: string; name: string } | null
  gradientPresetId: string | null
  glowPresetId: string | null
  splashPresetId: string | null
  badgeText: null
  badgeColor: null
  cardTheme: 'gradient'
  // Tier pricing fields
  tier: string | null
  priceTierA: number | null
  priceTierB: number | null
  priceTierC: number | null
  points: number | null
  // Visual preset fields
  glossLevel: string | null
  sparkle: boolean
  badge: string | null
  theme: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')
    const priceMin = searchParams.get('minPrice')
    const priceMax = searchParams.get('maxPrice')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      inStock: true, // Only show in-stock products in catalog
    }
    const conditions: any[] = []

    // Category filter - support comma-separated list
    if (category) {
      const categoryList = category.split(',').filter(Boolean)
      if (categoryList.length > 0) {
        conditions.push({
          OR: categoryList.map((cat) => [
            { Category: { slug: { equals: cat.trim(), mode: 'insensitive' } } },
            { Category: { name: { contains: cat.trim(), mode: 'insensitive' } } },
            { Category: { id: { equals: cat.trim() } } },
          ]).flat(),
        })
      }
    }

    // Brand filter - support comma-separated list
    if (brand) {
      const brandList = brand.split(',').filter(Boolean)
      if (brandList.length > 0) {
        conditions.push({
          OR: brandList.map((br) => [
            { Brand: { slug: { equals: br.trim(), mode: 'insensitive' } } },
            { Brand: { name: { contains: br.trim(), mode: 'insensitive' } } },
            { Brand: { id: { equals: br.trim() } } },
          ]).flat(),
        })
      }
    }

    // Search filter
    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search.toUpperCase(), mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      })
    }

    // Price range filter
    if (priceMin || priceMax) {
      const priceCondition: any = {}
      if (priceMin) {
        priceCondition.gte = parseFloat(priceMin)
      }
      if (priceMax) {
        priceCondition.lte = parseFloat(priceMax)
      }
      conditions.push({ price: priceCondition })
    }

    // Combine all conditions with AND
    if (conditions.length > 0) {
      where.AND = conditions
    }

    // Fetch products with relations
    // Using include for relations - note: Prisma uses capitalized relation names (Brand, Category)
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          Category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          Brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // Helper to convert Decimal to number
    const toNumber = (value: any): number | null => {
      if (value === null || value === undefined) return null
      if (typeof value === 'number') return value
      if (typeof value === 'object' && 'toNumber' in value) {
        return (value as { toNumber(): number }).toNumber()
      }
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }

    // Transform to match ProductCard interface
    const transformedProducts = products.map((p) => {
      // Normalize image URL - always return a valid string
      const resolvedImage = normalizeProductImage({
        imageUrl: p.imageUrl,
      })

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        description: p.description,
        price: toNumber(p.price) ?? 0,
        unitsPerCase: p.unitsPerCase,
        imageUrl: resolvedImage, // Always a valid string, never null
        backgroundColor: p.backgroundColor || null,
        backgroundGradient: p.backgroundGradient || null,
        featured: p.featured || false,
        seasonal: p.seasonal || false,
        trending: p.trending || false,
        category: p.Category
          ? {
              id: p.Category.id,
              name: p.Category.name,
            }
          : null,
        brand: p.Brand
          ? {
              id: p.Brand.id,
              name: p.Brand.name,
            }
          : null,
        gradientPresetId: p.gradientPresetId || null,
        glowPresetId: p.glowPresetId || null,
        splashPresetId: p.splashPresetId || null,
        badgeText: null,
        badgeColor: null,
        cardTheme: 'gradient' as const,
        // Tier pricing fields (may not exist in DB)
        tier: null,
        priceTierA: null,
        priceTierB: null,
        priceTierC: null,
        points: null,
        // Visual preset fields (may not exist in DB)
        glossLevel: 'none',
        sparkle: false,
        badge: null,
        theme: 'default',
      }
    })

    const pagination: PaginationMeta = {
      page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    }

    const response: TApiResponse<CatalogProductPayload[], PaginationMeta> = {
      data: transformedProducts,
      meta: pagination,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching products:', error)
    const payload: ErrorResponse = {
      error: 'Failed to fetch products',
      details: error?.message ?? String(error),
    }
    return NextResponse.json(payload, { status: 500 })
  }
}
