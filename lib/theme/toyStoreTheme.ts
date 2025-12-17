/**
 * TOY STORE THEME SYSTEM
 * Amazon + Temu + TikTok + Domino's UX
 *
 * Bold colors, strong shadows, products SHINE
 */

export const TOY_STORE_COLORS = {
  // Primary Bold Colors
  primary: {
    red: '#FF0000',
    orange: '#FF6B00',
    yellow: '#FFD700',
    blue: '#0066FF',
    green: '#00CC44',
  },

  // Background Colors
  background: {
    light: '#F9FAFB',
    pattern: '#FFF5F5',
    dark: '#1A1A1A',
  },

  // Price Tag Colors (Temu-style)
  price: {
    base: '#FF0000',
    discount: '#00CC44',
    tier1: '#FFFFFF',
    tier2: '#C0C0C0', // Silver
    tier3: '#FFD700', // Gold
  },

  // Badge Colors
  badge: {
    new: '#00CC44',
    hot: '#FF0000',
    sale: '#FF6B00',
    limited: '#9333EA',
    featured: '#FFD700',
  },
} as const

export const TOY_STORE_PATTERNS = {
  dots: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23FF6B00' fill-opacity='0.1'/%3E%3C/svg%3E")`,

  grid: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23FF0000' stroke-width='0.5' stroke-opacity='0.1'/%3E%3C/svg%3E")`,

  diagonal: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-10 10 L10 -10 M0 40 L40 0 M30 50 L50 30' stroke='%23FFD700' stroke-width='1' stroke-opacity='0.05'/%3E%3C/svg%3E")`,
} as const

export const TOY_STORE_GRADIENTS = {
  // Bold Amazon-style gradients
  redOrange: 'linear-gradient(135deg, #FF0000 0%, #FF6B00 100%)',
  orangeYellow: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)',
  blueGreen: 'linear-gradient(135deg, #0066FF 0%, #00CC44 100%)',

  // Category-specific gradients
  snacks: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)',
  drinks: 'linear-gradient(135deg, #0066FF 0%, #00E5FF 100%)',
  candy: 'linear-gradient(135deg, #FF0066 0%, #FF99CC 100%)',

  // Price tier gradients
  tier1: 'linear-gradient(135deg, #F3F4F6 0%, #FFFFFF 100%)',
  tier2: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 100%)',
  tier3: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
} as const

export const TOY_STORE_SHADOWS = {
  // Products SHINE - Strong shadows
  product: '0 10px 40px rgba(0, 0, 0, 0.25)',
  productHover: '0 20px 60px rgba(255, 107, 0, 0.4)',

  // Price tags pop
  priceTag: '0 4px 12px rgba(255, 0, 0, 0.3)',

  // Badges
  badge: '0 2px 8px rgba(0, 0, 0, 0.2)',

  // Card depth
  card: '0 4px 20px rgba(0, 0, 0, 0.1)',
  cardHover: '0 8px 30px rgba(0, 0, 0, 0.15)',
} as const

export const TOY_STORE_ANIMATIONS = {
  // Hover lift (like Amazon)
  cardLift: {
    initial: { y: 0, scale: 1 },
    hover: { y: -8, scale: 1.02 },
    tap: { scale: 0.98 },
  },

  // Price tag pop
  priceTagPop: {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
  },

  // Badge pulse
  badgePulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 2 },
    },
  },

  // Add to cart (Domino's style)
  addToCart: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
} as const

/**
 * Get background pattern style
 */
export function getToyStorePattern(pattern: 'dots' | 'grid' | 'diagonal' = 'dots') {
  return {
    backgroundImage: TOY_STORE_PATTERNS[pattern],
    backgroundSize: pattern === 'dots' ? '20px 20px' : '40px 40px',
    backgroundRepeat: 'repeat',
  }
}

/**
 * Get category-specific gradient
 */
export function getCategoryGradient(categoryName?: string) {
  if (!categoryName) return TOY_STORE_GRADIENTS.redOrange

  const category = categoryName.toLowerCase()

  if (category.includes('drink') || category.includes('beverage') || category.includes('soda')) {
    return TOY_STORE_GRADIENTS.drinks
  }

  if (category.includes('candy') || category.includes('chocolate')) {
    return TOY_STORE_GRADIENTS.candy
  }

  if (category.includes('snack') || category.includes('chip')) {
    return TOY_STORE_GRADIENTS.snacks
  }

  return TOY_STORE_GRADIENTS.redOrange
}

/**
 * Get price tier gradient
 */
export function getTierGradient(tier: 1 | 2 | 3) {
  switch (tier) {
    case 1:
      return TOY_STORE_GRADIENTS.tier1
    case 2:
      return TOY_STORE_GRADIENTS.tier2
    case 3:
      return TOY_STORE_GRADIENTS.tier3
    default:
      return TOY_STORE_GRADIENTS.tier1
  }
}

/**
 * Get tier badge color
 */
export function getTierBadgeColor(tier: 1 | 2 | 3) {
  switch (tier) {
    case 1:
      return TOY_STORE_COLORS.price.tier1
    case 2:
      return TOY_STORE_COLORS.price.tier2
    case 3:
      return TOY_STORE_COLORS.price.tier3
    default:
      return TOY_STORE_COLORS.price.tier1
  }
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: 1 | 2 | 3) {
  switch (tier) {
    case 1:
      return 'Base Price'
    case 2:
      return 'Volume Pricing'
    case 3:
      return 'VIP Pricing'
    default:
      return 'Base Price'
  }
}
