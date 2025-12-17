import { NextRequest, NextResponse } from 'next/server'
import type { PrismaClient } from '@prisma/client'

import prisma from '@/lib/prisma'
import { catalogCache } from '@/lib/cache'
import {
  generateSmartDSDRecommendations,
  type SmartDSDOutput,
} from '@/lib/cards/smartDSD'
import type { TApiResponse, ErrorResponse } from '@/types/api'

const LOOKBACK_DAYS = 30
const PRODUCT_LIMIT = 600

type SmartDSDResponse = {
  customer: {
    id: string
    name: string
  }
  recommendations: Array<{
    productId: string
    sku: string
    name: string
    category: string
    brand: string | null
    priceCase: number
    suggestedQuantity: number
    confidenceScore: number
    isReplenishment: boolean
    isNewSuggestion: boolean
    reason: string
    metrics: {
      velocity: number
      seasonality: number
      brandLoyalty: number
      categoryCoverage: number
      synergy: number
    }
  }>
  meta: {
    generatedAt: string
    lookbackDays: number
    totalRecentOrders: number
  }
}

type PrismaDeps = Pick<
  PrismaClient,
  'customer' | 'order' | 'product'
>

const toNumber = (value: unknown, fallback = 0) => {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function buildSmartDSDResponse(client: PrismaDeps, customerId: string) {
  const cacheKey = `smart-dsd:${customerId}`
  const cached = catalogCache.get<SmartDSDResponse>(cacheKey)
  if (cached) {
    return cached
  }

  const customer = await client.customer.findUnique({
    where: { id: customerId },
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const sinceDate = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  const [orders, products] = await Promise.all([
    client.order.findMany({
      where: {
        customerId,
        createdAt: {
          gte: sinceDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                price: true,
              },
            },
          },
        },
      },
    }),
    client.product.findMany({
      take: PRODUCT_LIMIT,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: {
          select: { id: true, name: true },
        },
        brand: {
          select: { id: true, name: true },
        },
      },
    }),
  ])

  if (products.length === 0) {
    return {
      customer: {
        id: customer.id,
        name: customer.businessName,
      },
      recommendations: [],
      meta: {
        generatedAt: new Date().toISOString(),
        lookbackDays: LOOKBACK_DAYS,
        totalRecentOrders: 0,
      },
    }
  }

  // Validate customer ID is a UUID
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)) {
    throw new Error('Invalid customer ID format. Must be a valid UUID.')
  }

  // Build product map for quick lookup
  const productMap = new Map<string, (typeof products)[number]>()
  products.forEach((product) => {
    productMap.set(product.id, product)
  })

  const catalogItems = products.map((product) => {
    // Validate required IDs
    if (!product.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id)) {
      throw new Error(`Invalid product ID format for product ${product.sku || product.name}. Must be a valid UUID.`)
    }

    const categoryId = product.category?.id
    if (!categoryId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId)) {
      throw new Error(`Invalid category ID format for product ${product.sku || product.name}. Must be a valid UUID.`)
    }

    const brandId = product.brand?.id
    if (brandId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandId)) {
      throw new Error(`Invalid brand ID format for product ${product.sku || product.name}. Must be a valid UUID.`)
    }

    const categoryName = product.category?.name ?? 'General'
    const priceCase = toNumber((product as any).priceCase ?? product.price ?? 0, 0)
    const unitsPerCase = product.unitsPerCase || 1

    if (priceCase <= 0) {
      console.warn(`Product ${product.sku || product.name} has invalid price: ${priceCase}`)
    }

    return {
      id: product.id,
      sku: product.sku ?? `SKU-${product.id}`,
      name: product.name,
      category_id: categoryId,
      category_name: categoryName,
      brand_id: brandId ?? null,
      brand_name: product.brand?.name ?? null,
      price_case: priceCase,
      price_unit: Number((priceCase / unitsPerCase).toFixed(2)),
      in_stock: true,
      featured: Boolean((product as any).featured ?? false),
      seasonal: Boolean((product as any).seasonal ?? false),
      seasonal_theme: (product as any).seasonal_theme ?? null,
      seasonal_start: (product as any).seasonal_start ?? null,
      seasonal_end: (product as any).seasonal_end ?? null,
      new_arrival: Boolean((product as any).new_arrival ?? false),
      trending: Boolean((product as any).trending ?? false),
    }
  })

  const recentOrders = orders.flatMap((order) =>
    order.items
      .map((item) => {
        // Validate product ID
        if (!item.productId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId)) {
          console.warn(`Order item has invalid product ID: ${item.productId}`)
          return null
        }

        const product = productMap.get(item.productId)
        if (!product) {
          console.warn(`Product not found in catalog: ${item.productId}`)
          return null
        }

        const sku = item.product?.sku ?? product.sku ?? `SKU-${item.productId}`
        const priceCase =
          item.priceCase ??
          toNumber((item.product as any)?.priceCase ?? item.product?.price ?? product.price ?? 0, 0)

        if (priceCase <= 0) {
          console.warn(`Order item has invalid price: ${priceCase} for product ${sku}`)
        }

        return {
          product_id: item.productId,
          sku,
          quantity: item.quantity,
          price_case: priceCase,
          order_date: new Date(order.createdAt),
        }
      })
      .filter(Boolean)
  )

  const smartInput = {
    customer: {
      id: customer.id,
      name: customer.businessName,
      store_type: undefined,
      location: undefined,
      created_at: customer.createdAt ?? undefined,
    },
    recentOrders: recentOrders.filter((order): order is NonNullable<typeof order> => order !== null),
    productCatalog: catalogItems,
  }

  const smartResult: SmartDSDOutput = generateSmartDSDRecommendations(smartInput)

  const recommendations = smartResult.recommendations
    .map((rec) => {
      const product = productMap.get(rec.product_id)
      if (!product) {
        console.warn(`Product not found for recommendation: ${rec.product_id}`)
        return null
      }

      return {
        productId: product.id,
        sku: product.sku ?? rec.sku,
        name: product.name,
        category: rec.category_name,
        brand: rec.brand_name ?? product.brand?.name ?? null,
        priceCase: rec.price_case,
        suggestedQuantity: rec.suggested_quantity,
        confidenceScore: rec.confidence_score,
        isReplenishment: rec.is_replenishment,
        isNewSuggestion: rec.is_new_suggestion,
        reason: rec.reason,
        metrics: {
          velocity: rec.velocity_score,
          seasonality: rec.seasonality_score,
          brandLoyalty: rec.brand_loyalty_score,
          categoryCoverage: rec.category_coverage_score,
          synergy: rec.synergy_score,
        },
      }
    })
    .filter(Boolean) as SmartDSDResponse['recommendations']

  const payload: SmartDSDResponse = {
    customer: {
      id: customer.id,
      name: customer.businessName,
    },
    recommendations,
    meta: {
      generatedAt: smartResult.metadata.generated_at.toISOString(),
      lookbackDays: smartResult.metadata.lookback_days,
      totalRecentOrders: smartResult.metadata.total_recent_orders,
    },
  }

  catalogCache.set(cacheKey, payload, 60_000)
  return payload
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const customerId =
      request.headers.get('x-customer-id') ??
      url.searchParams.get('customerId') ??
      undefined

    if (!customerId) {
      const err: ErrorResponse = { error: 'customerId is required' }
      return NextResponse.json(err, { status: 400 })
    }

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)) {
      const err: ErrorResponse = { error: 'Invalid customerId format. Must be a valid UUID.' }
      return NextResponse.json(err, { status: 400 })
    }

    const payload = await buildSmartDSDResponse(prisma, customerId)
    const response: TApiResponse<SmartDSDResponse> = { data: payload }
    return NextResponse.json(response)
  } catch (error) {
    console.error('[smart-dsd] failed', error)
    const err: ErrorResponse = { error: 'Failed to generate Smart DSD recommendations' }
    return NextResponse.json(err, { status: 500 })
  }
}
