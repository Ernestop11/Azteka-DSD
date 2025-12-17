/**
 * Azteka DSD Catalog - Mobile UX Utilities
 * Optimized for mobile salespeople (Carlos Mode) - thumb-friendly, fast-scroll
 *
 * LAP #4: Polish - Mobile-first optimizations for field sales
 */

// ============================================================================
// DEVICE DETECTION
// ============================================================================

/**
 * Detects if user is on mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false

  const userAgent = navigator.userAgent.toLowerCase()
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

  // Check screen size (mobile typically < 768px width)
  const width = window.innerWidth
  const isMobileSize = width < 768

  return isMobileUA || isMobileSize
}

/**
 * Get mobile viewport dimensions
 */
export function getMobileViewport() {
  if (typeof window === 'undefined') return { width: 0, height: 0 }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

// ============================================================================
// THUMB-FRIENDLY TOUCH TARGETS
// ============================================================================

/**
 * Minimum touch target sizes for mobile (WCAG 2.5.5 + best practices)
 */
export const MOBILE_TOUCH_TARGETS = {
  minimum: 44,      // WCAG minimum
  recommended: 48,  // iOS/Android recommendation
  comfortable: 56,  // Thumb-friendly zone
  large: 64,        // Easy tap area
} as const

/**
 * Touch target classes for common mobile elements
 */
export const MOBILE_TOUCH_CLASSES = {
  button: 'min-h-[48px] min-w-[48px] px-4 py-3',
  iconButton: 'min-h-[56px] min-w-[56px] p-4',
  listItem: 'min-h-[56px] py-3 px-4',
  tab: 'min-h-[48px] px-6',
  input: 'min-h-[48px] px-4 py-3',
  checkbox: 'min-h-[44px] min-w-[44px]',
} as const

/**
 * Get mobile-friendly touch target class
 */
export function getMobileTouchClass(
  elementType: keyof typeof MOBILE_TOUCH_CLASSES
): string {
  return MOBILE_TOUCH_CLASSES[elementType]
}

/**
 * Thumb zone helper - optimal area for one-handed use
 */
export const THUMB_ZONE = {
  easy: 'bottom 50% of screen',      // Easiest to reach
  comfortable: 'middle 30% of screen', // Comfortable reach
  hard: 'top 20% of screen',         // Requires hand repositioning
} as const

/**
 * Get thumb-zone-aware positioning classes
 */
export function getThumbZoneClass(
  position: 'bottom' | 'middle' | 'top' = 'bottom'
): string {
  const positionMap = {
    bottom: 'fixed bottom-0 left-0 right-0',  // Easy reach
    middle: 'sticky top-1/2',                  // Comfortable
    top: 'sticky top-0',                       // Hard reach
  }

  return positionMap[position]
}

// ============================================================================
// STICKY ADD-TO-CART (MOBILE)
// ============================================================================

/**
 * Sticky add-to-cart bar configuration
 */
export const STICKY_CART_CONFIG = {
  height: 64,           // Fixed height in pixels
  zIndex: 40,           // Above content, below modals
  threshold: 200,       // Show after scrolling 200px
  hideOnScroll: false,  // Keep visible while scrolling
}

/**
 * Sticky cart bar classes
 */
export function getStickyCartClasses(): string {
  return `
    fixed bottom-0 left-0 right-0
    h-16
    z-40
    bg-white
    border-t-2 border-gray-200
    shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
    transition-transform duration-300
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Sticky cart container with safe area
 */
export function getStickyCartContainer(): string {
  return `
    ${getStickyCartClasses()}
    pb-safe
    px-4
    flex items-center justify-between
  `.trim().replace(/\s+/g, ' ')
}

// ============================================================================
// FAST-SCROLL CONTAINER
// ============================================================================

/**
 * Fast-scroll configuration for quick browsing
 */
export const FAST_SCROLL_CONFIG = {
  momentum: true,              // Enable momentum scrolling
  snapPoints: false,           // No snap points (interferes with speed)
  overscroll: 'auto',          // Allow overscroll
  smoothing: 'touch',          // Touch-optimized smoothing
}

/**
 * Fast-scroll container classes
 */
export function getFastScrollClasses(): string {
  return `
    overflow-y-auto
    overscroll-y-auto
    scroll-smooth
    [-webkit-overflow-scrolling:touch]
    will-change-scroll
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Fast-scroll with momentum
 */
export function getMomentumScrollClasses(): string {
  return `
    ${getFastScrollClasses()}
    [scrollbar-width:thin]
    scrollbar-thin
    scrollbar-thumb-gray-300
    scrollbar-track-transparent
  `.trim().replace(/\s+/g, ' ')
}

// ============================================================================
// REDUCED ANIMATION MODE (SPEED MODE)
// ============================================================================

/**
 * Detect if device needs speed mode
 */
export function shouldUseSpeedMode(): boolean {
  if (typeof window === 'undefined') return false

  // Check for low-end device indicators
  const connection = (navigator as any).connection
  const lowEndConnection = connection && (
    connection.saveData ||
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g'
  )

  // Check device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory
  const lowMemory = deviceMemory && deviceMemory < 4

  // Check user preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return lowEndConnection || lowMemory || prefersReducedMotion
}

/**
 * Speed mode animation configuration
 */
export const SPEED_MODE_ANIMATIONS = {
  transitionDuration: 100,     // Fast transitions (100ms)
  staggerDelay: 20,            // Minimal stagger
  enableParallax: false,       // Disable parallax
  enableGlow: false,           // Disable glow effects
  enableShine: false,          // Disable shine effects
  enableHover: true,           // Keep basic hover (instant)
}

/**
 * Get animation config based on speed mode
 */
export function getMobileAnimationConfig() {
  if (shouldUseSpeedMode()) {
    return SPEED_MODE_ANIMATIONS
  }

  return {
    transitionDuration: 200,
    staggerDelay: 50,
    enableParallax: false,     // Always off on mobile
    enableGlow: true,
    enableShine: true,
    enableHover: true,
  }
}

// ============================================================================
// OVERSCROLL ELASTICITY
// ============================================================================

/**
 * Overscroll behavior configuration
 */
export const OVERSCROLL_CONFIG = {
  behavior: 'auto' as const,   // Allow natural overscroll
  bounceEffect: true,          // Enable bounce on iOS
  pullToRefresh: false,        // Disable pull-to-refresh (conflicts with scroll)
}

/**
 * Overscroll classes
 */
export function getOverscrollClasses(): string {
  return 'overscroll-y-auto overscroll-x-none'
}

/**
 * Prevent overscroll on specific elements
 */
export function getNoOverscrollClasses(): string {
  return 'overscroll-none'
}

// ============================================================================
// SMOOTH SNAPPING FOR PROMO ROWS
// ============================================================================

/**
 * Snap scroll configuration for horizontal promo carousels
 */
export const SNAP_SCROLL_CONFIG = {
  type: 'proximity' as const,  // Proximity snapping (more natural)
  align: 'center' as const,    // Snap to center
  padding: 16,                 // Side padding
}

/**
 * Horizontal snap scroll classes
 */
export function getSnapScrollClasses(): string {
  return `
    overflow-x-auto
    snap-x
    snap-proximity
    scroll-pl-4
    scroll-pr-4
    [-webkit-overflow-scrolling:touch]
    scrollbar-hide
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Snap scroll item classes
 */
export function getSnapItemClasses(
  align: 'start' | 'center' | 'end' = 'center'
): string {
  return `snap-${align} scroll-ml-4`
}

// ============================================================================
// 1-2 COLUMN LAYOUT OPTIMIZATION
// ============================================================================

/**
 * Mobile-optimized grid columns
 */
export const MOBILE_GRID_COLUMNS = {
  single: 1,       // Full width cards
  double: 2,       // Standard mobile grid
} as const

/**
 * Get mobile grid class
 */
export function getMobileGridClass(
  columns: 1 | 2 = 2,
  gap: 'tight' | 'normal' | 'comfortable' = 'normal'
): string {
  const gapClasses = {
    tight: 'gap-2',
    normal: 'gap-3',
    comfortable: 'gap-4',
  }

  return `grid grid-cols-${columns} ${gapClasses[gap]}`
}

/**
 * Mobile product card size presets
 */
export const MOBILE_CARD_SIZES = {
  compact: 'min-h-[240px]',    // Compact cards (2-column)
  normal: 'min-h-[280px]',     // Standard cards
  large: 'min-h-[320px]',      // Large cards (1-column)
  full: 'min-h-[360px]',       // Full-width showcase
} as const

// ============================================================================
// COMPACT HERO BANNER VARIANT
// ============================================================================

/**
 * Compact hero configuration for mobile
 */
export const COMPACT_HERO_CONFIG = {
  height: 280,                 // Reduced height (vs 400px desktop)
  contentPadding: 16,          // Tighter padding
  titleSize: 'text-3xl',       // Smaller title (vs 4xl)
  subtitleSize: 'text-base',   // Smaller subtitle
  ctaSize: 'text-sm',          // Smaller CTA
}

/**
 * Get compact hero classes
 */
export function getCompactHeroClasses(): string {
  return `
    h-[280px]
    p-4
    flex flex-col justify-end
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Compact hero title classes
 */
export function getCompactHeroTitleClasses(): string {
  return `
    text-3xl
    font-extrabold
    leading-tight
    mb-2
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Compact hero subtitle classes
 */
export function getCompactHeroSubtitleClasses(): string {
  return `
    text-base
    font-medium
    leading-normal
    mb-4
  `.trim().replace(/\s+/g, ' ')
}

// ============================================================================
// SAFE AREA HANDLING (NOTCHES)
// ============================================================================

/**
 * Safe area insets for modern mobile devices
 */
export function getSafeAreaClasses(
  side: 'top' | 'bottom' | 'left' | 'right' | 'all' = 'all'
): string {
  const safeAreaMap = {
    top: 'pt-safe',
    bottom: 'pb-safe',
    left: 'pl-safe',
    right: 'pr-safe',
    all: 'p-safe',
  }

  return safeAreaMap[side] || safeAreaMap.all
}

// ============================================================================
// MOBILE UTILITY FUNCTIONS
// ============================================================================

/**
 * Enable fast tap (remove 300ms delay on older mobile browsers)
 */
export function enableFastTap(): void {
  if (typeof document === 'undefined') return

  // Add touch-action for better touch performance
  document.body.style.touchAction = 'manipulation'
}

/**
 * Prevent zoom on double-tap
 */
export function preventDoubleTapZoom(): void {
  if (typeof document === 'undefined') return

  let lastTouchEnd = 0
  document.addEventListener('touchend', (event) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, { passive: false })
}

/**
 * Scroll to top smoothly
 */
export function scrollToTop(smooth: boolean = true): void {
  if (typeof window === 'undefined') return

  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

/**
 * Hide address bar on scroll (mobile Safari)
 */
export function hideAddressBar(): void {
  if (typeof window === 'undefined') return

  setTimeout(() => {
    window.scrollTo(0, 1)
  }, 0)
}

/**
 * Detect if keyboard is visible (iOS)
 */
export function isKeyboardVisible(): boolean {
  if (typeof window === 'undefined') return false

  // On iOS, when keyboard is visible, window.innerHeight changes
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  if (!isIOS) return false

  const viewportHeight = window.visualViewport?.height || window.innerHeight
  const windowHeight = window.innerHeight

  return viewportHeight < windowHeight * 0.75
}

// ============================================================================
// MOBILE UX SYSTEM EXPORT
// ============================================================================

/**
 * Complete mobile UX system
 */
export const mobileUX = {
  // Detection
  isMobile,
  getMobileViewport,

  // Touch targets
  touchTargets: MOBILE_TOUCH_TARGETS,
  touchClasses: MOBILE_TOUCH_CLASSES,
  getMobileTouchClass,
  thumbZone: THUMB_ZONE,
  getThumbZoneClass,

  // Sticky cart
  stickyCart: STICKY_CART_CONFIG,
  getStickyCartClasses,
  getStickyCartContainer,

  // Fast scroll
  fastScroll: FAST_SCROLL_CONFIG,
  getFastScrollClasses,
  getMomentumScrollClasses,

  // Speed mode
  shouldUseSpeedMode,
  speedModeAnimations: SPEED_MODE_ANIMATIONS,
  getMobileAnimationConfig,

  // Overscroll
  overscroll: OVERSCROLL_CONFIG,
  getOverscrollClasses,
  getNoOverscrollClasses,

  // Snap scroll
  snapScroll: SNAP_SCROLL_CONFIG,
  getSnapScrollClasses,
  getSnapItemClasses,

  // Layout
  gridColumns: MOBILE_GRID_COLUMNS,
  getMobileGridClass,
  cardSizes: MOBILE_CARD_SIZES,

  // Compact hero
  compactHero: COMPACT_HERO_CONFIG,
  getCompactHeroClasses,
  getCompactHeroTitleClasses,
  getCompactHeroSubtitleClasses,

  // Safe area
  getSafeAreaClasses,

  // Utilities
  enableFastTap,
  preventDoubleTapZoom,
  scrollToTop,
  hideAddressBar,
  isKeyboardVisible,
}

export default mobileUX
