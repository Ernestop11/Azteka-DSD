/**
 * Azteka DSD Catalog - Global Depth System
 * Unified shadow and elevation system for all catalog components
 *
 * LAP #4: Polish - Consistent depth and shadows with motion support
 */

// ============================================================================
// DEPTH LEVELS
// ============================================================================

/**
 * 5-level depth system for visual hierarchy
 */
export const DEPTH_LEVELS = {
  0: 'flat',        // No shadow
  1: 'soft',        // Subtle elevation
  2: 'glow-edge',   // Highlighted edge
  3: 'embossed',    // Raised surface
  4: 'spotlight',   // Premium focus
} as const

export type DepthLevel = 0 | 1 | 2 | 3 | 4

// ============================================================================
// SHADOW DEFINITIONS
// ============================================================================

/**
 * Level 0: Flat (no shadow)
 */
export const FLAT_SHADOW = {
  default: 'shadow-none',
  hover: 'hover:shadow-none',
  css: 'none',
}

/**
 * Level 1: Soft (subtle elevation)
 */
export const SOFT_SHADOW = {
  default: 'shadow-sm',
  hover: 'hover:shadow-md',
  css: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  hoverCss: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}

/**
 * Level 2: Glow Edge (highlighted edge with glow)
 */
export const GLOW_EDGE_SHADOW = {
  default: 'shadow-lg',
  hover: 'hover:shadow-xl',
  css: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  hoverCss: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Colored glow variants
  gold: {
    default: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    hover: 'hover:shadow-[0_0_40px_rgba(234,179,8,0.6)]',
  },
  red: {
    default: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    hover: 'hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]',
  },
  green: {
    default: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    hover: 'hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]',
  },
  blue: {
    default: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    hover: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]',
  },
  purple: {
    default: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    hover: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]',
  },
}

/**
 * Level 3: Embossed (raised surface effect)
 */
export const EMBOSSED_SHADOW = {
  default: 'shadow-2xl',
  hover: 'hover:shadow-2xl hover:-translate-y-1',
  css: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  hoverCss: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 -2px 0 0 rgba(255, 255, 255, 0.5)',
}

/**
 * Level 4: Spotlight (premium focus with intense glow)
 */
export const SPOTLIGHT_SHADOW = {
  default: 'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]',
  hover: 'hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]',
  css: '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
  hoverCss: '0 35px 60px -15px rgba(0, 0, 0, 0.4)',

  // Colored spotlight variants
  gold: {
    default: 'shadow-[0_20px_60px_rgba(234,179,8,0.4)]',
    hover: 'hover:shadow-[0_25px_70px_rgba(234,179,8,0.6)]',
  },
  red: {
    default: 'shadow-[0_20px_60px_rgba(239,68,68,0.4)]',
    hover: 'hover:shadow-[0_25px_70px_rgba(239,68,68,0.6)]',
  },
  premium: {
    default: 'shadow-[0_20px_60px_rgba(0,0,0,0.25),0_0_40px_rgba(234,179,8,0.3)]',
    hover: 'hover:shadow-[0_25px_70px_rgba(0,0,0,0.3),0_0_60px_rgba(234,179,8,0.5)]',
  },
}

// ============================================================================
// HOVER LIFT VARIATIONS
// ============================================================================

/**
 * Hover lift effects (combined with shadows)
 */
export const HOVER_LIFT = {
  none: '',
  subtle: 'hover:-translate-y-0.5 transition-transform duration-200',
  medium: 'hover:-translate-y-1 transition-transform duration-200',
  high: 'hover:-translate-y-2 transition-transform duration-300',
  premium: 'hover:-translate-y-2 hover:scale-105 transition-all duration-300',
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get shadow class by depth level
 */
export function getDepthClass(
  level: DepthLevel,
  withHover: boolean = false
): string {
  const shadowMap = {
    0: FLAT_SHADOW,
    1: SOFT_SHADOW,
    2: GLOW_EDGE_SHADOW,
    3: EMBOSSED_SHADOW,
    4: SPOTLIGHT_SHADOW,
  }

  const shadow = shadowMap[level]

  return withHover
    ? `${shadow.default} ${shadow.hover}`
    : shadow.default
}

/**
 * Get colored glow shadow
 */
export function getColoredGlow(
  color: 'gold' | 'red' | 'green' | 'blue' | 'purple',
  withHover: boolean = false
): string {
  const glow = GLOW_EDGE_SHADOW[color]

  return withHover
    ? `${glow.default} ${glow.hover}`
    : glow.default
}

/**
 * Get colored spotlight
 */
export function getColoredSpotlight(
  color: 'gold' | 'red' | 'premium',
  withHover: boolean = false
): string {
  const spotlight = SPOTLIGHT_SHADOW[color]

  return withHover
    ? `${spotlight.default} ${spotlight.hover}`
    : spotlight.default
}

/**
 * Get complete depth effect (shadow + lift)
 */
export function getDepthEffect(
  level: DepthLevel,
  lift: keyof typeof HOVER_LIFT = 'none'
): string {
  const shadow = getDepthClass(level, lift !== 'none')
  const liftClass = HOVER_LIFT[lift]

  return `${shadow} ${liftClass}`.trim()
}

/**
 * Get premium product card effect
 */
export function getPremiumCardEffect(): string {
  return `${getColoredGlow('gold', true)} ${HOVER_LIFT.premium}`
}

/**
 * Get featured promo effect
 */
export function getFeaturedPromoEffect(): string {
  return `${getColoredSpotlight('red', true)} ${HOVER_LIFT.high}`
}

// ============================================================================
// REDUCED MOTION VARIANTS
// ============================================================================

/**
 * Depth classes that respect prefers-reduced-motion
 */
export function getAccessibleDepth(
  level: DepthLevel,
  lift: keyof typeof HOVER_LIFT = 'none'
): string {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // No hover effects, only static shadows
    return getDepthClass(level, false)
  }

  return getDepthEffect(level, lift)
}

// ============================================================================
// COMPONENT-SPECIFIC DEPTH PRESETS
// ============================================================================

/**
 * HeroBanner depth
 */
export const HERO_DEPTH = {
  default: getDepthClass(2, false),      // Glow edge, no hover
  featured: getDepthClass(3, false),     // Embossed, no hover
  premium: getColoredSpotlight('premium', false),
}

/**
 * PromoPanel depth
 */
export const PROMO_DEPTH = {
  default: getDepthClass(2, true),       // Glow edge with hover
  featured: getColoredGlow('red', true), // Red glow with hover
  premium: getColoredSpotlight('gold', true),
}

/**
 * ProductCard depth
 */
export const PRODUCT_CARD_DEPTH = {
  default: getDepthEffect(1, 'subtle'),  // Soft shadow, subtle lift
  hover: getDepthEffect(2, 'medium'),    // Glow edge, medium lift
  featured: getDepthEffect(2, 'high'),   // Glow edge, high lift
  premium: getPremiumCardEffect(),       // Gold glow, premium lift
}

/**
 * CategoryCard / BrandCard depth
 */
export const CATEGORY_DEPTH = {
  default: getDepthEffect(1, 'subtle'),
  hover: getDepthEffect(2, 'medium'),
  featured: getColoredGlow('blue', true),
}

/**
 * PriceTierBar depth
 */
export const TIER_BAR_DEPTH = {
  default: getDepthClass(1, false),      // Soft shadow, no lift
  sticky: 'shadow-md',                   // Medium shadow when sticky
}

/**
 * Layout variant depth
 */
export const LAYOUT_VARIANT_DEPTH = {
  masonry: getDepthEffect(1, 'subtle'),
  spotlight: getDepthEffect(3, 'medium'),
  promoRow: getDepthEffect(2, 'high'),
  dualHero: getDepthClass(2, false),
  story: getDepthClass(0, false),        // Flat for seamless panels
}

// ============================================================================
// INNER SHADOWS (INSET)
// ============================================================================

/**
 * Inner shadow for recessed elements
 */
export const INNER_SHADOWS = {
  subtle: 'shadow-inner',
  medium: 'shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)]',
  deep: 'shadow-[inset_0_4px_8px_0_rgba(0,0,0,0.1)]',
} as const

/**
 * Get inner shadow class
 */
export function getInnerShadow(
  intensity: 'subtle' | 'medium' | 'deep' = 'subtle'
): string {
  return INNER_SHADOWS[intensity]
}

// ============================================================================
// DROP SHADOWS (FOR TEXT/ICONS)
// ============================================================================

/**
 * Drop shadow for text and icons
 */
export const DROP_SHADOWS = {
  subtle: 'drop-shadow-sm',              // 0 1px 1px rgba(0,0,0,0.05)
  normal: 'drop-shadow',                 // 0 1px 2px rgba(0,0,0,0.1)
  medium: 'drop-shadow-md',              // 0 4px 3px rgba(0,0,0,0.07)
  strong: 'drop-shadow-lg',              // 0 10px 8px rgba(0,0,0,0.04)
  premium: 'drop-shadow-2xl',            // 0 25px 25px rgba(0,0,0,0.15)
} as const

/**
 * Get drop shadow class
 */
export function getDropShadow(
  intensity: keyof typeof DROP_SHADOWS = 'normal'
): string {
  return DROP_SHADOWS[intensity]
}

// ============================================================================
// GLOW PULSE SYNCED WITH ANIMATIONS
// ============================================================================

/**
 * Pulsing glow animations (synced with animation/presets.ts)
 */
export const GLOW_PULSE = {
  gold: {
    class: 'animate-[glow-pulse_2s_ease-in-out_infinite]',
    css: `
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.3); }
        50% { box-shadow: 0 0 40px rgba(234, 179, 8, 0.6); }
      }
    `,
  },
  red: {
    class: 'animate-[glow-pulse-red_2s_ease-in-out_infinite]',
    css: `
      @keyframes glow-pulse-red {
        0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
        50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
      }
    `,
  },
  green: {
    class: 'animate-[glow-pulse-green_2s_ease-in-out_infinite]',
    css: `
      @keyframes glow-pulse-green {
        0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
        50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
      }
    `,
  },
}

// ============================================================================
// COMPLETE DEPTH SYSTEM EXPORT
// ============================================================================

/**
 * All depth utilities in one object
 */
export const depthSystem = {
  // Levels
  levels: DEPTH_LEVELS,

  // Shadows
  flat: FLAT_SHADOW,
  soft: SOFT_SHADOW,
  glowEdge: GLOW_EDGE_SHADOW,
  embossed: EMBOSSED_SHADOW,
  spotlight: SPOTLIGHT_SHADOW,

  // Hover effects
  hoverLift: HOVER_LIFT,

  // Component presets
  hero: HERO_DEPTH,
  promo: PROMO_DEPTH,
  productCard: PRODUCT_CARD_DEPTH,
  category: CATEGORY_DEPTH,
  tierBar: TIER_BAR_DEPTH,
  layoutVariant: LAYOUT_VARIANT_DEPTH,

  // Special effects
  innerShadows: INNER_SHADOWS,
  dropShadows: DROP_SHADOWS,
  glowPulse: GLOW_PULSE,

  // Utilities
  getDepthClass,
  getColoredGlow,
  getColoredSpotlight,
  getDepthEffect,
  getPremiumCardEffect,
  getFeaturedPromoEffect,
  getAccessibleDepth,
  getInnerShadow,
  getDropShadow,
}

export default depthSystem
