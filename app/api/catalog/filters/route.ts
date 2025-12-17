import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { catalogCache } from '@/lib/cache'
import type { TApiResponse, ErrorResponse } from '@/types/api'

type CatalogFilterPayload = {
  brands: Array<{ id: string; name: string; slug: string | null }>
  categories: Array<{ id: string; name: string; slug: string | null }>
  priceRange: { min: number; max: number }
  popularFilters: {
    brands: Array<{ id: string; name: string; orders: number }>
    categories: Array<{ id: string; name: string; orders: number }>
  }
}

const CACHE_KEY = 'catalog:filters'

const toNumber = (value: unknown, fallback = 0) => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function fetchCatalogFilters(client = prisma): Promise<CatalogFilterPayload> {
  const cached = catalogCache.get<CatalogFilterPayload>(CACHE_KEY)
  if (cached) return cached

  const [brands, categories, priceAggregate, popularCategories, popularBrands] = await Promise.all([
    client.brand.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    client.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    client.product.aggregate({
      _min: { price: true },
      _max: { price: true },
    }),
    client.$queryRaw<Array<{ id: string; name: string; orders: number }>>`
      SELECT c."id", c."name", COUNT(*)::int AS orders
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId" AND o."createdAt" >= NOW() - INTERVAL '30 days'
      JOIN "Product" p ON p."id" = oi."productId"
      LEFT JOIN "Category" c ON c."id" = p."categoryId"
      WHERE c."id" IS NOT NULL
      GROUP BY c."id", c."name"
      ORDER BY orders DESC
      LIMIT 5
    `,
    client.$queryRaw<Array<{ id: string; name: string; orders: number }>>`
      SELECT b."id", b."name", COUNT(*)::int AS orders
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId" AND o."createdAt" >= NOW() - INTERVAL '30 days'
      JOIN "Product" p ON p."id" = oi."productId"
      LEFT JOIN "Brand" b ON b."id" = p."brandId"
      WHERE b."id" IS NOT NULL
      GROUP BY b."id", b."name"
      ORDER BY orders DESC
      LIMIT 5
    `,
  ])

  const minPrice = toNumber(priceAggregate._min.price, 0)
  const maxPrice = toNumber(priceAggregate._max.price, minPrice)

  const payload: CatalogFilterPayload = {
    brands: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    })),
    priceRange: {
      min: minPrice,
      max: maxPrice,
    },
    popularFilters: {
      categories: popularCategories
        .filter((category) => Boolean(category.id))
        .map((category) => ({
          id: category.id,
          name: category.name,
          orders: category.orders,
        })),
      brands: popularBrands
        .filter((brand) => Boolean(brand.id))
        .map((brand) => ({
          id: brand.id,
          name: brand.name,
          orders: brand.orders,
        })),
    },
  }

  catalogCache.set(CACHE_KEY, payload, 60_000)
  return payload
}

export async function GET() {
  try {
    const payload = await fetchCatalogFilters(prisma)
    const response: TApiResponse<CatalogFilterPayload> = { data: payload }
    return NextResponse.json(response)
  } catch (error) {
    console.error('[catalog/filters] failed', error)
    const err: ErrorResponse = { error: 'Failed to load filters' }
    return NextResponse.json(err, { status: 500 })
  }
}
