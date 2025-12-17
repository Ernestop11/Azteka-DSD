/**
 * Azteka DSD Catalog - Tablet UX Enhancements
 * Sales Rep Mode optimizations for Samsung Galaxy Tab S9 FE
 *
 * LAP #4: Polish - High-density mode, focus mode, landscape optimizations
 */

import { getTabletOrientation, isTablet } from '../tablet'

// ============================================================================
// HIGH-DENSITY MODE (FOR FAST-SCROLLING SALES REPS)
// ============================================================================

/**
 * High-density grid configuration
 */
export const HIGH_DENSITY_CONFIG = {
  columns: {
    landscape: 5,    // 5 columns in landscape
    portrait: 3,     // 3 columns in portrait
  },
  gap: 12,           // Tighter gap (12px vs 24px normal)
  cardHeight: 280,   // Fixed height for clean rows
  cardPadding: 12,   // Compact padding
  fontSize: 14,      // Smaller text
}

/**
 * Get high-density grid classes
 */
export function getHighDensityGridClass(): string {
  const orientation = getTabletOrientation()

  if (orientation === 'landscape') {
    return 'grid grid-cols-5 gap-3'
  }

  return 'grid grid-cols-3 gap-3'
}

/**
 * Get high-density card classes
 */
export function getHighDensityCardClass(): string {
  return `
    h-[280px]
    p-3
    text-sm
    flex flex-col
  `.trim().replace(/\s+/g, ' ')
}

/**
 * High-density product card layout
 */
export const HIGH_DENSITY_CARD_LAYOUT = {
  imageHeight: 'h-32',           // Smaller image (128px)
  titleLines: 2,                 // Clamp to 2 lines
  showDescription: false,        // Hide description
  showRewards: false,            // Hide rewards
  showRating: false,             // Hide rating
  emphasizePrice: true,          // Focus on price
  compactBadges: true,           // Smaller badges
}

// ============================================================================
// FOCUS MODE (DIMS UNSELECTED ROWS)
// ============================================================================

/**
 * Focus mode configuration
 */
export const FOCUS_MODE_CONFIG = {
  enabled: false,                // Toggle focus mode
  dimOpacity: 0.4,               // Dim unselected rows to 40%
  transitionSpeed: 200,          // Fade speed (ms)
  highlightScale: 1.02,          // Slight scale on focused row
  scrollBehavior: 'smooth',      // Smooth scroll to focused
}

/**
 * Focus mode classes
 */
export function getFocusModeClasses(isFocused: boolean): string {
  if (!FOCUS_MODE_CONFIG.enabled) return ''

  if (isFocused) {
    return `
      opacity-100
      scale-[1.02]
      z-10
      transition-all duration-200
    `.trim().replace(/\s+/g, ' ')
  }

  return `
    opacity-40
    scale-100
    transition-all duration-200
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Enable focus mode
 */
export function enableFocusMode(): void {
  FOCUS_MODE_CONFIG.enabled = true
}

/**
 * Disable focus mode
 */
export function disableFocusMode(): void {
  FOCUS_MODE_CONFIG.enabled = false
}

/**
 * Toggle focus mode
 */
export function toggleFocusMode(): boolean {
  FOCUS_MODE_CONFIG.enabled = !FOCUS_MODE_CONFIG.enabled
  return FOCUS_MODE_CONFIG.enabled
}

// ============================================================================
// FIXED-HEIGHT PRODUCT CARDS (CLEAN ROWS)
// ============================================================================

/**
 * Fixed-height card configurations
 */
export const FIXED_CARD_HEIGHTS = {
  compact: 240,      // 240px - High density
  normal: 320,       // 320px - Standard
  comfortable: 360,  // 360px - Spacious
  showcase: 400,     // 400px - Featured
} as const

/**
 * Get fixed-height card class
 */
export function getFixedHeightCard(
  size: keyof typeof FIXED_CARD_HEIGHTS = 'normal'
): string {
  const height = FIXED_CARD_HEIGHTS[size]
  return `h-[${height}px] flex flex-col`
}

/**
 * Fixed-height card with image aspect ratio lock
 */
export function getFixedCardWithImage(
  size: keyof typeof FIXED_CARD_HEIGHTS = 'normal'
): {
  cardClass: string
  imageClass: string
  contentClass: string
} {
  const heights = {
    compact: { card: 240, image: 120 },
    normal: { card: 320, image: 160 },
    comfortable: { card: 360, image: 180 },
    showcase: { card: 400, image: 220 },
  }

  const config = heights[size]

  return {
    cardClass: `h-[${config.card}px] flex flex-col overflow-hidden`,
    imageClass: `h-[${config.image}px] flex-shrink-0 object-cover`,
    contentClass: 'flex-1 flex flex-col justify-between p-4',
  }
}

// ============================================================================
// OPTIMIZED RIBBON EDGES (LANDSCAPE MODE)
// ============================================================================

/**
 * Ribbon edge configuration for landscape
 */
export const RIBBON_EDGE_CONFIG = {
  height: 48,                    // Ribbon height
  angle: 3,                      // Slight angle (degrees)
  offsetX: -8,                   // Left offset
  gradient: 'bg-gradient-to-r from-red-600 to-red-500',
}

/**
 * Get ribbon edge classes for landscape
 */
export function getRibbonEdgeClasses(): string {
  const orientation = getTabletOrientation()

  if (orientation !== 'landscape') {
    return 'ribbon-edge-compact'
  }

  return `
    ribbon-edge-landscape
    h-12
    -rotate-3
    -ml-2
    bg-gradient-to-r from-red-600 to-red-500
    shadow-md
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Ribbon badge positioning for landscape
 */
export function getRibbonBadgeClasses(): string {
  return `
    absolute
    -top-1
    -left-2
    px-4
    py-1
    text-xs
    font-bold
    text-white
    uppercase
    tracking-wider
    transform
    -rotate-3
    shadow-lg
  `.trim().replace(/\s+/g, ' ')
}

// ============================================================================
// BETTER SPACING FOR S PEN INTERACTIONS
// ============================================================================

/**
 * S Pen optimized spacing
 */
export const SPEN_SPACING = {
  buttonGap: 16,                 // Gap between buttons (vs 12px touch)
  listItemGap: 8,                // Gap between list items
  cardGap: 20,                   // Gap between cards
  minTapTarget: 40,              // Smaller target for precision
}

/**
 * Get S Pen optimized grid gap
 */
export function getSPenGridGap(): string {
  return 'gap-5'  // 20px gap for stylus
}

/**
 * Get S Pen button classes
 */
export function getSPenButtonClasses(): string {
  return `
    min-h-[40px]
    min-w-[40px]
    px-4
    py-2
    gap-4
    hover:bg-gray-100
    hover:border-2
    transition-all
  `.trim().replace(/\s+/g, ' ')
}

/**
 * S Pen input field classes
 */
export function getSPenInputClasses(): string {
  return `
    min-h-[44px]
    px-3
    py-2
    border-2
    hover:border-3
    focus:border-3
    focus:ring-2
    transition-all
  `.trim().replace(/\s+/g, ' ')
}

// ============================================================================
// 3-5 COLUMN ADAPTIVE GRID
// ============================================================================

/**
 * Adaptive column count based on orientation and mode
 */
export function getAdaptiveColumns(
  mode: 'compact' | 'standard' | 'comfortable' = 'standard'
): number {
  const orientation = getTabletOrientation()

  const columnMap = {
    compact: {
      landscape: 5,
      portrait: 3,
    },
    standard: {
      landscape: 4,
      portrait: 3,
    },
    comfortable: {
      landscape: 3,
      portrait: 2,
    },
  }

  if (orientation === 'landscape') {
    return columnMap[mode].landscape
  }

  return columnMap[mode].portrait
}

/**
 * Get adaptive grid class
 */
export function getAdaptiveGridClass(
  mode: 'compact' | 'standard' | 'comfortable' = 'standard'
): string {
  const columns = getAdaptiveColumns(mode)
  const gapSize = mode === 'compact' ? 'gap-3' : mode === 'comfortable' ? 'gap-6' : 'gap-4'

  return `grid grid-cols-${columns} ${gapSize}`
}

// ============================================================================
// LANDSCAPE MODE UTILITIES
// ============================================================================

/**
 * Detect if in landscape mode
 */
export function isLandscape(): boolean {
  return getTabletOrientation() === 'landscape'
}

/**
 * Get landscape-specific padding
 */
export function getLandscapePadding(): string {
  if (!isLandscape()) return 'px-4 py-6'

  return 'px-8 py-6'  // More horizontal padding
}

/**
 * Get landscape-specific container max-width
 */
export function getLandscapeContainer(): string {
  if (!isLandscape()) return 'max-w-full'

  return 'max-w-7xl mx-auto'  // Centered container in landscape
}

/**
 * Landscape hero height
 */
export function getLandscapeHeroHeight(): string {
  if (!isLandscape()) return 'h-[400px]'

  return 'h-[500px]'  // Taller in landscape
}

// ============================================================================
// SALES REP MODE PRESETS
// ============================================================================

/**
 * Complete sales rep mode configuration
 */
export const SALES_REP_MODE = {
  // Layout
  gridMode: 'compact' as const,
  columns: 5,
  cardHeight: HIGH_DENSITY_CONFIG.cardHeight,
  gap: HIGH_DENSITY_CONFIG.gap,

  // Features
  focusMode: true,
  spenOptimized: true,
  fixedHeightCards: true,
  ribbonEdges: true,

  // Performance
  reduceAnimations: true,
  virtualizeGrid: true,
  lazyLoadImages: true,

  // UI preferences
  showPriceOnly: true,
  hideDescriptions: true,
  compactBadges: true,
  emphasizeTiers: true,
}

/**
 * Apply sales rep mode preset
 */
export function applySalesRepMode() {
  // Enable focus mode
  enableFocusMode()

  return {
    gridClass: getHighDensityGridClass(),
    cardClass: getHighDensityCardClass(),
    cardLayout: HIGH_DENSITY_CARD_LAYOUT,
    buttonClass: getSPenButtonClasses(),
    containerPadding: getLandscapePadding(),
  }
}

/**
 * Normal browsing mode (customer-facing)
 */
export const CUSTOMER_MODE = {
  gridMode: 'comfortable' as const,
  columns: 3,
  cardHeight: 360,
  gap: 24,
  focusMode: false,
  spenOptimized: false,
  showFullDetails: true,
  emphasizeVisuals: true,
}

/**
 * Apply customer mode preset
 */
export function applyCustomerMode() {
  // Disable focus mode
  disableFocusMode()

  return {
    gridClass: getAdaptiveGridClass('comfortable'),
    cardClass: getFixedHeightCard('comfortable'),
    containerPadding: 'px-6 py-8',
  }
}

// ============================================================================
// TABLET UX SYSTEM EXPORT
// ============================================================================

/**
 * Complete tablet UX system
 */
export const tabletUX = {
  // High-density mode
  highDensity: HIGH_DENSITY_CONFIG,
  getHighDensityGridClass,
  getHighDensityCardClass,
  highDensityCardLayout: HIGH_DENSITY_CARD_LAYOUT,

  // Focus mode
  focusMode: FOCUS_MODE_CONFIG,
  getFocusModeClasses,
  enableFocusMode,
  disableFocusMode,
  toggleFocusMode,

  // Fixed-height cards
  fixedHeights: FIXED_CARD_HEIGHTS,
  getFixedHeightCard,
  getFixedCardWithImage,

  // Ribbon edges
  ribbonEdge: RIBBON_EDGE_CONFIG,
  getRibbonEdgeClasses,
  getRibbonBadgeClasses,

  // S Pen spacing
  spenSpacing: SPEN_SPACING,
  getSPenGridGap,
  getSPenButtonClasses,
  getSPenInputClasses,

  // Adaptive grid
  getAdaptiveColumns,
  getAdaptiveGridClass,

  // Landscape utilities
  isLandscape,
  getLandscapePadding,
  getLandscapeContainer,
  getLandscapeHeroHeight,

  // Mode presets
  salesRepMode: SALES_REP_MODE,
  customerMode: CUSTOMER_MODE,
  applySalesRepMode,
  applyCustomerMode,
}

export default tabletUX
