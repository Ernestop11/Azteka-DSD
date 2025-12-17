import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import type { Prisma } from '@prisma/client'

import prisma from '@/lib/prisma'
import { findBundle, loadBundleManifest } from '@/lib/bundles'
import { ApiError, handleApiError } from '@/lib/apiErrors'
import { normalizeSku } from '@/lib/utils/skuNormalize'
import type { TApiResponse } from '@/types/api'

const BundlePriceInputSchema = z.object({
  bundleId: z.string().min(1),
})

type BundlePriceResponse = {
  bundle: {
    id: string
    name: string
    type: string
    price: number
  }
  breakdown: Array<{
    sku: string
    productId: string | null
    name: string
    quantity: number
    unitPrice: number | null
    linePrice: number | null
    missing: boolean
  }>
  totals: {
    subtotal: number | null
    bundlePrice: number
    savings: number | null
    savingsPercent: number | null
  }
  missingProducts?: Array<{ sku: string; name: string }>
  invalid: boolean
}

const decimalToNumber = (value: Prisma.Decimal | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  return Number(value.toString())
}

export async function POST(request: NextRequest) {
  try {
    const payload = BundlePriceInputSchema.parse(await request.json())
    const manifest = await loadBundleManifest()
    const bundle = findBundle(manifest, payload.bundleId)

    if (!bundle) {
      throw new ApiError(404, 'Bundle not found')
    }

    // Normalize SKUs for lookup
    const normalizedSkus = bundle.items.map((item) => normalizeSku(item.sku)).filter(Boolean)
    
    // Query products with case-insensitive SKU matching
    const products =
      normalizedSkus.length > 0
        ? await prisma.product.findMany({
            where: {
              sku: {
                in: normalizedSkus,
                mode: 'insensitive',
              },
            },
            select: { id: true, name: true, sku: true, price: true },
          })
        : []

    // Create price map with normalized SKUs
    const priceMap = new Map<string, number>()
    products.forEach((product) => {
      const normalized = normalizeSku(product.sku)
      if (normalized) {
        const price = decimalToNumber(product.price)
        if (price !== null) {
          priceMap.set(normalized, price)
        }
      }
    })

    const breakdown = bundle.items.map((item) => {
      const normalizedSkuKey = normalizeSku(item.sku)
      const unitPrice = priceMap.get(normalizedSkuKey) ?? null
      const linePrice = unitPrice !== null ? Number((unitPrice * item.quantity).toFixed(2)) : null
      const product = products.find((p) => normalizeSku(p.sku) === normalizedSkuKey)

      return {
        sku: item.sku,
        productId: product?.id ?? null,
        name: product?.name ?? 'Pending Catalog Item',
        quantity: item.quantity,
        unitPrice: unitPrice ?? null, // null if not found, never 0
        linePrice: linePrice ?? null, // null if not found, never 0
        missing: unitPrice === null, // Flag missing products
      }
    })

    // Filter out items with missing prices for subtotal calculation
    const validItems = breakdown.filter((item) => item.unitPrice !== null)
    const missingItems = breakdown.filter((item) => item.missing)

    // Calculate subtotal only from items with valid prices
    const subtotal = validItems.length > 0
      ? Number(validItems.reduce((sum, item) => sum + (item.linePrice ?? 0), 0).toFixed(2))
      : null

    const bundlePrice = bundle.price
    const savings = subtotal !== null ? Number((subtotal - bundlePrice).toFixed(2)) : null
    const savingsPercent =
      subtotal !== null && subtotal > 0
        ? bundle.savingsPercent ?? (savings !== null ? Number(((savings / subtotal) * 100).toFixed(2)) : 0)
        : null

    const responseData: BundlePriceResponse = {
      bundle: {
        id: bundle.id,
        name: bundle.name,
        type: bundle.type,
        price: bundlePrice,
      },
      breakdown,
      totals: {
        subtotal: subtotal ?? null,
        bundlePrice,
        savings: savings ?? null,
        savingsPercent: savingsPercent ?? null,
      },
      missingProducts:
        missingItems.length > 0
          ? missingItems.map((item) => ({ sku: item.sku, name: item.name }))
          : undefined,
      invalid: missingItems.length > 0,
    }

    const response: TApiResponse<BundlePriceResponse> = { data: responseData }
    return NextResponse.json(response)
  } catch (error) {
    return handleApiError(error, 'Failed to compute bundle pricing')
  }
}
