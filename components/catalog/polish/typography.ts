/**
 * Azteka DSD Catalog - Global Typography System
 * Unified type scale for all catalog components across devices
 *
 * LAP #4: Polish - Consistent typography for mobile, tablet, and desktop
 */

// ============================================================================
// TYPE SCALE (Base Sizes)
// ============================================================================

/**
 * Global type scale in pixels
 * Based on modular scale with 1.25 ratio
 */
export const TYPE_SCALE = {
  xs: 12,     // 0.75rem - Fine print, metadata
  sm: 14,     // 0.875rem - Small text, captions
  base: 16,   // 1rem - Body text
  lg: 18,     // 1.125rem - Large body
  xl: 20,     // 1.25rem - Subheadings
  '2xl': 24,  // 1.5rem - Section headings
  '3xl': 30,  // 1.875rem - Page titles
  '4xl': 36,  // 2.25rem - Hero headlines
  '5xl': 48,  // 3rem - Display headlines
  '6xl': 64,  // 4rem - Feature headlines
} as const

// ============================================================================
// DEVICE-SPECIFIC SCALES
// ============================================================================

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Mobile type scale (320px - 767px)
 */
export const MOBILE_SCALE = {
  metadata: TYPE_SCALE.xs,        // 12px
  caption: TYPE_SCALE.sm,         // 14px
  body: TYPE_SCALE.base,          // 16px
  bodyLarge: TYPE_SCALE.lg,       // 18px
  subheading: TYPE_SCALE.xl,      // 20px
  heading: TYPE_SCALE['2xl'],     // 24px
  title: TYPE_SCALE['3xl'],       // 30px
  hero: TYPE_SCALE['4xl'],        // 36px
  display: TYPE_SCALE['4xl'],     // 36px (same as hero on mobile)
} as const

/**
 * Tablet type scale (768px - 1366px)
 */
export const TABLET_SCALE = {
  metadata: TYPE_SCALE.sm,        // 14px
  caption: TYPE_SCALE.base,       // 16px
  body: TYPE_SCALE.lg,            // 18px
  bodyLarge: TYPE_SCALE.xl,       // 20px
  subheading: TYPE_SCALE['2xl'],  // 24px
  heading: TYPE_SCALE['3xl'],     // 30px
  title: TYPE_SCALE['4xl'],       // 36px
  hero: TYPE_SCALE['5xl'],        // 48px
  display: TYPE_SCALE['5xl'],     // 48px
} as const

/**
 * Desktop type scale (1367px+)
 */
export const DESKTOP_SCALE = {
  metadata: TYPE_SCALE.sm,        // 14px
  caption: TYPE_SCALE.base,       // 16px
  body: TYPE_SCALE.lg,            // 18px
  bodyLarge: TYPE_SCALE.xl,       // 20px
  subheading: TYPE_SCALE['2xl'],  // 24px
  heading: TYPE_SCALE['4xl'],     // 36px
  title: TYPE_SCALE['5xl'],       // 48px
  hero: TYPE_SCALE['6xl'],        // 64px
  display: TYPE_SCALE['6xl'],     // 64px
} as const

// ============================================================================
// TAILWIND CLASS MAPPINGS
// ============================================================================

/**
 * Responsive typography classes
 */
export const RESPONSIVE_TEXT = {
  metadata: 'text-xs md:text-sm',
  caption: 'text-sm md:text-base',
  body: 'text-base md:text-lg',
  bodyLarge: 'text-lg md:text-xl',
  subheading: 'text-xl md:text-2xl',
  heading: 'text-2xl md:text-3xl lg:text-4xl',
  title: 'text-3xl md:text-4xl lg:text-5xl',
  hero: 'text-4xl md:text-5xl lg:text-6xl',
  display: 'text-4xl md:text-5xl lg:text-6xl',
} as const

// ============================================================================
// LINE HEIGHT
// ============================================================================

/**
 * Line height presets
 */
export const LINE_HEIGHT = {
  tight: 1.1,       // Tight headlines
  snug: 1.25,       // Headings
  normal: 1.5,      // Body text
  relaxed: 1.75,    // Comfortable reading
  loose: 2,         // Extra spacing
} as const

/**
 * Line height classes
 */
export const LINE_HEIGHT_CLASSES = {
  tight: 'leading-tight',       // 1.25
  snug: 'leading-snug',         // 1.375
  normal: 'leading-normal',     // 1.5
  relaxed: 'leading-relaxed',   // 1.625
  loose: 'leading-loose',       // 2
} as const

// ============================================================================
// LETTER SPACING (TRACKING)
// ============================================================================

/**
 * Letter spacing presets
 */
export const LETTER_SPACING = {
  tighter: -0.05,   // -0.05em
  tight: -0.025,    // -0.025em
  normal: 0,        // 0
  wide: 0.025,      // 0.025em
  wider: 0.05,      // 0.05em
  widest: 0.1,      // 0.1em
} as const

/**
 * Letter spacing classes
 */
export const LETTER_SPACING_CLASSES = {
  tighter: 'tracking-tighter',  // -0.05em
  tight: 'tracking-tight',      // -0.025em
  normal: 'tracking-normal',    // 0
  wide: 'tracking-wide',        // 0.025em
  wider: 'tracking-wider',      // 0.05em
  widest: 'tracking-widest',    // 0.1em
} as const

// ============================================================================
// FONT WEIGHT
// ============================================================================

/**
 * Font weight presets
 */
export const FONT_WEIGHT = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const

/**
 * Font weight classes
 */
export const FONT_WEIGHT_CLASSES = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
} as const

// ============================================================================
// COMPONENT-SPECIFIC TYPOGRAPHY
// ============================================================================

/**
 * HeroBanner typography
 */
export const HERO_TYPOGRAPHY = {
  headline: {
    size: RESPONSIVE_TEXT.hero,
    weight: FONT_WEIGHT_CLASSES.extrabold,
    lineHeight: LINE_HEIGHT_CLASSES.tight,
    tracking: LETTER_SPACING_CLASSES.tight,
    class: 'text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight',
  },
  subheadline: {
    size: RESPONSIVE_TEXT.bodyLarge,
    weight: FONT_WEIGHT_CLASSES.medium,
    lineHeight: LINE_HEIGHT_CLASSES.normal,
    tracking: LETTER_SPACING_CLASSES.normal,
    class: 'text-lg md:text-xl font-medium leading-normal',
  },
  cta: {
    size: RESPONSIVE_TEXT.body,
    weight: FONT_WEIGHT_CLASSES.bold,
    tracking: LETTER_SPACING_CLASSES.wide,
    class: 'text-base md:text-lg font-bold tracking-wide',
  },
}

/**
 * PromoPanel typography
 */
export const PROMO_TYPOGRAPHY = {
  badge: {
    size: 'text-xs md:text-sm',
    weight: FONT_WEIGHT_CLASSES.bold,
    tracking: LETTER_SPACING_CLASSES.wider,
    class: 'text-xs md:text-sm font-bold tracking-wider uppercase',
  },
  title: {
    size: RESPONSIVE_TEXT.heading,
    weight: FONT_WEIGHT_CLASSES.bold,
    lineHeight: LINE_HEIGHT_CLASSES.snug,
    class: 'text-2xl md:text-3xl lg:text-4xl font-bold leading-snug',
  },
  discount: {
    size: RESPONSIVE_TEXT.title,
    weight: FONT_WEIGHT_CLASSES.black,
    lineHeight: LINE_HEIGHT_CLASSES.tight,
    class: 'text-3xl md:text-4xl lg:text-5xl font-black leading-tight',
  },
  description: {
    size: RESPONSIVE_TEXT.caption,
    weight: FONT_WEIGHT_CLASSES.normal,
    lineHeight: LINE_HEIGHT_CLASSES.relaxed,
    class: 'text-sm md:text-base font-normal leading-relaxed',
  },
}

/**
 * ProductCard typography
 */
export const PRODUCT_TYPOGRAPHY = {
  name: {
    size: RESPONSIVE_TEXT.body,
    weight: FONT_WEIGHT_CLASSES.semibold,
    lineHeight: LINE_HEIGHT_CLASSES.snug,
    class: 'text-base md:text-lg font-semibold leading-snug',
  },
  brand: {
    size: RESPONSIVE_TEXT.caption,
    weight: FONT_WEIGHT_CLASSES.medium,
    class: 'text-sm md:text-base font-medium',
  },
  price: {
    size: RESPONSIVE_TEXT.bodyLarge,
    weight: FONT_WEIGHT_CLASSES.bold,
    class: 'text-lg md:text-xl font-bold',
  },
  originalPrice: {
    size: RESPONSIVE_TEXT.caption,
    weight: FONT_WEIGHT_CLASSES.normal,
    class: 'text-sm md:text-base font-normal line-through opacity-60',
  },
  badge: {
    size: 'text-xs',
    weight: FONT_WEIGHT_CLASSES.bold,
    tracking: LETTER_SPACING_CLASSES.wide,
    class: 'text-xs font-bold tracking-wide uppercase',
  },
  metadata: {
    size: RESPONSIVE_TEXT.metadata,
    weight: FONT_WEIGHT_CLASSES.normal,
    class: 'text-xs md:text-sm font-normal',
  },
}

/**
 * CategoryCard / BrandCard typography
 */
export const CATEGORY_TYPOGRAPHY = {
  name: {
    size: RESPONSIVE_TEXT.subheading,
    weight: FONT_WEIGHT_CLASSES.bold,
    lineHeight: LINE_HEIGHT_CLASSES.snug,
    class: 'text-xl md:text-2xl font-bold leading-snug',
  },
  description: {
    size: RESPONSIVE_TEXT.caption,
    weight: FONT_WEIGHT_CLASSES.normal,
    lineHeight: LINE_HEIGHT_CLASSES.relaxed,
    class: 'text-sm md:text-base font-normal leading-relaxed',
  },
  productCount: {
    size: RESPONSIVE_TEXT.metadata,
    weight: FONT_WEIGHT_CLASSES.medium,
    class: 'text-xs md:text-sm font-medium',
  },
}

/**
 * PriceTierBar typography
 */
export const TIER_TYPOGRAPHY = {
  label: {
    size: RESPONSIVE_TEXT.body,
    weight: FONT_WEIGHT_CLASSES.semibold,
    tracking: LETTER_SPACING_CLASSES.wide,
    class: 'text-base md:text-lg font-semibold tracking-wide',
  },
  count: {
    size: RESPONSIVE_TEXT.metadata,
    weight: FONT_WEIGHT_CLASSES.normal,
    class: 'text-xs md:text-sm font-normal',
  },
}

/**
 * ShowcaseSection typography
 */
export const SHOWCASE_TYPOGRAPHY = {
  title: {
    size: RESPONSIVE_TEXT.title,
    weight: FONT_WEIGHT_CLASSES.bold,
    lineHeight: LINE_HEIGHT_CLASSES.tight,
    class: 'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
  },
  subtitle: {
    size: RESPONSIVE_TEXT.bodyLarge,
    weight: FONT_WEIGHT_CLASSES.normal,
    lineHeight: LINE_HEIGHT_CLASSES.relaxed,
    class: 'text-lg md:text-xl font-normal leading-relaxed',
  },
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

/**
 * "Fiesta Headline" variant - Vibrant, playful, Mexican DSD style
 */
export const FIESTA_HEADLINE = {
  size: RESPONSIVE_TEXT.hero,
  weight: FONT_WEIGHT_CLASSES.black,
  lineHeight: LINE_HEIGHT_CLASSES.tight,
  tracking: LETTER_SPACING_CLASSES.tight,
  class: 'text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight',
  colors: 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent',
  effects: 'drop-shadow-lg',
}

/**
 * "Premium Retail" variant - Sophisticated, upscale
 */
export const PREMIUM_HEADLINE = {
  size: RESPONSIVE_TEXT.hero,
  weight: FONT_WEIGHT_CLASSES.light,
  lineHeight: LINE_HEIGHT_CLASSES.tight,
  tracking: LETTER_SPACING_CLASSES.widest,
  class: 'text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-widest uppercase',
  colors: 'text-gray-900',
  effects: 'drop-shadow-sm',
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get responsive text class
 */
export function getResponsiveText(
  type: keyof typeof RESPONSIVE_TEXT
): string {
  return RESPONSIVE_TEXT[type]
}

/**
 * Get complete typography class for component element
 */
export function getTypographyClass(
  component: 'hero' | 'promo' | 'product' | 'category' | 'tier' | 'showcase',
  element: string
): string {
  const componentMap = {
    hero: HERO_TYPOGRAPHY,
    promo: PROMO_TYPOGRAPHY,
    product: PRODUCT_TYPOGRAPHY,
    category: CATEGORY_TYPOGRAPHY,
    tier: TIER_TYPOGRAPHY,
    showcase: SHOWCASE_TYPOGRAPHY,
  }

  const componentTypography = componentMap[component] as any
  return componentTypography[element]?.class || ''
}

/**
 * Build custom typography class
 */
export function buildTypographyClass(options: {
  size?: keyof typeof RESPONSIVE_TEXT
  weight?: keyof typeof FONT_WEIGHT_CLASSES
  lineHeight?: keyof typeof LINE_HEIGHT_CLASSES
  tracking?: keyof typeof LETTER_SPACING_CLASSES
}): string {
  const classes = []

  if (options.size) classes.push(RESPONSIVE_TEXT[options.size])
  if (options.weight) classes.push(FONT_WEIGHT_CLASSES[options.weight])
  if (options.lineHeight) classes.push(LINE_HEIGHT_CLASSES[options.lineHeight])
  if (options.tracking) classes.push(LETTER_SPACING_CLASSES[options.tracking])

  return classes.join(' ')
}

/**
 * Get font size in rem
 */
export function toRem(px: number): string {
  return `${px / 16}rem`
}

/**
 * Get type scale value
 */
export function getTypeScale(key: keyof typeof TYPE_SCALE): number {
  return TYPE_SCALE[key]
}

// ============================================================================
// COMPLETE TYPOGRAPHY PRESET COLLECTIONS
// ============================================================================

/**
 * All typography utilities in one object
 */
export const typographySystem = {
  // Scales
  scale: TYPE_SCALE,
  mobile: MOBILE_SCALE,
  tablet: TABLET_SCALE,
  desktop: DESKTOP_SCALE,

  // Responsive classes
  responsive: RESPONSIVE_TEXT,

  // Modifiers
  lineHeight: LINE_HEIGHT,
  lineHeightClasses: LINE_HEIGHT_CLASSES,
  letterSpacing: LETTER_SPACING,
  letterSpacingClasses: LETTER_SPACING_CLASSES,
  fontWeight: FONT_WEIGHT,
  fontWeightClasses: FONT_WEIGHT_CLASSES,

  // Component typography
  hero: HERO_TYPOGRAPHY,
  promo: PROMO_TYPOGRAPHY,
  product: PRODUCT_TYPOGRAPHY,
  category: CATEGORY_TYPOGRAPHY,
  tier: TIER_TYPOGRAPHY,
  showcase: SHOWCASE_TYPOGRAPHY,

  // Variants
  fiestaHeadline: FIESTA_HEADLINE,
  premiumHeadline: PREMIUM_HEADLINE,

  // Utilities
  getResponsiveText,
  getTypographyClass,
  buildTypographyClass,
  toRem,
  getTypeScale,
}

export default typographySystem
