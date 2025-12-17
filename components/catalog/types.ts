/**
 * Centralized prop types for all Catalog MVP components
 * Ensures consistency between components and editor integrations
 */

// ============================================================================
// HERO BANNER
// ============================================================================

export interface HeroBannerProps {
  // Required
  imageUrl: string

  // Content (supports both naming conventions)
  title?: string
  subtitle?: string
  headline?: string // Alternative to title
  subheadline?: string // Alternative to subtitle

  // Theme & Styling
  theme?: 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'
  overlay?: 'dark' | 'light' | 'gradient' | 'festive'

  // CTA
  ctaText?: string
  ctaLink?: string
  onCtaClick?: () => void
}

// ============================================================================
// PROMO PANEL
// ============================================================================

export interface PromoPanelProps {
  // Required
  title: string
  discount: number // Percentage (e.g., 30 for 30%)
  productImage: string // imageUrl alternative

  // Optional
  description?: string
  badge?: string
  variant?: 'chedraui' | 'walmart' | 'default'
  ctaText?: string
  onCtaClick?: () => void

  // Alternative naming
  imageUrl?: string // Alternative to productImage

  // Layout
  index?: number
}

// ============================================================================
// SHOWCASE SECTION
// ============================================================================

export interface ShowcaseProduct {
  id: string
  name: string
  imageUrl: string
  price?: number
  badge?: string
}

export interface ShowcaseSectionVisualProps {
  title: string
  subtitle?: string
  products: ShowcaseProduct[]
  backgroundPattern?: 'festive' | 'geometric' | 'gradient'
  layout?: 'horizontal' | 'grid'
  ribbonColor?: string
  onProductClick?: (productId: string) => void
  onViewAll?: () => void
}

// ============================================================================
// TRENDING ROW
// ============================================================================

export interface TrendingProduct {
  id: string
  name: string
  imageUrl: string
  price?: number
  discount?: number
  badge?: string
}

export interface TrendingRowVisualProps {
  title?: string
  subtitle?: string
  products: TrendingProduct[]
  gradientTheme?: 'red' | 'blue' | 'purple' | 'gold'
  onProductClick?: (productId: string) => void
}

// ============================================================================
// BRANDS ROW
// ============================================================================

export interface BrandVisual {
  id: string
  name: string
  logoUrl: string
  imageUrl?: string // Alternative to logoUrl
  productCount?: number
  featured?: boolean
}

export interface BrandsRowVisualProps {
  title?: string
  subtitle?: string
  brands: BrandVisual[]
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  onBrandClick?: (brandId: string) => void
  onViewAll?: () => void
}

// ============================================================================
// CATEGORIES ROW
// ============================================================================

export interface CategoryVisual {
  id: string
  name: string
  imageUrl: string
  productCount?: number
  color?: string // Gradient override
  description?: string
}

export interface CategoriesRowVisualProps {
  title?: string
  subtitle?: string
  categories: CategoryVisual[]
  layout?: 'grid' | 'horizontal'
  festiveEdges?: boolean
  onCategoryClick?: (categoryId: string) => void
  onViewAll?: () => void
}

// ============================================================================
// PRODUCT GRID
// ============================================================================

export interface ProductGridProps {
  products: any[] // Uses CatalogProduct from types/catalog.ts
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  activeTier?: 'A' | 'B' | 'C' | null
  loading?: boolean
  emptyMessage?: string
  onProductClick?: (productId: string) => void
  onAddToCart?: (productId: string) => void
}

// ============================================================================
// GLOSSY PRODUCT CARD
// ============================================================================

export interface GlossyProductCardProduct {
  id: string
  name: string
  imageUrl: string
  price: number

  // Optional
  brand?: string
  originalPrice?: number
  tier?: 'A' | 'B' | 'C'
  badge?: 'NEW' | 'SALE' | 'HOT' | 'LIMITED'
  rewardsPoints?: number
  rating?: number

  // Tiered Pricing
  priceTierA?: number | null
  priceTierB?: number | null
  priceTierC?: number | null
  activeTier?: 'A' | 'B' | 'C' | null

  // Visual Enhancements
  seasonal?: 'christmas' | 'summer' | 'dia-muertos'
  glossLevel?: 'none' | 'soft' | 'premium'
  sparkle?: boolean
  theme?: 'default' | 'holiday' | 'summer' | 'muertos'
}

export interface GlossyProductCardProps {
  product: GlossyProductCardProduct
  index?: number
  onClick?: () => void
  onAddToCart?: () => void
  showTierPricing?: boolean
  showRewards?: boolean
  showRating?: boolean
}

// ============================================================================
// PRICE TIER BAR
// ============================================================================

export interface PriceTierBarProps {
  activeTier?: 'A' | 'B' | 'C' | null
  onTierSelect?: (tier: 'A' | 'B' | 'C' | null) => void
  showCounts?: boolean
  tierCounts?: {
    A: number
    B: number
    C: number
  }
  highlightActive?: boolean
  sticky?: boolean
}

// ============================================================================
// IMAGE PREVIEW CARD (Editor Support)
// ============================================================================

export interface ImagePreviewCardProps {
  src: string | null | undefined
  label: string
  aspect?: 'square' | 'video' | 'wide' | 'portrait'
  showCheckmark?: boolean
  onClick?: () => void
}

// ============================================================================
// CATALOG IMAGE PREVIEWS (Editor Support)
// ============================================================================

export interface CatalogImagePreviewsProps {
  // Hero Banner
  heroBannerUrl?: string | null
  heroBannerHeadline?: string
  heroBannerSubheadline?: string
  heroBannerTheme?: 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'

  // Promo Banner
  promoBannerUrl?: string | null
  promoBannerTitle?: string
  promoBannerDiscount?: number
  promoBannerVariant?: 'chedraui' | 'walmart' | 'default'

  // Brand Image
  brandImageUrl?: string | null
  brandName?: string

  // Category Image
  categoryImageUrl?: string | null
  categoryName?: string

  // Callbacks
  onHeroBannerClick?: () => void
  onPromoBannerClick?: () => void
  onBrandImageClick?: () => void
  onCategoryImageClick?: () => void
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SeasonalTheme = 'christmas' | 'summer' | 'dia-muertos' | 'posadas' | 'new-year' | 'default'
export type ProductBadge = 'NEW' | 'SALE' | 'HOT' | 'LIMITED'
export type ProductTier = 'A' | 'B' | 'C'
export type GlossLevel = 'none' | 'soft' | 'premium'
export type PromoVariant = 'chedraui' | 'walmart' | 'default'
export type GradientTheme = 'red' | 'blue' | 'purple' | 'gold'
