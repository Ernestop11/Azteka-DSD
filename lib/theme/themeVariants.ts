/**
 * THEME VARIANTS
 * Sales Rep can switch between these themes per customer
 *
 * Base: Toy Store (default)
 * Variant 1: Neon Energy (dark + neon glow)
 * Variant 2: Fresh Splash (water effects for drinks)
 * Variant 3: Luxury Gold (premium gold frames)
 */

export type ThemeVariant = 'toy-store' | 'neon-energy' | 'fresh-splash' | 'luxury-gold'

export interface ThemeDefinition {
  id: ThemeVariant
  name: string
  description: string
  icon: string

  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string

  // Gradients
  backgroundGradient: string
  cardGradient: string
  priceGradient: string

  // Shadows & Effects
  productShadow: string
  cardShadow: string
  glowEffect?: string

  // Background Pattern
  pattern?: string
  patternOpacity?: number

  // GIF Support
  backgroundGif?: string
  gifAutoPlay?: boolean

  // Category specific
  categoryGradients?: Record<string, string>
}

export const THEME_VARIANTS: Record<ThemeVariant, ThemeDefinition> = {
  // DEFAULT: Toy Store (Amazon + Temu)
  'toy-store': {
    id: 'toy-store',
    name: 'Toy Store',
    description: 'Bold Amazon/Temu style - colorful, energetic, high conversion',
    icon: '🎪',

    primaryColor: '#FF0000',
    secondaryColor: '#FF6B00',
    accentColor: '#FFD700',
    backgroundColor: '#F9FAFB',
    textColor: '#1F2937',

    backgroundGradient: 'linear-gradient(135deg, #FF0000 0%, #FF6B00 100%)',
    cardGradient: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)',
    priceGradient: 'linear-gradient(135deg, #00CC44 0%, #00AA33 100%)',

    productShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
    cardShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',

    pattern: 'dots',
    patternOpacity: 0.3,

    categoryGradients: {
      drinks: 'linear-gradient(135deg, #0066FF 0%, #00E5FF 100%)',
      snacks: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)',
      candy: 'linear-gradient(135deg, #FF0066 0%, #FF99CC 100%)',
    },
  },

  // VARIANT 1: Neon Energy (Dark + Neon Glow)
  'neon-energy': {
    id: 'neon-energy',
    name: 'Neon Energy',
    description: 'Dark backgrounds with neon glow - perfect for chips, energy drinks, nightlife',
    icon: '⚡',

    primaryColor: '#00FFFF', // Cyan
    secondaryColor: '#FF00FF', // Magenta
    accentColor: '#00FF00', // Lime
    backgroundColor: '#0A0A0A',
    textColor: '#FFFFFF',

    backgroundGradient: 'linear-gradient(135deg, #0A0A0A 0%, #1A0033 100%)',
    cardGradient: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
    priceGradient: 'linear-gradient(135deg, #00FFFF 0%, #00FF00 100%)',

    productShadow: '0 10px 40px rgba(0, 255, 255, 0.4)',
    cardShadow: '0 4px 20px rgba(255, 0, 255, 0.3)',
    glowEffect: '0 0 20px rgba(0, 255, 255, 0.6)',

    pattern: 'grid',
    patternOpacity: 0.2,

    backgroundGif: '/themes/neon-sparkle.gif',
    gifAutoPlay: true,

    categoryGradients: {
      drinks: 'linear-gradient(135deg, #00FFFF 0%, #0099FF 100%)',
      snacks: 'linear-gradient(135deg, #FF00FF 0%, #FF0099 100%)',
      candy: 'linear-gradient(135deg, #00FF00 0%, #00FFFF 100%)',
    },
  },

  // VARIANT 2: Fresh Splash (Water Effects)
  'fresh-splash': {
    id: 'fresh-splash',
    name: 'Fresh Splash',
    description: 'Light & refreshing with water effects - perfect for beverages, juices',
    icon: '💧',

    primaryColor: '#00BFFF', // Deep Sky Blue
    secondaryColor: '#87CEEB', // Sky Blue
    accentColor: '#00CED1', // Dark Turquoise
    backgroundColor: '#F0F9FF',
    textColor: '#0C4A6E',

    backgroundGradient: 'linear-gradient(135deg, #E0F7FF 0%, #B3E5FC 100%)',
    cardGradient: 'linear-gradient(135deg, #B3E5FC 0%, #81D4FA 100%)',
    priceGradient: 'linear-gradient(135deg, #00BFFF 0%, #00CED1 100%)',

    productShadow: '0 10px 40px rgba(0, 191, 255, 0.3)',
    cardShadow: '0 4px 20px rgba(135, 206, 235, 0.2)',

    pattern: 'diagonal',
    patternOpacity: 0.15,

    backgroundGif: '/themes/water-splash.gif',
    gifAutoPlay: false, // Only on hover

    categoryGradients: {
      drinks: 'linear-gradient(135deg, #00BFFF 0%, #1E90FF 100%)',
      snacks: 'linear-gradient(135deg, #87CEEB 0%, #00CED1 100%)',
      candy: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)',
    },
  },

  // VARIANT 3: Luxury Gold (Premium)
  'luxury-gold': {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Premium gold frames with elegant design - high-margin products',
    icon: '👑',

    primaryColor: '#FFD700', // Gold
    secondaryColor: '#FFA500', // Orange Gold
    accentColor: '#DAA520', // Goldenrod
    backgroundColor: '#1A1A1A',
    textColor: '#F5F5DC',

    backgroundGradient: 'linear-gradient(135deg, #000000 0%, #1A1A1A 100%)',
    cardGradient: 'linear-gradient(135deg, #2C2416 0%, #3D3020 100%)',
    priceGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',

    productShadow: '0 10px 40px rgba(255, 215, 0, 0.4)',
    cardShadow: '0 4px 20px rgba(218, 165, 32, 0.3)',
    glowEffect: '0 0 30px rgba(255, 215, 0, 0.4)',

    pattern: 'diagonal',
    patternOpacity: 0.1,

    categoryGradients: {
      drinks: 'linear-gradient(135deg, #FFD700 0%, #CD853F 100%)',
      snacks: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
      candy: 'linear-gradient(135deg, #FFD700 0%, #F0E68C 100%)',
    },
  },
}

/**
 * Get theme by ID
 */
export function getTheme(themeId: ThemeVariant): ThemeDefinition {
  return THEME_VARIANTS[themeId] || THEME_VARIANTS['toy-store']
}

/**
 * Get category-specific gradient for a theme
 */
export function getCategoryGradientForTheme(
  themeId: ThemeVariant,
  categoryName?: string
): string {
  const theme = getTheme(themeId)

  if (!categoryName || !theme.categoryGradients) {
    return theme.cardGradient
  }

  const category = categoryName.toLowerCase()

  if (category.includes('drink') || category.includes('beverage') || category.includes('soda')) {
    return theme.categoryGradients.drinks || theme.cardGradient
  }

  if (category.includes('snack') || category.includes('chip')) {
    return theme.categoryGradients.snacks || theme.cardGradient
  }

  if (category.includes('candy') || category.includes('chocolate')) {
    return theme.categoryGradients.candy || theme.cardGradient
  }

  return theme.cardGradient
}

/**
 * Get all theme options for dropdown
 */
export function getThemeOptions(): Array<{ value: ThemeVariant; label: string; icon: string }> {
  return Object.values(THEME_VARIANTS).map((theme) => ({
    value: theme.id,
    label: theme.name,
    icon: theme.icon,
  }))
}

/**
 * Auto-match theme to category
 */
export function suggestThemeForCategory(categoryName?: string): ThemeVariant {
  if (!categoryName) return 'toy-store'

  const category = categoryName.toLowerCase()

  if (category.includes('drink') || category.includes('beverage') || category.includes('soda')) {
    return 'fresh-splash'
  }

  if (category.includes('chip') || category.includes('energy')) {
    return 'neon-energy'
  }

  if (category.includes('premium') || category.includes('luxury')) {
    return 'luxury-gold'
  }

  return 'toy-store'
}
