import { promises as fs } from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import type { PrismaClient } from '@prisma/client'

import { catalogCache } from './cache'
import { normalizeSku } from './utils/skuNormalize'

// Zod schemas for validation
export const BundleItemSchema = z.object({
  sku: z.string().min(1),
  productId: z.string().optional(),
  quantity: z.number().int().positive(),
})

export const CatalogBundleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  savingsPercent: z.number().min(0).max(100).optional(),
  triggerProducts: z.array(z.string()).optional(),
  heroImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  items: z.array(BundleItemSchema).min(1),
})

export const BundleManifestSchema = z.object({
  bundles: z.array(CatalogBundleSchema),
})

export type BundleItem = z.infer<typeof BundleItemSchema>
export type CatalogBundle = z.infer<typeof CatalogBundleSchema>
export type BundleManifest = z.infer<typeof BundleManifestSchema>

const MANIFEST_CACHE_KEY = 'catalog:bundles_manifest'
const MANIFEST_PATH = path.resolve(process.cwd(), 'data', 'bundles.json')

export async function loadBundleManifest(filePath = MANIFEST_PATH): Promise<BundleManifest> {
  const cached = catalogCache.get<BundleManifest>(MANIFEST_CACHE_KEY)
  if (cached) return cached

  const file = await fs.readFile(filePath, 'utf8')
  const raw = JSON.parse(file)
  
  // Validate with Zod
  const validationResult = BundleManifestSchema.safeParse(raw)
  if (!validationResult.success) {
    console.error('[bundles] Validation errors:', validationResult.error.errors)
    throw new Error(`Invalid bundle manifest: ${validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`)
  }

  const parsed = validationResult.data

  catalogCache.set(MANIFEST_CACHE_KEY, parsed, 60_000)
  return parsed
}

/**
 * Validates bundle SKUs against Prisma database
 * Returns bundles with missing products flagged
 */
export async function validateBundleSkus(
  bundles: CatalogBundle[],
  prismaClient: PrismaClient
): Promise<{
  validBundles: CatalogBundle[]
  missingProducts: Array<{ bundleId: string; bundleName: string; sku: string }>
}> {
  // Collect all unique SKUs from all bundles
  const allSkus = new Set<string>()
  bundles.forEach((bundle) => {
    bundle.items.forEach((item) => {
      const normalized = normalizeSku(item.sku)
      if (normalized) {
        allSkus.add(normalized)
      }
    })
  })

  if (allSkus.size === 0) {
    return { validBundles: [], missingProducts: [] }
  }

  // Query Prisma for all SKUs (case-insensitive)
  const products = await prismaClient.product.findMany({
    where: {
      sku: {
        in: Array.from(allSkus),
        mode: 'insensitive',
      },
    },
    select: { sku: true },
  })

  // Create set of found SKUs (normalized)
  const foundSkus = new Set(products.map((p: any) => normalizeSku(p.sku)))

  // Check each bundle
  const validBundles: CatalogBundle[] = []
  const missingProducts: Array<{ bundleId: string; bundleName: string; sku: string }> = []

  bundles.forEach((bundle) => {
    const missing: string[] = []
    bundle.items.forEach((item) => {
      const normalized = normalizeSku(item.sku)
      if (normalized && !foundSkus.has(normalized)) {
        missing.push(item.sku)
      }
    })

    if (missing.length === 0) {
      validBundles.push(bundle)
    } else {
      // Log missing products
      console.warn(
        `[bundles] Bundle "${bundle.name}" (${bundle.id}) references missing SKUs: ${missing.join(', ')}`
      )
      missing.forEach((sku) => {
        missingProducts.push({
          bundleId: bundle.id,
          bundleName: bundle.name,
          sku,
        })
      })
    }
  })

  return { validBundles, missingProducts }
}

export function filterBundles(manifest: BundleManifest, productId?: string) {
  if (!productId) {
    return manifest.bundles
  }

  const normalized = normalizeSku(productId)

  return manifest.bundles.filter((bundle) =>
    (bundle.triggerProducts ?? []).some((trigger) => {
      const normalizedTrigger = normalizeSku(trigger)
      return normalizedTrigger === normalized
    })
  )
}

export function findBundle(manifest: BundleManifest, bundleId: string) {
  return manifest.bundles.find((bundle) => bundle.id === bundleId)
}
