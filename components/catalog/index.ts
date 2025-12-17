/**
 * Azteka DSD Catalog Components - Centralized Exports
 * Import all catalog components from this single file
 */

// ============================================================================
// CORE VISUAL COMPONENTS
// ============================================================================

export { default as HeroBanner } from './HeroBanner'
export { default as PromoPanel } from './PromoPanel'
export { default as ShowcaseSectionVisual } from './ShowcaseSectionVisual'
export { default as TrendingRowVisual } from './TrendingRowVisual'
export { default as BrandsRowVisual } from './BrandsRowVisual'
export { default as CategoriesRowVisual } from './CategoriesRowVisual'
export { default as GlossyProductCard } from './GlossyProductCard'
export { default as ProductGrid } from './ProductGrid'
export { default as PriceTierBar } from './PriceTierBar'

// ============================================================================
// API-CONNECTED COMPONENTS (Wrappers)
// ============================================================================

export { default as ShowcaseSection } from './ShowcaseSection'
export { default as TrendingRow } from './TrendingRow'
export { default as BrandsRow } from './BrandsRow'
export { default as CategoriesRow } from './CategoriesRow'

// ============================================================================
// SUPPORTING COMPONENTS
// ============================================================================

export { default as MarqueeScroll } from './MarqueeScroll'
export { default as BrandSection } from './BrandSection'
export { default as SeasonalSection } from './SeasonalSection'
export { default as BundleCard } from './BundleCard'
export { default as Billboard } from './Billboard'

// ============================================================================
// EDITOR SUPPORT COMPONENTS
// ============================================================================

export { default as ImagePreviewCard } from './ImagePreviewCard'
export { default as CatalogImagePreviews } from './CatalogImagePreviews'

// ============================================================================
// LAYOUT VARIANTS (LAP #3)
// ============================================================================

export { default as MasonryGrid } from './layout-variants/MasonryGrid'
export { default as WideSpotlight } from './layout-variants/WideSpotlight'
export { default as MidPromoRow } from './layout-variants/MidPromoRow'
export { default as DualHeroRow } from './layout-variants/DualHeroRow'
export { default as ShoppableStory } from './layout-variants/ShoppableStory'

// ============================================================================
// ANIMATION LIBRARY (LAP #3)
// ============================================================================

export {
  // Individual animations
  shineSweep,
  shineSweepVariants,
  promoBounce,
  promoBounceVariants,
  glowPulse,
  glowPulseColor,
  iconFloat,
  iconFloatDelayed,
  iconFloatVariants,
  snowfallParallax,
  snowfallVariants,
  festiveBurst,
  festiveBurstContinuous,
  festiveBurstVariants,
  spotlightReveal,
  spotlightRevealFrom,
  spotlightHoverTracking,
  // Composite animations
  premiumProductCard,
  heroBannerEntrance,
  staggerContainer,
  staggerItem,
  // Utilities
  combineAnimations,
  withDelay,
  respectMotionPreference,
} from './animation'

// ============================================================================
// TABLET UTILITIES (LAP #3)
// ============================================================================

export {
  // Detection
  isTablet,
  isSamsungTab,
  getTabletOrientation,
  // Hit targets
  getHitTargetClass,
  ensureHitTarget,
  HIT_TARGET_SIZES,
  // Layout
  getTabletColumns,
  getTabletGridClass,
  getTabletContainerPadding,
  getTabletFontClass,
  // Scroll
  enableSmoothScroll,
  getMomentumScrollClass,
  getSnapScrollClass,
  getSnapItemClass,
  smoothScrollToElement,
  // Spacing
  getCardSpacing,
  getLargeCardPadding,
  getProductCardClasses,
  getHeroBannerHeight,
  // Stylus
  hasStylusSupport,
  getInputClasses,
  STYLUS_CLASSES,
  // Orientation
  onOrientationChange,
  // Component props
  getTabletProductGridProps,
  getTabletHeroBannerProps,
  getTabletSectionProps,
  // Performance
  shouldReduceTabletAnimations,
  getTabletAnimationConfig,
  // Utils object
  tabletUtils,
} from './tablet'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Hero Banner
  HeroBannerProps,

  // Promo Panel
  PromoPanelProps,

  // Showcase
  ShowcaseProduct,
  ShowcaseSectionVisualProps,

  // Trending
  TrendingProduct,
  TrendingRowVisualProps,

  // Brands
  BrandVisual,
  BrandsRowVisualProps,

  // Categories
  CategoryVisual,
  CategoriesRowVisualProps,

  // Product Grid
  ProductGridProps,

  // Glossy Product Card
  GlossyProductCardProduct,
  GlossyProductCardProps,

  // Price Tier Bar
  PriceTierBarProps,

  // Editor Support
  ImagePreviewCardProps,
  CatalogImagePreviewsProps,

  // Utility Types
  SeasonalTheme,
  ProductBadge,
  ProductTier,
  GlossLevel,
  PromoVariant,
  GradientTheme,
} from './types'

// ============================================================================
// ACCESSIBILITY UTILITIES
// ============================================================================

export { default as a11y } from './a11y'
export {
  getProductCardAriaLabel,
  getBrandCardAriaLabel,
  getCategoryCardAriaLabel,
  getHeroBannerAriaLabel,
  getPromoPanelAriaLabel,
  getFocusClasses,
  getButtonFocusClasses,
  handleCardKeyDown,
  handleGridNavigation,
  announceToScreenReader,
  announceAddToCart,
  announceTierChange,
  announceFilterChange,
  shouldReduceMotion,
  getMotionProps,
} from './a11y'

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
// See individual component files for usage examples
