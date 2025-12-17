import { NextRequest, NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { catalogCache } from '@/lib/cache'
import { fetchCatalogProductRows, mapCatalogProductRow } from '@/lib/queries/catalog'
import { ProductApiResponseSchema } from '@/lib/schemas/catalog'

const CACHE_TTL = 60_000

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const customerId =
      request.headers.get('x-customer-id') ?? url.searchParams.get('customerId') ?? undefined
    const limitParam = url.searchParams.get('limit')
    const limit = limitParam ? Math.min(Number(limitParam) || 8, 24) : 8

    const cacheKey = `products:featured:${customerId ?? 'anon'}:${limit}`
    const cached = catalogCache.get<{ products: ReturnType<typeof mapCatalogProductRow>[] }>(cacheKey)

    if (cached) {
      return NextResponse.json({ products: cached.products, cached: true })
    }

    const { rows } = await fetchCatalogProductRows(prisma, {
      customerId,
      featuredOnly: true,
      page: 1,
      pageSize: limit,
      sort: 'revenue',
    })

    const mapped = rows.map(mapCatalogProductRow)
    const products = ProductApiResponseSchema.array().parse(mapped)

    catalogCache.set(cacheKey, { products }, CACHE_TTL)

    return NextResponse.json({
      products,
      meta: {
        count: products.length,
        window: '30d',
      },
    })
  } catch (error) {
    console.error('[api/products/featured] Failed', error)
    return NextResponse.json({ error: 'Failed to load featured products' }, { status: 500 })
  }
}
