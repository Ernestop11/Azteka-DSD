import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { catalogCache } from '@/lib/cache'
import { BrandApiResponseSchema } from '@/lib/schemas/catalog'
import type { BrandApiResponse } from '@/types/catalog'

const CACHE_TTL = 60_000

const numeric = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const countValue = (value: unknown): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(Number(limitParam) || 12, 24) : 12
    const cacheKey = `brands:featured:${limit}`

    const cached = catalogCache.get<{ brands: BrandApiResponse[] }>(cacheKey)
    if (cached) {
      return NextResponse.json({ brands: cached.brands, cached: true })
    }

    const brands = (await prisma.$queryRaw(
      Prisma.sql`
        SELECT
          b."id",
          b."name",
          b."slug",
          b."logoUrl",
          b."isFeatured",
          COUNT(DISTINCT p."id")::int AS "productCount",
          COALESCE(SUM(oi."quantity" * oi."priceCase"), 0)::numeric AS "revenue30d",
          COALESCE(SUM(oi."quantity"), 0)::numeric AS "units30d"
        FROM "Brand" b
        LEFT JOIN "Product" p ON p."brandId" = b."id" AND COALESCE(p."isHidden", false) = false
        LEFT JOIN "OrderItem" oi ON oi."productId" = p."id"
        LEFT JOIN "Order" o ON o."id" = oi."orderId" AND o."createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY b."id"
        ORDER BY b."isFeatured" DESC, "revenue30d" DESC NULLS LAST
        LIMIT ${limit}
      `
    )) as Array<{
      id: string
      name: string
      slug: string | null
      logoUrl: string | null
      isFeatured: boolean | null
      productCount: number | string | null
      revenue30d: number | string | null
      units30d: number | string | null
    }>

    const mapped = brands.map<BrandApiResponse>((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl,
      isFeatured: Boolean(brand.isFeatured),
      productCount: countValue(brand.productCount),
      revenue30d: numeric(brand.revenue30d),
      units30d: numeric(brand.units30d),
    }))

    const validated = BrandApiResponseSchema.array().parse(mapped)
    catalogCache.set(cacheKey, { brands: validated }, CACHE_TTL)

    return NextResponse.json({
      brands: validated,
      meta: { count: validated.length },
    })
  } catch (error) {
    console.error('[api/brands/featured] Failed', error)
    return NextResponse.json({ error: 'Failed to load brands' }, { status: 500 })
  }
}
