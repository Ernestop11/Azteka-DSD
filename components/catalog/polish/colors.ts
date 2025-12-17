/**
 * Azteka DSD Catalog - Global Color System
 * Unified color palette for all catalog components and seasonal themes
 *
 * LAP #4: Polish - Consistent colors and gradients
 */

// ============================================================================
// CORE PALETTE
// ============================================================================

/**
 * Primary brand colors
 */
export const PRIMARY_COLORS = {
  catalogBlue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',   // Primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  holidayRed: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',   // Primary
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  fiestaGreen: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',   // Primary
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  goldAccent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',   // Primary
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },
} as const

/**
 * Neutral colors
 */
export const NEUTRAL_COLORS = {
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  black: '#000000',
} as const

/**
 * Semantic colors
 */
export const SEMANTIC_COLORS = {
  success: '#22c55e',     // Green-500
  warning: '#eab308',     // Gold-500
  error: '#ef4444',       // Red-500
  info: '#3b82f6',        // Blue-500
} as const

// ============================================================================
// SEASONAL THEME PALETTES
// ============================================================================

/**
 * Christmas / Navidad theme colors
 */
export const CHRISTMAS_PALETTE = {
  primary: PRIMARY_COLORS.holidayRed[600],      // Deep red
  secondary: PRIMARY_COLORS.fiestaGreen[600],   // Forest green
  accent: PRIMARY_COLORS.goldAccent[500],       // Gold
  background: '#fef2f2',                        // Light red tint
  text: NEUTRAL_COLORS.gray[900],
  gradient: {
    start: PRIMARY_COLORS.holidayRed[500],
    middle: PRIMARY_COLORS.goldAccent[400],
    end: PRIMARY_COLORS.fiestaGreen[500],
    class: 'bg-gradient-to-r from-red-500 via-yellow-400 to-green-500',
  },
} as const

/**
 * Posadas theme colors
 */
export const POSADAS_PALETTE = {
  primary: '#a855f7',        // Purple-500
  secondary: '#ec4899',      // Pink-500
  accent: PRIMARY_COLORS.goldAccent[400],
  background: '#faf5ff',     // Light purple tint
  text: NEUTRAL_COLORS.gray[900],
  gradient: {
    start: '#a855f7',
    middle: '#ec4899',
    end: '#fbbf24',
    class: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400',
  },
} as const

/**
 * Día de Muertos theme colors
 */
export const DIA_MUERTOS_PALETTE = {
  primary: '#f97316',        // Orange-500
  secondary: '#ec4899',      // Pink-500
  accent: '#a855f7',         // Purple-500
  background: '#fff7ed',     // Light orange tint
  text: NEUTRAL_COLORS.gray[900],
  gradient: {
    start: '#f97316',
    middle: '#ec4899',
    end: '#a855f7',
    class: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500',
  },
} as const

/**
 * Summer / Verano theme colors
 */
export const SUMMER_PALETTE = {
  primary: '#06b6d4',        // Cyan-500
  secondary: '#3b82f6',      // Blue-500
  accent: '#a855f7',         // Purple-500
  background: '#ecfeff',     // Light cyan tint
  text: NEUTRAL_COLORS.gray[900],
  gradient: {
    start: '#06b6d4',
    middle: '#3b82f6',
    end: '#a855f7',
    class: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500',
  },
} as const

/**
 * Back to School theme colors
 */
export const BACK_TO_SCHOOL_PALETTE = {
  primary: '#3b82f6',        // Blue-500
  secondary: '#22c55e',      // Green-500
  accent: '#eab308',         // Gold-500
  background: '#eff6ff',     // Light blue tint
  text: NEUTRAL_COLORS.gray[900],
  gradient: {
    start: '#3b82f6',
    middle: '#22c55e',
    end: '#eab308',
    class: 'bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500',
  },
} as const

// ============================================================================
// RETAIL MODE PALETTES
// ============================================================================

/**
 * Chedraui brand colors
 */
export const CHEDRAUI_PALETTE = {
  primary: '#dc2626',        // Red-600
  secondary: '#eab308',      // Gold-500
  accent: '#fff',
  background: '#fef2f2',
  text: NEUTRAL_COLORS.gray[900],
  gradient: {
    start: '#dc2626',
    end: '#f97316',
    class: 'bg-gradient-to-br from-red-600 to-orange-500',
  },
} as const

/**
 * Walmart Mexico brand colors
 */
export const WALMART_PALETTE = {
  primary: '#0071ce',        // Walmart blue
  secondary: '#ffc220',      // Walmart yellow
  accent: '#fff',
  background: '#eff6ff',
  text: NEUTRAL_COLORS.gray[900],
  gradient: {
    start: '#0071ce',
    end: '#ffc220',
    class: 'bg-gradient-to-br from-[#0071ce] to-[#ffc220]',
  },
} as const

/**
 * Generic premium retail
 */
export const PREMIUM_RETAIL_PALETTE = {
  primary: NEUTRAL_COLORS.gray[900],
  secondary: PRIMARY_COLORS.goldAccent[600],
  accent: '#fff',
  background: '#f9fafb',
  text: NEUTRAL_COLORS.gray[900],
  gradient: {
    start: NEUTRAL_COLORS.gray[800],
    end: NEUTRAL_COLORS.gray[600],
    class: 'bg-gradient-to-br from-gray-800 to-gray-600',
  },
} as const

// ============================================================================
// FUNCTIONAL COLOR MAPPINGS
// ============================================================================

/**
 * Badge colors
 */
export const BADGE_COLORS = {
  NEW: {
    bg: PRIMARY_COLORS.catalogBlue[500],
    text: '#fff',
    class: 'bg-blue-500 text-white',
  },
  HOT: {
    bg: PRIMARY_COLORS.holidayRed[500],
    text: '#fff',
    class: 'bg-red-500 text-white',
  },
  SALE: {
    bg: PRIMARY_COLORS.goldAccent[400],
    text: NEUTRAL_COLORS.gray[900],
    class: 'bg-yellow-400 text-gray-900',
  },
  LIMITED: {
    bg: '#a855f7',  // Purple-500
    text: '#fff',
    class: 'bg-purple-500 text-white',
  },
  OFERTA: {
    bg: PRIMARY_COLORS.holidayRed[600],
    text: '#fff',
    class: 'bg-red-600 text-white',
  },
} as const

/**
 * Tier colors (A, B, C pricing)
 */
export const TIER_COLORS = {
  A: {
    primary: PRIMARY_COLORS.goldAccent[500],
    secondary: PRIMARY_COLORS.goldAccent[100],
    text: PRIMARY_COLORS.goldAccent[900],
    class: 'bg-yellow-500 text-yellow-900',
    outlineClass: 'border-yellow-500 text-yellow-700',
  },
  B: {
    primary: PRIMARY_COLORS.catalogBlue[500],
    secondary: PRIMARY_COLORS.catalogBlue[100],
    text: PRIMARY_COLORS.catalogBlue[900],
    class: 'bg-blue-500 text-blue-900',
    outlineClass: 'border-blue-500 text-blue-700',
  },
  C: {
    primary: PRIMARY_COLORS.fiestaGreen[500],
    secondary: PRIMARY_COLORS.fiestaGreen[100],
    text: PRIMARY_COLORS.fiestaGreen[900],
    class: 'bg-green-500 text-green-900',
    outlineClass: 'border-green-500 text-green-700',
  },
} as const

/**
 * Glow effect colors (synced with animation presets)
 */
export const GLOW_COLORS = {
  gold: {
    color: PRIMARY_COLORS.goldAccent[500],
    class: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
    hoverClass: 'hover:shadow-[0_0_40px_rgba(234,179,8,0.6)]',
  },
  red: {
    color: PRIMARY_COLORS.holidayRed[500],
    class: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    hoverClass: 'hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]',
  },
  green: {
    color: PRIMARY_COLORS.fiestaGreen[500],
    class: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
    hoverClass: 'hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]',
  },
  blue: {
    color: PRIMARY_COLORS.catalogBlue[500],
    class: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    hoverClass: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]',
  },
  purple: {
    color: '#a855f7',
    class: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    hoverClass: 'hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]',
  },
} as const

// ============================================================================
// GRADIENT LIBRARY
// ============================================================================

/**
 * Pre-built gradients for backgrounds
 */
export const GRADIENTS = {
  // Festive
  christmasGradient: 'bg-gradient-to-r from-red-600 via-yellow-400 to-green-600',
  posadasGradient: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400',
  diaMuertosGradient: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500',
  summerGradient: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500',
  backToSchoolGradient: 'bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500',

  // Retail
  chedrauiGradient: 'bg-gradient-to-br from-red-600 to-orange-500',
  walmartGradient: 'bg-gradient-to-br from-[#0071ce] to-[#ffc220]',
  premiumGradient: 'bg-gradient-to-br from-gray-800 to-gray-600',

  // Metallic
  goldFoil: 'bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600',
  silverFoil: 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400',

  // Subtle
  warmGlow: 'bg-gradient-to-br from-orange-50 to-red-50',
  coolGlow: 'bg-gradient-to-br from-blue-50 to-cyan-50',
  neutralGlow: 'bg-gradient-to-br from-gray-50 to-gray-100',
} as const

/**
 * Text gradients
 */
export const TEXT_GRADIENTS = {
  christmas: 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent',
  posadas: 'bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 bg-clip-text text-transparent',
  diaMuertos: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent',
  summer: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent',
  gold: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent',
  premium: 'bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent',
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get theme palette by ID
 */
export function getThemePalette(
  theme: 'christmas' | 'posadas' | 'dia-muertos' | 'summer' | 'back-to-school'
) {
  const paletteMap = {
    christmas: CHRISTMAS_PALETTE,
    posadas: POSADAS_PALETTE,
    'dia-muertos': DIA_MUERTOS_PALETTE,
    summer: SUMMER_PALETTE,
    'back-to-school': BACK_TO_SCHOOL_PALETTE,
  }

  return paletteMap[theme]
}

/**
 * Get retail palette by variant
 */
export function getRetailPalette(
  variant: 'chedraui' | 'walmart' | 'premium'
) {
  const paletteMap = {
    chedraui: CHEDRAUI_PALETTE,
    walmart: WALMART_PALETTE,
    premium: PREMIUM_RETAIL_PALETTE,
  }

  return paletteMap[variant]
}

/**
 * Get badge color classes
 */
export function getBadgeColor(
  badge: 'NEW' | 'HOT' | 'SALE' | 'LIMITED' | 'OFERTA'
): string {
  return BADGE_COLORS[badge].class
}

/**
 * Get tier color classes
 */
export function getTierColor(
  tier: 'A' | 'B' | 'C',
  variant: 'filled' | 'outline' = 'filled'
): string {
  return variant === 'filled'
    ? TIER_COLORS[tier].class
    : TIER_COLORS[tier].outlineClass
}

/**
 * Get glow effect class
 */
export function getGlowEffect(
  color: 'gold' | 'red' | 'green' | 'blue' | 'purple',
  hover: boolean = false
): string {
  return hover
    ? `${GLOW_COLORS[color].class} ${GLOW_COLORS[color].hoverClass}`
    : GLOW_COLORS[color].class
}

/**
 * Get gradient class
 */
export function getGradient(
  gradient: keyof typeof GRADIENTS
): string {
  return GRADIENTS[gradient]
}

/**
 * Get text gradient class
 */
export function getTextGradient(
  gradient: keyof typeof TEXT_GRADIENTS
): string {
  return TEXT_GRADIENTS[gradient]
}

// ============================================================================
// COLOR SYSTEM EXPORT
// ============================================================================

/**
 * Complete color system
 */
export const colorSystem = {
  // Core palette
  primary: PRIMARY_COLORS,
  neutral: NEUTRAL_COLORS,
  semantic: SEMANTIC_COLORS,

  // Theme palettes
  christmas: CHRISTMAS_PALETTE,
  posadas: POSADAS_PALETTE,
  diaMuertos: DIA_MUERTOS_PALETTE,
  summer: SUMMER_PALETTE,
  backToSchool: BACK_TO_SCHOOL_PALETTE,

  // Retail palettes
  chedraui: CHEDRAUI_PALETTE,
  walmart: WALMART_PALETTE,
  premium: PREMIUM_RETAIL_PALETTE,

  // Functional colors
  badges: BADGE_COLORS,
  tiers: TIER_COLORS,
  glow: GLOW_COLORS,

  // Gradients
  gradients: GRADIENTS,
  textGradients: TEXT_GRADIENTS,

  // Utilities
  getThemePalette,
  getRetailPalette,
  getBadgeColor,
  getTierColor,
  getGlowEffect,
  getGradient,
  getTextGradient,
}

export default colorSystem
