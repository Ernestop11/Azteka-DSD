import type { z } from 'zod'

import {
  ProductApiResponseSchema,
  BrandApiResponseSchema,
  CategoryApiResponseSchema,
  BundleApiResponseSchema,
} from '@/lib/schemas/catalog'

export type ProductExportRecord = {
  id: string
  name: string
  slug: string
  sku: string
  priceCase: number
  unitsPerCase: number
  category: string | null
  brand: string | null
  description?: string | null
  imageUrl?: string | null
  updatedAt: string
}

export type VendorPurchaseOrderRow = {
  Name?: string
  'Product Name'?: string
  SKU?: string
  Category?: string
  Brand?: string
  'Sales Price'?: string | number
  Price?: string | number
  'Price Case'?: string | number
  'Case Pack'?: string | number
  Units?: string | number
  'Units Per Case'?: string | number
  [key: string]: string | number | null | undefined
}

export type SyncBrandInput = {
  id?: string
  name: string
  slug?: string
}

export type SyncCategoryInput = {
  id?: string
  name: string
  slug?: string
  parentName?: string
}

export type ProductApiResponse = z.infer<typeof ProductApiResponseSchema>
export type BrandApiResponse = z.infer<typeof BrandApiResponseSchema>
export type CategoryApiResponse = z.infer<typeof CategoryApiResponseSchema>
export type BundleApiResponse = z.infer<typeof BundleApiResponseSchema>

// ============================================================================
// UNIFIED CATALOG UI SCHEMA
// TypeScript definitions for all visual catalog components
// ============================================================================

// ============================================================================
// CORE ENUMS & CONSTANTS
// ============================================================================

/**
 * Product tier levels for pricing and display
 */
export type ProductTier = 'A' | 'B' | 'C'

/**
 * Product badge types for promotions and highlights
 */
export type ProductBadge = 'NEW' | 'SALE' | 'HOT' | 'LIMITED'

/**
 * Seasonal theme variants
 */
export type SeasonalTheme = 'christmas' | 'summer' | 'dia-muertos'

/**
 * Visual theme variants for components
 */
export type VisualTheme = 'default' | 'holiday' | 'summer' | 'muertos'

/**
 * Color theme options for billboards and banners
 */
export type ColorTheme = 'blue' | 'purple' | 'emerald' | 'orange'

/**
 * Glossiness levels for product cards
 */
export type GlossLevel = 'none' | 'soft' | 'premium'

/**
 * Image position options for billboards
 */
export type ImagePosition = 'left' | 'right'

/**
 * Overlay styles for hero banners
 */
export type OverlayStyle = 'dark' | 'light' | 'gradient'

/**
 * Marquee scroll directions
 */
export type MarqueeDirection = 'left' | 'right'

/**
 * Bundle badge types
 */
export type BundleBadge = 'BEST VALUE' | 'POPULAR' | 'LIMITED TIME'

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

/**
 * Tier configuration with visual properties
 */
export interface TierConfig {
  id: ProductTier
  name: string
  description: string
  gradient: string
  bgGradient: string
  textColor: string
  borderColor: string
  iconColor: string
  priority: number
}

/**
 * Default tier configurations
 */
export const TIER_CONFIGS: Record<ProductTier, TierConfig> = {
  A: {
    id: 'A',
    name: 'Premium',
    description: 'Top-tier products',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    bgGradient: 'from-amber-50 to-yellow-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
    iconColor: 'text-amber-600',
    priority: 1,
  },
  B: {
    id: 'B',
    name: 'Standard',
    description: 'Quality essentials',
    gradient: 'from-slate-400 via-gray-500 to-slate-600',
    bgGradient: 'from-slate-50 to-gray-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-400',
    iconColor: 'text-slate-600',
    priority: 2,
  },
  C: {
    id: 'C',
    name: 'Value',
    description: 'Budget-friendly',
    gradient: 'from-orange-500 via-amber-600 to-orange-700',
    bgGradient: 'from-orange-50 to-amber-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-500',
    iconColor: 'text-orange-600',
    priority: 3,
  },
}

// ============================================================================
// BADGE CONFIGURATION
// ============================================================================

/**
 * Badge configuration with visual properties
 */
export interface BadgeConfig {
  id: ProductBadge
  label: string
  gradient: string
  textColor: string
  animated?: boolean
}

/**
 * Default badge configurations
 */
export const BADGE_CONFIGS: Record<ProductBadge, BadgeConfig> = {
  NEW: {
    id: 'NEW',
    label: 'NEW',
    gradient: 'from-blue-500 to-cyan-500',
    textColor: 'text-white',
    animated: false,
  },
  SALE: {
    id: 'SALE',
    label: 'SALE',
    gradient: 'from-red-500 to-pink-500',
    textColor: 'text-white',
    animated: true,
  },
  HOT: {
    id: 'HOT',
    label: 'HOT',
    gradient: 'from-orange-500 to-red-600',
    textColor: 'text-white',
    animated: true,
  },
  LIMITED: {
    id: 'LIMITED',
    label: 'LIMITED',
    gradient: 'from-purple-500 to-indigo-600',
    textColor: 'text-white',
    animated: true,
  },
}

// ============================================================================
// SEASONAL CONFIGURATION
// ============================================================================

/**
 * Seasonal theme configuration
 */
export interface SeasonalConfig {
  id: SeasonalTheme
  title: string
  subtitle: string
  gradient: string
  bgPattern: string
  iconColor: string
  accentColor: string
  icon: string // Icon component name
}

/**
 * Default seasonal configurations
 */
export const SEASONAL_CONFIGS: Record<SeasonalTheme, SeasonalConfig> = {
  christmas: {
    id: 'christmas',
    title: 'Christmas Collection',
    subtitle: 'Celebrate the Season',
    gradient: 'from-red-600 via-green-600 to-red-700',
    bgPattern: 'bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.1),rgba(22,163,74,0.1))]',
    iconColor: 'text-red-600',
    accentColor: 'from-red-500 to-green-600',
    icon: 'Snowflake',
  },
  summer: {
    id: 'summer',
    title: 'Summer Favorites',
    subtitle: 'Beat the Heat',
    gradient: 'from-cyan-500 via-blue-500 to-purple-600',
    bgPattern: 'bg-[radial-gradient(circle_at_50%_120%,rgba(6,182,212,0.1),rgba(147,51,234,0.1))]',
    iconColor: 'text-cyan-500',
    accentColor: 'from-cyan-500 to-purple-600',
    icon: 'Sun',
  },
  'dia-muertos': {
    id: 'dia-muertos',
    title: 'Día de Muertos',
    subtitle: 'Honor & Celebrate',
    gradient: 'from-orange-600 via-pink-600 to-purple-700',
    bgPattern: 'bg-[radial-gradient(circle_at_50%_120%,rgba(234,88,12,0.1),rgba(126,34,206,0.1))]',
    iconColor: 'text-orange-600',
    accentColor: 'from-orange-500 to-purple-600',
    icon: 'Skull',
  },
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

/**
 * Base product with essential fields
 */
export interface BaseProduct {
  id: string
  name: string
  description?: string | null
  imageUrl: string
  price: number
  sku?: string
}

/**
 * Tiered pricing structure
 */
export interface TieredPricing {
  priceTierA?: number | null
  priceTierB?: number | null
  priceTierC?: number | null
  activeTier?: ProductTier | null // Current user's tier for display
}

/**
 * Product visual enhancements
 */
export interface ProductVisuals {
  badge?: ProductBadge | null
  tier?: ProductTier | null
  seasonal?: SeasonalTheme | null
  theme?: VisualTheme | null
  glossLevel?: GlossLevel
  sparkle?: boolean
}

/**
 * Product rewards and ratings
 */
export interface ProductMetadata {
  rewardsPoints?: number
  points?: number // Alternative field name
  rating?: number // 1-5 stars
  reviewCount?: number
  brand?: string
  brandId?: string
  category?: string
  categoryId?: string
}

/**
 * Product pricing and discounts
 */
export interface ProductPricing extends TieredPricing {
  originalPrice?: number
  discountPercent?: number
  savings?: number
}

/**
 * Complete product for catalog display
 */
export interface CatalogProduct extends BaseProduct, ProductVisuals, ProductMetadata, ProductPricing {
  // Computed fields
  hasDiscount?: boolean
  displayPrice?: number
  inStock?: boolean
  stockCount?: number
}

// ============================================================================
// BRAND TYPES
// ============================================================================

/**
 * Brand information
 */
export interface Brand {
  id: string
  name: string
  slug: string
  logoUrl: string
  imageUrl?: string | null
  description?: string | null
  productCount?: number
  featured?: boolean
  priority?: number
}

/**
 * Brand mapping for quick lookups
 */
export type BrandMap = Record<string, Brand>

// ============================================================================
// BUNDLE TYPES
// ============================================================================

/**
 * Product included in a bundle
 */
export interface BundleProduct {
  id: string
  name: string
  imageUrl: string
  price?: number
  quantity?: number
}

/**
 * Complete bundle definition
 */
export interface Bundle {
  id: string
  name: string
  slug?: string
  description: string
  products: BundleProduct[]
  originalPrice: number
  bundlePrice: number
  savings: number
  savingsPercent?: number
  badge?: BundleBadge | null
  imageUrl?: string
  featured?: boolean
  seasonal?: SeasonalTheme | null
}

/**
 * Bundle mapping for quick lookups
 */
export type BundleMap = Record<string, Bundle>

// ============================================================================
// MARQUEE TYPES
// ============================================================================

/**
 * Item displayed in marquee scroll
 */
export interface MarqueeItem {
  id: string
  imageUrl: string
  title: string
  price?: number
  badge?: string
  linkUrl?: string
}

// ============================================================================
// HERO BANNER TYPES
// ============================================================================

/**
 * Hero banner configuration
 */
export interface HeroBanner {
  active?: boolean
  title?: string
  headline?: string
  subtitle?: string
  subheadline?: string
  imageUrl?: string
  ctaText?: string
  ctaLink?: string
  theme?: SeasonalTheme | 'default'
  overlay?: OverlayStyle
}

/**
 * Complete catalog layout structure
 */
export interface CatalogLayout {
  heroBanner: HeroBanner | null
  showcase: CatalogProduct[]
  promos: any[]
  brands: Brand[]
  categories: any[]
  trending: CatalogProduct[]
  sabritasProducts?: CatalogProduct[]
  barcelProducts?: CatalogProduct[]
  seasonalProducts?: CatalogProduct[]
  drinkProducts?: CatalogProduct[]
  bundles?: any[]
  promotionalSections?: any[]
  promoBanners?: any[]
  holidayTheme?: string
}

// ============================================================================
// BILLBOARD TYPES
// ============================================================================

/**
 * Billboard promotional section
 */
export interface Billboard {
  title: string
  subtitle?: string
  description?: string
  imageUrl: string
  imagePosition?: ImagePosition
  ctaText?: string
  ctaLink?: string
  theme?: ColorTheme
  overlay?: boolean
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props for GlossyProductCard component
 */
export interface GlossyProductCardProps {
  product: CatalogProduct
  index?: number
  onClick?: () => void
  onAddToCart?: () => void
  showTierPricing?: boolean
  showRewards?: boolean
  showRating?: boolean
}

/**
 * Props for BrandSection component
 */
export interface BrandSectionProps {
  brands: Brand[]
  title?: string
  subtitle?: string
  onBrandClick?: (brandId: string) => void
  onViewAll?: () => void
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

/**
 * Props for SeasonalSection component
 */
export interface SeasonalSectionProps {
  season: SeasonalTheme
  products: CatalogProduct[]
  title?: string // Override default title
  subtitle?: string // Override default subtitle
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  onViewAll?: () => void
  maxProducts?: number
}

/**
 * Props for BundleCard component
 */
export interface BundleCardProps {
  bundle: Bundle
  index?: number
  onAddToCart?: () => void
  onClick?: () => void
  showSavings?: boolean
  showProductCount?: boolean
}

/**
 * Props for Billboard component
 */
export interface BillboardProps {
  title: string
  subtitle?: string
  description?: string
  imageUrl: string
  imagePosition?: ImagePosition
  ctaText?: string
  ctaLink?: string
  theme?: ColorTheme
  overlay?: boolean
  onCtaClick?: () => void
}

/**
 * Tier count information
 */
export interface TierCounts {
  A: number
  B: number
  C: number
}

/**
 * Props for PriceTierBar component
 */
export interface PriceTierBarProps {
  activeTier?: ProductTier | null
  onTierSelect?: (tier: ProductTier | null) => void
  showCounts?: boolean
  tierCounts?: TierCounts
  highlightActive?: boolean
  sticky?: boolean
}

/**
 * Props for HeroBanner component
 */
export interface HeroBannerProps {
  title: string
  subtitle?: string
  imageUrl: string
  ctaText?: string
  ctaLink?: string
  theme?: SeasonalTheme | 'default'
  overlay?: OverlayStyle
  onCtaClick?: () => void
}

/**
 * Props for MarqueeScroll component
 */
export interface MarqueeScrollProps {
  items: MarqueeItem[]
  speed?: number // seconds for one complete loop
  direction?: MarqueeDirection
  pauseOnHover?: boolean
  title?: string
  subtitle?: string
  onItemClick?: (item: MarqueeItem) => void
}

/**
 * Props for CatalogShowcase component
 */
export interface CatalogShowcaseProps {
  // Hero section
  hero?: HeroBanner

  // Featured/Trending
  featuredProducts?: CatalogProduct[]
  trendingItems?: MarqueeItem[]

  // Brands
  brands?: Brand[]
  showBrands?: boolean

  // Seasonal
  seasonalSections?: {
    season: SeasonalTheme
    products: CatalogProduct[]
  }[]

  // Bundles
  bundles?: Bundle[]
  showBundles?: boolean

  // Billboards
  billboards?: Billboard[]

  // Tiered products
  tieredProducts?: {
    A: CatalogProduct[]
    B: CatalogProduct[]
    C: CatalogProduct[]
  }

  // User context
  userTier?: ProductTier | null

  // Callbacks
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
  onBrandClick?: (brandId: string) => void
  onBundleClick?: (bundleId: string) => void
  onAddBundleToCart?: (bundleId: string) => void
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Filter options for catalog
 */
export interface CatalogFilters {
  tiers?: ProductTier[]
  brands?: string[]
  categories?: string[]
  seasonal?: SeasonalTheme[]
  badges?: ProductBadge[]
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  search?: string
}

/**
 * Sort options for catalog
 */
export type CatalogSortOption =
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'
  | 'rating-desc'
  | 'newest'
  | 'popular'

/**
 * Pagination information
 */
export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

/**
 * Catalog state for managing products
 */
export interface CatalogState {
  products: CatalogProduct[]
  filters: CatalogFilters
  sort: CatalogSortOption
  pagination: Pagination
  loading: boolean
  error?: string | null
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Product with computed display properties
 */
export type DisplayProduct = CatalogProduct & {
  displayPrice: number
  hasDiscount: boolean
  discountPercent: number
  showTierRibbon: boolean
  hasTieredPricing: boolean
}

/**
 * Bundle with computed properties
 */
export type DisplayBundle = Bundle & {
  savingsPercent: number
  productCount: number
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if product has tiered pricing
 */
export function hasTieredPricing(product: CatalogProduct): boolean {
  return Boolean(
    product.priceTierA !== null && product.priceTierA !== undefined ||
    product.priceTierB !== null && product.priceTierB !== undefined ||
    product.priceTierC !== null && product.priceTierC !== undefined
  )
}

/**
 * Check if product has discount
 */
export function hasDiscount(product: CatalogProduct): boolean {
  return Boolean(product.originalPrice && product.originalPrice > product.price)
}

/**
 * Check if tier is valid
 */
export function isValidTier(tier: unknown): tier is ProductTier {
  return tier === 'A' || tier === 'B' || tier === 'C'
}

/**
 * Check if badge is valid
 */
export function isValidBadge(badge: unknown): badge is ProductBadge {
  return badge === 'NEW' || badge === 'SALE' || badge === 'HOT' || badge === 'LIMITED'
}

/**
 * Check if seasonal theme is valid
 */
export function isValidSeason(season: unknown): season is SeasonalTheme {
  return season === 'christmas' || season === 'summer' || season === 'dia-muertos'
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get display price for product based on active tier
 */
export function getDisplayPrice(product: CatalogProduct): number {
  if (hasTieredPricing(product) && product.activeTier) {
    const tierKey = `priceTier${product.activeTier}` as 'priceTierA' | 'priceTierB' | 'priceTierC'
    const tierPrice = product[tierKey]
    if (tierPrice !== null && tierPrice !== undefined && typeof tierPrice === 'number') {
      return tierPrice
    }
  }
  return product.price
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(product: CatalogProduct): number {
  const displayPrice = getDisplayPrice(product)
  const comparePrice = product.originalPrice || product.price

  if (comparePrice <= displayPrice) return 0

  return Math.round(((comparePrice - displayPrice) / comparePrice) * 100)
}

/**
 * Calculate bundle savings percentage
 */
export function calculateBundleSavings(bundle: Bundle): number {
  if (bundle.originalPrice <= 0) return 0
  return Math.round((bundle.savings / bundle.originalPrice) * 100)
}

/**
 * Get tier configuration
 */
export function getTierConfig(tier: ProductTier): TierConfig {
  return TIER_CONFIGS[tier]
}

/**
 * Get badge configuration
 */
export function getBadgeConfig(badge: ProductBadge): BadgeConfig {
  return BADGE_CONFIGS[badge]
}

/**
 * Get seasonal configuration
 */
export function getSeasonalConfig(season: SeasonalTheme): SeasonalConfig {
  return SEASONAL_CONFIGS[season]
}

/**
 * Create brand map from array
 */
export function createBrandMap(brands: Brand[]): BrandMap {
  return brands.reduce((map, brand) => {
    map[brand.id] = brand
    return map
  }, {} as BrandMap)
}

/**
 * Create bundle map from array
 */
export function createBundleMap(bundles: Bundle[]): BundleMap {
  return bundles.reduce((map, bundle) => {
    map[bundle.id] = bundle
    return map
  }, {} as BundleMap)
}

/**
 * Filter products by criteria
 */
export function filterProducts(
  products: CatalogProduct[],
  filters: CatalogFilters
): CatalogProduct[] {
  return products.filter((product) => {
    // Tier filter
    if (filters.tiers && filters.tiers.length > 0) {
      if (!product.tier || !filters.tiers.includes(product.tier)) {
        return false
      }
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      if (!product.brandId || !filters.brands.includes(product.brandId)) {
        return false
      }
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!product.categoryId || !filters.categories.includes(product.categoryId)) {
        return false
      }
    }

    // Seasonal filter
    if (filters.seasonal && filters.seasonal.length > 0) {
      if (!product.seasonal || !filters.seasonal.includes(product.seasonal)) {
        return false
      }
    }

    // Badge filter
    if (filters.badges && filters.badges.length > 0) {
      if (!product.badge || !filters.badges.includes(product.badge)) {
        return false
      }
    }

    // Price range filter
    const displayPrice = getDisplayPrice(product)
    if (filters.minPrice !== undefined && displayPrice < filters.minPrice) {
      return false
    }
    if (filters.maxPrice !== undefined && displayPrice > filters.maxPrice) {
      return false
    }

    // Stock filter
    if (filters.inStock && !product.inStock) {
      return false
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesName = product.name.toLowerCase().includes(searchLower)
      const matchesBrand = product.brand?.toLowerCase().includes(searchLower)
      const matchesDescription = product.description?.toLowerCase().includes(searchLower)
      const matchesSku = product.sku?.toLowerCase().includes(searchLower)

      if (!matchesName && !matchesBrand && !matchesDescription && !matchesSku) {
        return false
      }
    }

    return true
  })
}

/**
 * Sort products by option
 */
export function sortProducts(
  products: CatalogProduct[],
  sortOption: CatalogSortOption
): CatalogProduct[] {
  const sorted = [...products]

  switch (sortOption) {
    case 'price-asc':
      return sorted.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b))

    case 'price-desc':
      return sorted.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a))

    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))

    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))

    case 'rating-desc':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))

    case 'newest':
      // Assumes products with 'NEW' badge are newest
      return sorted.sort((a, b) => {
        if (a.badge === 'NEW' && b.badge !== 'NEW') return -1
        if (a.badge !== 'NEW' && b.badge === 'NEW') return 1
        return 0
      })

    case 'popular':
      // Assumes products with 'HOT' badge or high rating are popular
      return sorted.sort((a, b) => {
        const aScore = (a.badge === 'HOT' ? 10 : 0) + (a.rating || 0)
        const bScore = (b.badge === 'HOT' ? 10 : 0) + (b.rating || 0)
        return bScore - aScore
      })

    default:
      return sorted
  }
}
