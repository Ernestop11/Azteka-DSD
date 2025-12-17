import React from 'react'

/**
 * Azteka DSD Catalog - Tablet Optimization Utilities
 * Optimized for Samsung Galaxy Tab S9 FE (1024x768 - 2560x1920)
 *
 * Target Device Specs:
 * - Display: 10.9" (2304 x 1440 pixels, 249 PPI)
 * - Aspect Ratio: 16:10
 * - Touch Target: Minimum 44x44px (recommended 48x48px)
 * - Landscape-first orientation
 * - Stylus support (S Pen)
 */

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Detects if user is on a tablet device
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = navigator.userAgent.toLowerCase()
  const isTabletUA = /tablet|ipad|playbook|silk/i.test(userAgent)

  // Check screen size (tablets typically 768px - 1366px width)
  const width = window.innerWidth
  const isTabletSize = width >= 768 && width <= 1366

  return isTabletUA || isTabletSize
}

/**
 * Detects Samsung Galaxy Tab specifically
 */
export function isSamsungTab(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = navigator.userAgent.toLowerCase()
  return /samsung.*tablet|sm-x[0-9]/i.test(userAgent)
}

/**
 * Detects tablet orientation
 */
export function getTabletOrientation(): 'landscape' | 'portrait' | null {
  if (typeof window === 'undefined') return null
  if (!isTablet()) return null

  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
}

// ============================================================================
// HIT TARGET HELPERS
// ============================================================================

/**
 * Minimum touch target sizes for tablets
 */
export const HIT_TARGET_SIZES = {
  minimum: 44, // Absolute minimum (WCAG 2.5.5)
  recommended: 48, // Recommended size
  comfortable: 56, // Comfortable for thumb reach
  large: 64, // Large buttons/CTAs
} as const

/**
 * Returns appropriate touch target class based on element type
 */
export function getHitTargetClass(
  elementType: 'button' | 'icon' | 'card' | 'link' | 'checkbox'
): string {
  const classes = {
    button: 'min-h-[48px] min-w-[48px] px-6 py-3',
    icon: 'min-h-[56px] min-w-[56px] p-3',
    card: 'min-h-[120px] p-6',
    link: 'min-h-[44px] py-2 px-4',
    checkbox: 'min-h-[48px] min-w-[48px]',
  }

  return classes[elementType] || classes.button
}

/**
 * Custom hit target utilities for Tailwind
 */
export const hitTargetClasses = {
  'hit-min': `min-h-[${HIT_TARGET_SIZES.minimum}px] min-w-[${HIT_TARGET_SIZES.minimum}px]`,
  'hit-rec': `min-h-[${HIT_TARGET_SIZES.recommended}px] min-w-[${HIT_TARGET_SIZES.recommended}px]`,
  'hit-com': `min-h-[${HIT_TARGET_SIZES.comfortable}px] min-w-[${HIT_TARGET_SIZES.comfortable}px]`,
  'hit-large': `min-h-[${HIT_TARGET_SIZES.large}px] min-w-[${HIT_TARGET_SIZES.large}px]`,
}

/**
 * Ensures element meets minimum touch target size
 */
export function ensureHitTarget(
  element: HTMLElement,
  minSize: number = HIT_TARGET_SIZES.recommended
): void {
  if (typeof window === 'undefined') return
  if (!isTablet()) return

  const rect = element.getBoundingClientRect()

  if (rect.width < minSize) {
    element.style.minWidth = `${minSize}px`
  }

  if (rect.height < minSize) {
    element.style.minHeight = `${minSize}px`
  }
}

// ============================================================================
// LANDSCAPE SCALING
// ============================================================================

/**
 * Optimal grid columns for tablet landscape mode
 */
export const TABLET_GRID_COLUMNS = {
  compact: 5, // Dense product grids
  standard: 4, // Default layout
  comfortable: 3, // Spacious layout
  showcase: 2, // Featured products
} as const

/**
 * Returns optimal column count based on viewport width
 */
export function getTabletColumns(
  mode: 'compact' | 'standard' | 'comfortable' | 'showcase' = 'standard'
): number {
  if (typeof window === 'undefined') return TABLET_GRID_COLUMNS.standard
  if (!isTablet()) return TABLET_GRID_COLUMNS.standard

  const orientation = getTabletOrientation()

  if (orientation === 'landscape') {
    return TABLET_GRID_COLUMNS[mode]
  }

  // Portrait mode: reduce columns
  return Math.max(2, TABLET_GRID_COLUMNS[mode] - 1)
}

/**
 * Responsive grid classes for tablets
 */
export function getTabletGridClass(
  mode: 'compact' | 'standard' | 'comfortable' | 'showcase' = 'standard'
): string {
  const columns = getTabletColumns(mode)

  return `grid-cols-2 md:grid-cols-${columns} gap-4 md:gap-6`
}

/**
 * Landscape-optimized container padding
 */
export function getTabletContainerPadding(orientation?: 'landscape' | 'portrait' | null): string {
  const currentOrientation = orientation || getTabletOrientation()

  if (currentOrientation === 'landscape') {
    return 'px-8 py-6' // More horizontal padding in landscape
  }

  return 'px-6 py-8' // More vertical padding in portrait
}

/**
 * Optimal font scaling for tablets
 */
export const TABLET_FONT_SCALE = {
  xs: 'text-sm', // 14px
  sm: 'text-base', // 16px
  base: 'text-lg', // 18px
  lg: 'text-xl', // 20px
  xl: 'text-2xl', // 24px
  '2xl': 'text-3xl', // 30px
  '3xl': 'text-4xl', // 36px
} as const

/**
 * Returns scaled font size for tablets
 */
export function getTabletFontClass(size: keyof typeof TABLET_FONT_SCALE): string {
  if (!isTablet()) return `text-${size}`

  return TABLET_FONT_SCALE[size]
}

// ============================================================================
// SCROLL SMOOTHING
// ============================================================================

/**
 * Smooth scroll configuration for tablets
 */
export const TABLET_SCROLL_CONFIG = {
  behavior: 'smooth' as ScrollBehavior,
  block: 'start' as ScrollLogicalPosition,
  inline: 'nearest' as ScrollLogicalPosition,
}

/**
 * Enables smooth scrolling for tablet
 */
export function enableSmoothScroll(): void {
  if (typeof window === 'undefined') return
  if (!isTablet()) return

  document.documentElement.style.scrollBehavior = 'smooth'
}

/**
 * Scroll container with momentum (iOS-style)
 */
export function getMomentumScrollClass(): string {
  return 'overflow-y-auto overscroll-y-contain scroll-smooth [-webkit-overflow-scrolling:touch]'
}

/**
 * Snap scroll for horizontal carousels
 */
export function getSnapScrollClass(
  type: 'mandatory' | 'proximity' = 'proximity'
): string {
  return `overflow-x-auto snap-x snap-${type} scrollbar-hide [-webkit-overflow-scrolling:touch]`
}

/**
 * Snap scroll item class
 */
export function getSnapItemClass(
  align: 'start' | 'center' | 'end' = 'start'
): string {
  return `snap-${align} scroll-ml-6`
}

/**
 * Smooth scroll to element (tablet-optimized)
 */
export function smoothScrollToElement(
  elementId: string,
  offset: number = 80
): void {
  if (typeof window === 'undefined') return

  const element = document.getElementById(elementId)
  if (!element) return

  const elementTop = element.getBoundingClientRect().top + window.scrollY
  const scrollTo = elementTop - offset

  window.scrollTo({
    top: scrollTo,
    behavior: 'smooth',
  })
}

// ============================================================================
// LARGE CARD SPACING
// ============================================================================

/**
 * Optimal spacing for large cards on tablets
 */
export const TABLET_CARD_SPACING = {
  tight: 'gap-3', // 12px
  normal: 'gap-4', // 16px
  comfortable: 'gap-6', // 24px
  spacious: 'gap-8', // 32px
} as const

/**
 * Returns spacing class based on card density preference
 */
export function getCardSpacing(
  density: 'tight' | 'normal' | 'comfortable' | 'spacious' = 'normal'
): string {
  if (!isTablet()) return TABLET_CARD_SPACING.normal

  const orientation = getTabletOrientation()

  // Landscape: use selected density
  if (orientation === 'landscape') {
    return TABLET_CARD_SPACING[density]
  }

  // Portrait: slightly tighter spacing
  const portraitMapping = {
    tight: 'tight',
    normal: 'tight',
    comfortable: 'normal',
    spacious: 'comfortable',
  } as const

  return TABLET_CARD_SPACING[portraitMapping[density]]
}

/**
 * Large card padding (for tablet-sized cards)
 */
export function getLargeCardPadding(): string {
  if (!isTablet()) return 'p-4'

  return 'p-6 md:p-8'
}

/**
 * Product card size configuration for tablets
 */
export function getProductCardClasses(): string {
  if (!isTablet()) return 'min-h-[280px]'

  const orientation = getTabletOrientation()

  if (orientation === 'landscape') {
    return 'min-h-[320px] md:min-h-[360px]' // Taller cards in landscape
  }

  return 'min-h-[300px]' // Medium height in portrait
}

/**
 * Hero banner height for tablets
 */
export function getHeroBannerHeight(): string {
  if (!isTablet()) return 'h-[400px]'

  const orientation = getTabletOrientation()

  if (orientation === 'landscape') {
    return 'h-[500px] md:h-[600px]' // Wider banner in landscape
  }

  return 'h-[450px]' // Medium height in portrait
}

// ============================================================================
// STYLUS SUPPORT (S Pen)
// ============================================================================

/**
 * Detects if device has stylus support
 */
export function hasStylusSupport(): boolean {
  if (typeof window === 'undefined') return false

  // Check for pointer fine (stylus/mouse)
  const hasFinePrecision = window.matchMedia('(pointer: fine)').matches

  // Samsung S Pen specific
  const hasSPen = isSamsungTab()

  return hasFinePrecision || hasSPen
}

/**
 * Classes for stylus-friendly interactions
 */
export const STYLUS_CLASSES = {
  // Precise touch targets (for stylus)
  preciseTarget: 'min-h-[40px] min-w-[40px]',

  // Hover states (stylus can hover)
  hoverEnabled: 'hover:bg-gray-100 hover:scale-105',

  // Stylus-optimized borders (easier to see with precision)
  preciseBorder: 'border-2 hover:border-3',
}

/**
 * Returns classes optimized for stylus or touch
 */
export function getInputClasses(): string {
  const hasStylus = hasStylusSupport()

  if (hasStylus) {
    return `${STYLUS_CLASSES.preciseTarget} ${STYLUS_CLASSES.hoverEnabled} ${STYLUS_CLASSES.preciseBorder}`
  }

  return getHitTargetClass('button') // Larger targets for finger touch
}

// ============================================================================
// ORIENTATION CHANGE HANDLING
// ============================================================================

/**
 * Listens for orientation changes and executes callback
 */
export function onOrientationChange(
  callback: (orientation: 'landscape' | 'portrait') => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const handleOrientationChange = () => {
    const orientation = getTabletOrientation()
    if (orientation) {
      callback(orientation)
    }
  }

  window.addEventListener('resize', handleOrientationChange)
  window.addEventListener('orientationchange', handleOrientationChange)

  // Initial call
  handleOrientationChange()

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleOrientationChange)
    window.removeEventListener('orientationchange', handleOrientationChange)
  }
}

/**
 * React hook for orientation changes
 */
export function useTabletOrientation() {
  if (typeof window === 'undefined') {
    return { orientation: null, isLandscape: false, isPortrait: false }
  }

  const [orientation, setOrientation] = React.useState<'landscape' | 'portrait' | null>(
    getTabletOrientation()
  )

  React.useEffect(() => {
    return onOrientationChange(setOrientation)
  }, [])

  return {
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
  }
}

// Note: Add React import at the top if using the hook
// import * as React from 'react'

// ============================================================================
// TABLET-OPTIMIZED COMPONENT PROPS
// ============================================================================

/**
 * Tablet-optimized props for ProductGrid
 */
export function getTabletProductGridProps() {
  return {
    columns: getTabletColumns('standard'),
    gap: getCardSpacing('comfortable'),
    cardHeight: getProductCardClasses(),
  }
}

/**
 * Tablet-optimized props for HeroBanner
 */
export function getTabletHeroBannerProps() {
  return {
    height: getHeroBannerHeight(),
    padding: getTabletContainerPadding(),
  }
}

/**
 * Tablet-optimized props for catalog sections
 */
export function getTabletSectionProps() {
  const orientation = getTabletOrientation()

  return {
    container: getTabletContainerPadding(orientation),
    grid: getTabletGridClass('standard'),
    spacing: getCardSpacing('comfortable'),
    scroll: getMomentumScrollClass(),
  }
}

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * Determines if tablet should use reduced animations
 */
export function shouldReduceTabletAnimations(): boolean {
  if (typeof window === 'undefined') return false
  if (!isTablet()) return false

  // Check performance hint
  const connection = (navigator as any).connection
  if (connection && connection.saveData) return true

  // Check battery
  const battery = (navigator as any).getBattery
  if (battery && battery.level < 0.2) return true

  return false
}

/**
 * Returns animation config based on tablet performance
 */
export function getTabletAnimationConfig() {
  if (shouldReduceTabletAnimations()) {
    return {
      duration: 0.2,
      staggerDelay: 0.05,
      enableParallax: false,
      enableGlow: false,
    }
  }

  return {
    duration: 0.4,
    staggerDelay: 0.08,
    enableParallax: true,
    enableGlow: true,
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * All tablet utilities in one object
 */
export const tabletUtils = {
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
}

export default tabletUtils
