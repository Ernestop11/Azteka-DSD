/**
 * ProductMapper - Unified Product Data Mapper
 *
 * Converts Prisma Product with relations to CatalogProduct
 * with consistent string-based brand/category fields.
 */

import { getPublicImageUrl } from '@/lib/imageUrl'
import type { CatalogProduct } from '@/types/catalog'

/**
 * Prisma Product type with relations
 */
export interface PrismaProductWithRelations {
  id: string
  name: string
  sku: string | null
  description: string | null
  price: any // Decimal or number
  unitsPerCase: number | null
  imageUrl: string | null
  backgroundColor: string | null
  backgroundGradient: string | null
  featured: boolean | null
  seasonal: boolean | null
  trending: boolean | null
  category?: {
    id: string
    name: string
  } | null
  brand?: {
    id: string
    name: string
  } | null
  gradientPresetId?: string | null
  glowPresetId?: string | null
  splashPresetId?: string | null
  tier?: string | null
  priceTierA?: any | null
  priceTierB?: any | null
  priceTierC?: any | null
  points?: number | null
  glossLevel?: string | null
  sparkle?: boolean | null
  badge?: string | null
  theme?: string | null
}

/**
 * Convert Decimal to number safely
 */
function toNumber(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber(): number }).toNumber()
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Map Prisma Product to CatalogProduct
 *
 * @param product - Prisma product with relations
 * @returns CatalogProduct with normalized fields
 */
export function mapPrismaProductToCatalog(
  product: PrismaProductWithRelations
): CatalogProduct {
  return {
    // Base fields
    id: product.id,
    name: product.name || 'Unnamed Product',
    sku: product.sku || undefined,
    description: product.description || null,

    // Image - ALWAYS normalized string
    imageUrl: getPublicImageUrl(product.imageUrl || ''),

    // Price - ALWAYS number
    price: toNumber(product.price),

    // Brand - ALWAYS string (not object)
    brand: product.brand?.name || undefined,
    brandId: product.brand?.id || undefined,

    // Category - ALWAYS string (not object)
    category: product.category?.name || undefined,
    categoryId: product.category?.id || undefined,

    // Tier pricing - ALWAYS numbers
    priceTierA: product.priceTierA !== null && product.priceTierA !== undefined
      ? toNumber(product.priceTierA)
      : null,
    priceTierB: product.priceTierB !== null && product.priceTierB !== undefined
      ? toNumber(product.priceTierB)
      : null,
    priceTierC: product.priceTierC !== null && product.priceTierC !== undefined
      ? toNumber(product.priceTierC)
      : null,

    // Visual properties
    tier: (product.tier === 'A' || product.tier === 'B' || product.tier === 'C')
      ? product.tier
      : null,
    badge: (product.badge === 'NEW' || product.badge === 'SALE' || product.badge === 'HOT' || product.badge === 'LIMITED')
      ? product.badge
      : null,
    glossLevel: (product.glossLevel === 'none' || product.glossLevel === 'soft' || product.glossLevel === 'premium')
      ? product.glossLevel
      : 'none',
    sparkle: product.sparkle || false,
    theme: (product.theme === 'default' || product.theme === 'holiday' || product.theme === 'summer' || product.theme === 'muertos')
      ? product.theme
      : 'default',

    // Metadata
    rewardsPoints: product.points || undefined,
    points: product.points || undefined,

    // Flags
    inStock: true, // Default to true unless stock tracking is implemented
  }
}

/**
 * Map array of Prisma products to CatalogProducts
 */
export function mapPrismaProductsArrayToCatalog(
  products: PrismaProductWithRelations[]
): CatalogProduct[] {
  return products.map(mapPrismaProductToCatalog)
}

/**
 * Type guard: Check if value is a valid ProductTier
 */
export function isValidTier(value: unknown): value is 'A' | 'B' | 'C' {
  return value === 'A' || value === 'B' || value === 'C'
}

/**
 * Type guard: Check if value is a valid ProductBadge
 */
export function isValidBadge(value: unknown): value is 'NEW' | 'SALE' | 'HOT' | 'LIMITED' {
  return value === 'NEW' || value === 'SALE' || value === 'HOT' || value === 'LIMITED'
}

/**
 * Type guard: Check if value is a valid GlossLevel
 */
export function isValidGlossLevel(value: unknown): value is 'none' | 'soft' | 'premium' {
  return value === 'none' || value === 'soft' || value === 'premium'
}

/**
 * Type guard: Check if value is a valid VisualTheme
 */
export function isValidTheme(value: unknown): value is 'default' | 'holiday' | 'summer' | 'muertos' {
  return value === 'default' || value === 'holiday' || value === 'summer' || value === 'muertos'
}
