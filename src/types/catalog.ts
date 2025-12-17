/**
 * Shared catalog-facing types for Azteka DSD UI layers.
 * These are intentionally lightweight and focused on client rendering needs.
 */

export type CatalogTier = 'A' | 'B' | 'C'
export type CatalogProductBadge = 'NEW' | 'HOT' | 'LIMITED' | 'SALE'
export type CatalogProductTheme = 'default' | 'holiday' | 'summer' | 'muertos'
export type CatalogGlossLevel = 'none' | 'soft' | 'premium'

export interface CatalogBrandRef {
  id: string
  name: string
}

export interface CatalogCategoryRef {
  id: string
  name: string
}

export interface CatalogProduct {
  id: string
  name: string
  sku?: string | null
  description?: string | null
  price: number | string
  unitsPerCase?: number | null
  imageUrl?: string | null
  backgroundColor?: string | null
  backgroundGradient?: string | null
  featured?: boolean
  seasonal?: boolean
  trending?: boolean
  category?: CatalogCategoryRef | { id: string; name: string } | string | null
  brand?: CatalogBrandRef | { id: string; name: string } | string | null
  gradientPresetId?: string | number | null
  glowPresetId?: string | null
  splashPresetId?: string | null
  badgeText?: string | null
  badgeColor?: string | null
  cardTheme?: 'basic' | 'gradient' | 'splash' | null
  tier?: CatalogTier | string | null
  activeTier?: CatalogTier | null
  priceTierA?: number | null
  priceTierB?: number | null
  priceTierC?: number | null
  points?: number | null
  rewardsPoints?: number | null
  originalPrice?: number | null
  glossLevel?: CatalogGlossLevel | string | null
  sparkle?: boolean
  badge?: CatalogProductBadge | string | null
  theme?: CatalogProductTheme | string | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface HeroBannerConfig {
  active?: boolean
  title?: string | null
  subtitle?: string | null
  headline?: string | null
  subheadline?: string | null
  imageUrl?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  theme?: CatalogProductTheme | string | null
  overlay?: 'dark' | 'light' | 'gradient' | 'festive' | null
}

export interface PromoPanel {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  imageUrl?: string | null
  imagePosition?: 'left' | 'right' | 'top' | 'bottom' | string | null
  theme?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  active?: boolean
  displayOrder?: number | null
}

export interface CatalogBrand {
  id: string
  name: string
  slug?: string | null
  imageUrl?: string | null
}

export interface CatalogCategory {
  id: string
  name: string
  slug?: string | null
  imageUrl?: string | null
}

export interface CatalogLayout {
  heroBanner?: HeroBannerConfig | null
  showcase: CatalogProduct[]
  promos: PromoPanel[]
  brands: CatalogBrand[]
  categories: CatalogCategory[]
  trending: CatalogProduct[]
}
