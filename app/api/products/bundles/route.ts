import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { catalogCache } from '@/lib/cache'
import { BundleApiResponseSchema } from '@/lib/schemas/catalog'
import type { BundleApiResponse } from '@/types/catalog'

const CACHE_TTL = 60_000

type BundleRow = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  badgeText: string | null
  badgeColor: string | null
  discountPercent: number | string | null
  price: number | string | null
  stock: number | null
  inStock: boolean | null
  brandId: string | null
  brandName: string | null
  brandSlug: string | null
  categoryId: string | null
  categoryName: string | null
  categorySlug: string | null
  revenue30d: number | string | null
  units30d: number | string | null
}

type BundleItemRow = {
  bundleId: string
  productId: string
  sku: string | null
  name: string | null
  quantity: number
}

const numeric = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const bundleFilterMap: Record<'brand' | 'category' | 'seasonal', Prisma.Sql> = {
  brand: Prisma.sql`b."brandId" IS NOT NULL`,
  category: Prisma.sql`b."categoryId" IS NOT NULL`,
  seasonal: Prisma.sql`
    (
      b."badgeText" ILIKE ANY (ARRAY['%holiday%', '%season%', '%winter%', '%summer%', '%navidad%', '%dia%']) OR
      b."slug" ILIKE ANY (ARRAY['%holiday%', '%season%', '%winter%', '%summer%', '%navidad%', '%dia%'])
    )
  `,
}

async function fetchBundles(type: 'brand' | 'category' | 'seasonal', limit = 6) {
  // TODO: ProductBundle table doesn't exist in schema yet
  // Return empty array to unblock build
  // This route will be implemented when ProductBundle model is added
  return [] as BundleRow[]
  
  // Original query (commented out until ProductBundle table exists):
  // return prisma.$queryRaw(
  //   Prisma.sql`
  //     SELECT
  //       b."id",
  //       b."name",
  //       b."slug",
  //       b."description",
  //       b."imageUrl",
  //       b."badgeText",
  //       b."badgeColor",
  //       b."discountPercent",
  //       b."price",
  //       b."stock",
  //       b."inStock",
  //       b."brandId",
  //       br."name" AS "brandName",
  //       br."slug" AS "brandSlug",
  //       b."categoryId",
  //       c."name" AS "categoryName",
  //       c."slug" AS "categorySlug",
  //       metrics.revenue_30d AS "revenue30d",
  //       metrics.units_30d AS "units30d"
  //     FROM "ProductBundle" b
  //     LEFT JOIN "Brand" br ON br."id" = b."brandId"
  //     LEFT JOIN "Category" c ON c."id" = b."categoryId"
  //     LEFT JOIN LATERAL (
  //       SELECT
  //         COALESCE(SUM(oi."quantity" * oi."priceCase"), 0)::numeric AS revenue_30d,
  //         COALESCE(SUM(oi."quantity"), 0)::numeric AS units_30d
  //       FROM "BundleItem" bi
  //       JOIN "Product" p ON p."id" = bi."productId"
  //       LEFT JOIN "OrderItem" oi ON oi."productId" = p."id"
  //       LEFT JOIN "Order" o ON o."id" = oi."orderId" AND o."createdAt" >= NOW() - INTERVAL '30 days'
  //       WHERE bi."bundleId" = b."id"
  //     ) metrics ON true
  //     WHERE b."active" = true
  //       AND ${bundleFilterMap[type]}
  //     ORDER BY b."featured" DESC, metrics.revenue_30d DESC NULLS LAST, b."updatedAt" DESC
  //     LIMIT ${limit}
  //   `
  // ) as Promise<BundleRow[]>
}

async function fetchBundleItems(bundleIds: string[]) {
  if (bundleIds.length === 0) return []

  return prisma.$queryRaw(
    Prisma.sql`
      SELECT
        bi."bundleId",
        bi."productId",
        p."sku",
        p."name",
        bi."quantity"
      FROM "BundleItem" bi
      JOIN "Product" p ON p."id" = bi."productId"
      WHERE bi."bundleId" IN (${Prisma.join(bundleIds.map((id) => Prisma.sql`${id}`))})
      ORDER BY bi."bundleId", bi."quantity" DESC
    `
  ) as Promise<BundleItemRow[]>
}

const mapBundle = (
  row: BundleRow,
  type: 'brand' | 'category' | 'seasonal',
  itemsByBundle: Record<string, BundleItemRow[]>
): BundleApiResponse => {
  const items = (itemsByBundle[row.id] ?? []).map((item) => ({
    bundleId: item.bundleId,
    productId: item.productId,
    sku: item.sku,
    name: item.name,
    quantity: item.quantity,
  }))

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    badgeText: row.badgeText,
    badgeColor: row.badgeColor,
    price: numeric(row.price) ?? 0,
    discountPercent: numeric(row.discountPercent),
    stock: row.stock,
    inStock: row.inStock ?? (row.stock ?? 0) > 0,
    type,
    brand: row.brandId
      ? {
          id: row.brandId,
          name: row.brandName ?? '',
          slug: row.brandSlug,
        }
      : null,
    category: row.categoryId
      ? {
          id: row.categoryId,
          name: row.categoryName ?? '',
          slug: row.categorySlug,
        }
      : null,
    items,
    metrics: {
      revenue30d: numeric(row.revenue30d),
      units30d: numeric(row.units30d),
    },
  }
}

export async function GET() {
  try {
    const cacheKey = 'products:bundles'
    const cached = catalogCache.get<{
      brandBundles: BundleApiResponse[]
      categoryBundles: BundleApiResponse[]
      seasonalBundles: BundleApiResponse[]
    }>(cacheKey)

    if (cached) {
      return NextResponse.json({ ...cached, cached: true })
    }

    const [brandRows, categoryRows, seasonalRows] = await Promise.all([
      fetchBundles('brand'),
      fetchBundles('category'),
      fetchBundles('seasonal'),
    ])

    const bundleIds = [...brandRows, ...categoryRows, ...seasonalRows].map((bundle) => bundle.id)
    const bundleItems = await fetchBundleItems(bundleIds)
    const itemsByBundle = bundleItems.reduce<Record<string, BundleItemRow[]>>((acc, item) => {
      acc[item.bundleId] = acc[item.bundleId] ?? []
      acc[item.bundleId].push(item)
      return acc
    }, {})

    const brandBundles = BundleApiResponseSchema.array().parse(
      brandRows.map((row) => mapBundle(row, 'brand', itemsByBundle))
    )
    const categoryBundles = BundleApiResponseSchema.array().parse(
      categoryRows.map((row) => mapBundle(row, 'category', itemsByBundle))
    )
    const seasonalBundles = BundleApiResponseSchema.array().parse(
      seasonalRows.map((row) => mapBundle(row, 'seasonal', itemsByBundle))
    )

    const payload = { brandBundles, categoryBundles, seasonalBundles }
    catalogCache.set(cacheKey, payload, CACHE_TTL)

    return NextResponse.json(payload)
  } catch (error) {
    console.error('[api/products/bundles] Failed', error)
    return NextResponse.json({ error: 'Failed to load bundles' }, { status: 500 })
  }
}
