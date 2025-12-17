/**
 * Azteka DSD Catalog - Global Spacing System
 * Unified spacing scale for all catalog components across devices
 *
 * LAP #4: Polish - Consistent spacing for mobile, tablet, and desktop
 */

// ============================================================================
// SPACING SCALE (Base Units)
// ============================================================================

/**
 * Global spacing scale in pixels
 * Based on 4px grid system
 */
export const SPACING_SCALE = {
  xs: 4,      // 4px  - Micro spacing
  sm: 8,      // 8px  - Tight spacing
  md: 12,     // 12px - Default spacing
  base: 16,   // 16px - Base unit
  lg: 24,     // 24px - Comfortable spacing
  xl: 32,     // 32px - Spacious
  '2xl': 48,  // 48px - Wide spacing
  '3xl': 64,  // 64px - Extra wide
  '4xl': 96,  // 96px - Section spacing
} as const

/**
 * Tailwind class equivalents
 */
export const SPACING_CLASSES = {
  xs: 'space-y-1',      // 4px
  sm: 'space-y-2',      // 8px
  md: 'space-y-3',      // 12px
  base: 'space-y-4',    // 16px
  lg: 'space-y-6',      // 24px
  xl: 'space-y-8',      // 32px
  '2xl': 'space-y-12',  // 48px
  '3xl': 'space-y-16',  // 64px
  '4xl': 'space-y-24',  // 96px
} as const

// ============================================================================
// DEVICE-SPECIFIC PADDING
// ============================================================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Container padding by device
 */
export const CONTAINER_PADDING = {
  mobile: {
    horizontal: SPACING_SCALE.base,   // 16px
    vertical: SPACING_SCALE.lg,       // 24px
    class: 'px-4 py-6',
  },
  tablet: {
    horizontal: SPACING_SCALE.xl,     // 32px
    vertical: SPACING_SCALE.lg,       // 24px
    class: 'px-8 py-6',
  },
  desktop: {
    horizontal: SPACING_SCALE['2xl'], // 48px
    vertical: SPACING_SCALE.xl,       // 32px
    class: 'px-12 py-8',
  },
} as const

/**
 * Get responsive padding based on device type
 */
export function getResponsivePadding(device: DeviceType = 'mobile'): string {
  return CONTAINER_PADDING[device].class
}

/**
 * Get responsive padding with Tailwind responsive classes
 */
export function getResponsivePaddingClasses(): string {
  return 'px-4 py-6 md:px-8 md:py-6 lg:px-12 lg:py-8'
}

// ============================================================================
// SECTION GAPS
// ============================================================================

/**
 * Gap between major sections (Hero, Products, Brands, etc.)
 */
export const SECTION_GAP = {
  mobile: {
    gap: SPACING_SCALE.xl,            // 32px
    class: 'space-y-8',
  },
  tablet: {
    gap: SPACING_SCALE['2xl'],        // 48px
    class: 'space-y-12',
  },
  desktop: {
    gap: SPACING_SCALE['3xl'],        // 64px
    class: 'space-y-16',
  },
} as const

/**
 * Get section gap based on device
 */
export function getSectionGap(device: DeviceType = 'mobile'): string {
  return SECTION_GAP[device].class
}

/**
 * Get responsive section gap
 */
export function getResponsiveSectionGap(): string {
  return 'space-y-8 md:space-y-12 lg:space-y-16'
}

// ============================================================================
// CARD PADDING PRESETS
// ============================================================================

export type CardDensity = 'compact' | 'normal' | 'comfortable' | 'spacious'

/**
 * Card internal padding presets
 */
export const CARD_PADDING = {
  compact: {
    padding: SPACING_SCALE.md,        // 12px
    class: 'p-3',
  },
  normal: {
    padding: SPACING_SCALE.base,      // 16px
    class: 'p-4',
  },
  comfortable: {
    padding: SPACING_SCALE.lg,        // 24px
    class: 'p-6',
  },
  spacious: {
    padding: SPACING_SCALE.xl,        // 32px
    class: 'p-8',
  },
} as const

/**
 * Get card padding class based on density
 */
export function getCardPadding(density: CardDensity = 'normal'): string {
  return CARD_PADDING[density].class
}

/**
 * Get responsive card padding
 */
export function getResponsiveCardPadding(
  mobileDensity: CardDensity = 'compact',
  tabletDensity: CardDensity = 'normal',
  desktopDensity: CardDensity = 'comfortable'
): string {
  return `${CARD_PADDING[mobileDensity].class} md:${CARD_PADDING[tabletDensity].class} lg:${CARD_PADDING[desktopDensity].class}`
}

// ============================================================================
// GRID GAP PRESETS
// ============================================================================

/**
 * Grid gap presets for product grids and layouts
 */
export const GRID_GAP = {
  tight: {
    gap: SPACING_SCALE.sm,            // 8px
    class: 'gap-2',
  },
  normal: {
    gap: SPACING_SCALE.base,          // 16px
    class: 'gap-4',
  },
  comfortable: {
    gap: SPACING_SCALE.lg,            // 24px
    class: 'gap-6',
  },
  spacious: {
    gap: SPACING_SCALE.xl,            // 32px
    class: 'gap-8',
  },
} as const

/**
 * Get grid gap class based on density
 */
export function getGridGap(density: CardDensity = 'normal'): string {
  // Map 'compact' to 'tight' for grid gaps
  const gapDensity = density === 'compact' ? 'tight' : density
  return GRID_GAP[gapDensity as keyof typeof GRID_GAP].class
}

/**
 * Get responsive grid gap
 */
export function getResponsiveGridGap(
  mobileDensity: CardDensity = 'compact',
  tabletDensity: CardDensity = 'normal',
  desktopDensity: CardDensity = 'comfortable'
): string {
  // Map 'compact' to 'tight' for grid gaps
  const mobileGap = mobileDensity === 'compact' ? 'tight' : mobileDensity
  const tabletGap = tabletDensity === 'compact' ? 'tight' : tabletDensity
  const desktopGap = desktopDensity === 'compact' ? 'tight' : desktopDensity
  return `${GRID_GAP[mobileGap as keyof typeof GRID_GAP].class} md:${GRID_GAP[tabletGap as keyof typeof GRID_GAP].class} lg:${GRID_GAP[desktopGap as keyof typeof GRID_GAP].class}`
}

// ============================================================================
// COMPONENT-SPECIFIC SPACING
// ============================================================================

/**
 * HeroBanner spacing
 */
export const HERO_SPACING = {
  titleGap: 'space-y-2 md:space-y-3',           // Gap between headline and subheadline
  ctaMargin: 'mt-6 md:mt-8',                    // CTA button top margin
  contentPadding: 'p-6 md:p-8 lg:p-12',         // Content area padding
}

/**
 * PromoPanel spacing
 */
export const PROMO_SPACING = {
  contentGap: 'space-y-3 md:space-y-4',         // Internal content gap
  badgeMargin: 'mb-2',                          // Badge bottom margin
  ctaMargin: 'mt-4 md:mt-6',                    // CTA button top margin
  padding: 'p-4 md:p-6',                        // Panel padding
}

/**
 * ProductCard spacing
 */
export const PRODUCT_CARD_SPACING = {
  imageMargin: 'mb-3 md:mb-4',                  // Image bottom margin
  titleMargin: 'mb-2',                          // Title bottom margin
  priceMargin: 'mb-3 md:mb-4',                  // Price bottom margin
  badgeGap: 'gap-2',                            // Gap between badges
  padding: 'p-3 md:p-4 lg:p-6',                 // Card padding
}

/**
 * CategoryCard / BrandCard spacing
 */
export const CATEGORY_SPACING = {
  imageMargin: 'mb-3',                          // Image bottom margin
  titleMargin: 'mb-1',                          // Title bottom margin
  padding: 'p-4 md:p-6',                        // Card padding
}

/**
 * PriceTierBar spacing
 */
export const TIER_BAR_SPACING = {
  buttonGap: 'gap-2 md:gap-3',                  // Gap between tier buttons
  padding: 'px-4 py-3 md:px-6 md:py-4',         // Bar padding
}

/**
 * ShowcaseSection spacing
 */
export const SHOWCASE_SPACING = {
  headerMargin: 'mb-6 md:mb-8',                 // Header bottom margin
  productGap: 'gap-4 md:gap-6',                 // Gap between products
  sectionPadding: 'py-8 md:py-12',              // Section vertical padding
}

/**
 * Layout variant spacing
 */
export const LAYOUT_VARIANT_SPACING = {
  masonryGap: 'gap-3 md:gap-4 lg:gap-6',        // Masonry grid gap
  spotlightGap: 'gap-4 md:gap-6',               // Spotlight layout gap
  promoRowGap: 'gap-4 md:gap-6 lg:gap-8',       // Mid-promo row gap
  dualHeroGap: 'gap-4 md:gap-6',                // Dual hero gap
  storyPanelGap: 'gap-0',                       // Story panels (no gap)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get spacing value by key
 */
export function getSpacing(key: keyof typeof SPACING_SCALE): number {
  return SPACING_SCALE[key]
}

/**
 * Get spacing class by key
 */
export function getSpacingClass(key: keyof typeof SPACING_CLASSES): string {
  return SPACING_CLASSES[key]
}

/**
 * Convert spacing value to rem
 */
export function toRem(px: number): string {
  return `${px / 16}rem`
}

/**
 * Get custom spacing class
 */
export function customSpacing(px: number, direction: 'x' | 'y' | 'all' = 'all'): string {
  const rem = toRem(px)

  if (direction === 'x') return `space-x-[${rem}]`
  if (direction === 'y') return `space-y-[${rem}]`
  return `space-[${rem}]`
}

/**
 * Get margin utility class
 */
export function getMargin(
  size: keyof typeof SPACING_SCALE,
  side: 'top' | 'right' | 'bottom' | 'left' | 'x' | 'y' | 'all' = 'all'
): string {
  const sizeMap = {
    xs: '1',
    sm: '2',
    md: '3',
    base: '4',
    lg: '6',
    xl: '8',
    '2xl': '12',
    '3xl': '16',
    '4xl': '24',
  }

  const sizeClass = sizeMap[size]

  const sideMap = {
    top: `mt-${sizeClass}`,
    right: `mr-${sizeClass}`,
    bottom: `mb-${sizeClass}`,
    left: `ml-${sizeClass}`,
    x: `mx-${sizeClass}`,
    y: `my-${sizeClass}`,
    all: `m-${sizeClass}`,
  }

  return sideMap[side]
}

/**
 * Get padding utility class
 */
export function getPadding(
  size: keyof typeof SPACING_SCALE,
  side: 'top' | 'right' | 'bottom' | 'left' | 'x' | 'y' | 'all' = 'all'
): string {
  const sizeMap = {
    xs: '1',
    sm: '2',
    md: '3',
    base: '4',
    lg: '6',
    xl: '8',
    '2xl': '12',
    '3xl': '16',
    '4xl': '24',
  }

  const sizeClass = sizeMap[size]

  const sideMap = {
    top: `pt-${sizeClass}`,
    right: `pr-${sizeClass}`,
    bottom: `pb-${sizeClass}`,
    left: `pl-${sizeClass}`,
    x: `px-${sizeClass}`,
    y: `py-${sizeClass}`,
    all: `p-${sizeClass}`,
  }

  return sideMap[side]
}

// ============================================================================
// COMPLETE SPACING PRESET COLLECTIONS
// ============================================================================

/**
 * All spacing utilities in one object
 */
export const spacingSystem = {
  // Scale
  scale: SPACING_SCALE,
  classes: SPACING_CLASSES,

  // Device padding
  containerPadding: CONTAINER_PADDING,
  getResponsivePadding,
  getResponsivePaddingClasses,

  // Section gaps
  sectionGap: SECTION_GAP,
  getSectionGap,
  getResponsiveSectionGap,

  // Card padding
  cardPadding: CARD_PADDING,
  getCardPadding,
  getResponsiveCardPadding,

  // Grid gaps
  gridGap: GRID_GAP,
  getGridGap,
  getResponsiveGridGap,

  // Component spacing
  hero: HERO_SPACING,
  promo: PROMO_SPACING,
  productCard: PRODUCT_CARD_SPACING,
  category: CATEGORY_SPACING,
  tierBar: TIER_BAR_SPACING,
  showcase: SHOWCASE_SPACING,
  layoutVariant: LAYOUT_VARIANT_SPACING,

  // Utilities
  getSpacing,
  getSpacingClass,
  toRem,
  customSpacing,
  getMargin,
  getPadding,
}

export default spacingSystem
