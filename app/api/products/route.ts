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
    const featuredOnly = url.searchParams.get('featured') === 'true'
    const brandId = url.searchParams.get('brand') ?? url.searchParams.get('brandId') ?? undefined
    const categoryId =
      url.searchParams.get('category') ?? url.searchParams.get('categoryId') ?? undefined
    const search = url.searchParams.get('q') ?? url.searchParams.get('search') ?? undefined
    const pageParam = Number(url.searchParams.get('page') ?? '1')
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1

    const pageSizeParam =
      Number(url.searchParams.get('pageSize') ?? url.searchParams.get('limit') ?? '50')
    const pageSize =
      Number.isFinite(pageSizeParam) && pageSizeParam > 0
        ? Math.min(Math.floor(pageSizeParam), 200)
        : 50

    const sortParam = url.searchParams.get('sort') ?? undefined
    const allowedSorts = new Set(['velocity', 'price', 'alpha', 'revenue'])
    const sort =
      sortParam && allowedSorts.has(sortParam)
        ? (sortParam as 'velocity' | 'price' | 'alpha' | 'revenue')
        : undefined

    const minPriceParam = url.searchParams.get('minPrice')
    const maxPriceParam = url.searchParams.get('maxPrice')
    const minPrice =
      minPriceParam && !Number.isNaN(Number(minPriceParam)) ? Number(minPriceParam) : undefined
    const maxPrice =
      maxPriceParam && !Number.isNaN(Number(maxPriceParam)) ? Number(maxPriceParam) : undefined

    const cacheKey = [
      'products',
      customerId ?? 'anon',
      featuredOnly ? 'featured' : 'all',
      brandId ?? 'any',
      categoryId ?? 'any',
      search ?? 'none',
      `price:${minPrice ?? 'na'}-${maxPrice ?? 'na'}`,
      `page:${page}`,
      `pageSize:${pageSize}`,
      sort ?? 'default',
    ].join(':')

    const cached = catalogCache.get<{ products: ReturnType<typeof mapCatalogProductRow>[] }>(cacheKey)
    if (cached) {
      return NextResponse.json({ products: cached.products, cached: true })
    }

    const { rows, total } = await fetchCatalogProductRows(prisma, {
      customerId,
      featuredOnly,
      brandId,
      categoryId,
      search,
      page,
      pageSize,
      sort,
      minPrice,
      maxPrice,
    })

    const mapped = rows.map(mapCatalogProductRow)
    // Be resilient to partial bad data: if one row fails validation,
    // don't break the entire catalog response.
    const parsed = ProductApiResponseSchema.array().safeParse(mapped)
    const products = parsed.success
      ? parsed.data
      : mapped
          .map((item) => {
            const itemParsed = ProductApiResponseSchema.safeParse(item)
            return itemParsed.success ? itemParsed.data : null
          })
          .filter((item): item is ReturnType<typeof ProductApiResponseSchema.parse> => item !== null)

    if (!parsed.success) {
      console.error('[api/products] Product schema validation failed; returning partial results', {
        totalRows: mapped.length,
        validRows: products.length,
        issues: parsed.error.issues.slice(0, 25),
      })
    }

    catalogCache.set(cacheKey, { products }, CACHE_TTL)

    return NextResponse.json({
      products,
      meta: {
        count: products.length,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        appliedFilters: {
          brandId: brandId ?? null,
          categoryId: categoryId ?? null,
          search: search ?? null,
          minPrice: minPrice ?? null,
          maxPrice: maxPrice ?? null,
        },
      },
    })
  } catch (error) {
    console.error('[api/products] Failed to load catalog', error)
    return NextResponse.json({ error: 'Failed to load catalog products' }, { status: 500 })
  }
}
