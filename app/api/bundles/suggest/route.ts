import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import prisma from '@/lib/prisma'
import { loadBundleManifest, CatalogBundle, validateBundleSkus } from '@/lib/bundles'
import { catalogCache } from '@/lib/cache'
import { ApiError, handleApiError } from '@/lib/apiErrors'
import { normalizeSku } from '@/lib/utils/skuNormalize'
import type { TApiResponse } from '@/types/api'

const SuggestInputSchema = z.object({
  customerId: z.string().min(1),
  cart: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().default(1),
      })
    )
    .default([]),
})

type BundleSuggestion = {
  bundleId: string
  name: string
  type: string
  heroImage?: string
  confidence: number
  seasonalWeight: number
  expectedLift: number
  reasoning: string
  price: number
}

const CART_CACHE_TTL = 60_000

const now = () => new Date()

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

const SEASONAL_THEMES = new Map([
  ['winter', [11, 0, 1]],
  ['summer', [5, 6, 7]],
  ['spring', [2, 3, 4]],
  ['fall', [8, 9, 10]],
])

function determineSeasonalWeight(bundle: CatalogBundle) {
  if (bundle.type !== 'seasonal') return 0
  const month = now().getMonth()
  const matched = Array.from(SEASONAL_THEMES.values()).some((months) => months.includes(month))
  return matched ? 1 : 0.5
}

type CartItem = {
  productId?: string | null
  quantity?: number
}

async function getCartSkus(cart: CartItem[]) {
  if (cart.length === 0) return new Set<string>()
  const productIds = cart
    .map((item) => item.productId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0)

  if (productIds.length === 0) {
    return new Set<string>()
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, sku: true },
  })
  return new Set(products.map((product) => normalizeSku(product.sku)).filter(Boolean) as string[])
}

async function getCustomerSignals(customerId: string) {
  const [brandRows, categoryRows] = await Promise.all([
    prisma.$queryRaw<Array<{ id: string; name: string; orders: number }>>`
      SELECT b."id", b."name", COUNT(*)::int AS orders
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId" AND o."customerId" = ${customerId}
      JOIN "Product" p ON p."id" = oi."productId"
      LEFT JOIN "Brand" b ON b."id" = p."brandId"
      WHERE o."createdAt" >= NOW() - INTERVAL '90 days'
        AND b."id" IS NOT NULL
      GROUP BY b."id"
      ORDER BY orders DESC
      LIMIT 5
    `,
    prisma.$queryRaw<Array<{ id: string; name: string; orders: number }>>`
      SELECT c."id", c."name", COUNT(*)::int AS orders
      FROM "OrderItem" oi
      JOIN "Order" o ON o."id" = oi."orderId" AND o."customerId" = ${customerId}
      JOIN "Product" p ON p."id" = oi."productId"
      LEFT JOIN "Category" c ON c."id" = p."categoryId"
      WHERE o."createdAt" >= NOW() - INTERVAL '90 days'
        AND c."id" IS NOT NULL
      GROUP BY c."id"
      ORDER BY orders DESC
      LIMIT 5
    `,
  ])

  return {
    preferredBrands: new Set(brandRows.map((row) => row.name.toLowerCase())),
    preferredCategories: new Set(categoryRows.map((row) => row.name.toLowerCase())),
  }
}

function scoreBundle(
  bundle: CatalogBundle,
  cartSkus: Set<string>,
  signals: Awaited<ReturnType<typeof getCustomerSignals>>
): BundleSuggestion {
  const base = 50
  const triggerMatch = (bundle.triggerProducts ?? []).some((trigger) =>
    cartSkus.has(normalizeSku(trigger))
  )
  const triggerScore = triggerMatch ? 20 : 0

  const categoryScore = bundle.tags?.some((tag) =>
    signals.preferredCategories.has(tag.toLowerCase())
  )
    ? 10
    : 0

  const brandScore = bundle.tags?.some((tag) => signals.preferredBrands.has(tag.toLowerCase()))
    ? 10
    : 0

  const seasonalWeight = determineSeasonalWeight(bundle)
  const seasonalScore = seasonalWeight > 0 ? seasonalWeight * 10 : 0

  const confidence = clamp(base + triggerScore + categoryScore + brandScore + seasonalScore)
  const expectedLift = Number(((confidence / 100) * 0.35).toFixed(2))

  const reasons: string[] = []
  if (triggerMatch) reasons.push('Matches items currently in cart')
  if (categoryScore > 0) reasons.push('Aligns with top-ordering categories')
  if (brandScore > 0) reasons.push('Heavy affinity for bundle brand mix')
  if (seasonalScore > 0) reasons.push('Seasonal timing bonus')
  if (reasons.length === 0) reasons.push('Complementary bundle for Smart DSD cart')

  return {
    bundleId: bundle.id,
    name: bundle.name,
    type: bundle.type,
    heroImage: bundle.heroImage,
    confidence,
    seasonalWeight,
    expectedLift,
    reasoning: reasons.join('. '),
    price: bundle.price,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const input = SuggestInputSchema.parse(body)
    const cacheKey = `bundle-suggest:${input.customerId}:${input.cart.length}`
    const cached = catalogCache.get<BundleSuggestion[]>(cacheKey)
    if (cached) {
      const response: TApiResponse<BundleSuggestion[], { cached: boolean }> = {
        data: cached,
        meta: { cached: true },
      }
      return NextResponse.json(response)
    }

    const customer = await prisma.customer.findUnique({ where: { id: input.customerId } })
    if (!customer) {
      throw new ApiError(404, 'Customer not found')
    }

    const [manifest, cartSkus, signals] = await Promise.all([
      loadBundleManifest(),
      getCartSkus(input.cart ?? []),
      getCustomerSignals(input.customerId),
    ])

    // Validate SKUs and filter out bundles with missing products
    const { validBundles } = await validateBundleSkus(manifest.bundles, prisma)

    const suggestions = validBundles
      .map((bundle) => scoreBundle(bundle, cartSkus, signals))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, Math.min(8, Math.max(4, validBundles.length)))

    catalogCache.set(cacheKey, suggestions, CART_CACHE_TTL)

    const response: TApiResponse<BundleSuggestion[]> = { data: suggestions }
    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error, 'Failed to suggest bundles')
  }
}
