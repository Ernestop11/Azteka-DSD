/**
 * Color Generator Utility
 * Auto-generates vibrant colors, holiday palettes, and gradients for products
 */

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface HolidayTheme {
  name: string
  colors: ColorPalette
  gradient: string
  badgeColor: string
}

/**
 * Generate vibrant color based on product index
 * Creates a consistent color scheme for each product
 */
export function generateProductColor(index: number): string {
  const vibrantColors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Orange
    '#52BE80', // Green
    '#E74C3C', // Bright Red
    '#3498DB', // Bright Blue
    '#9B59B6', // Purple
    '#1ABC9C', // Turquoise
    '#F39C12', // Orange
    '#E67E22', // Dark Orange
    '#16A085', // Green
    '#27AE60', // Emerald
    '#2980B9', // Blue
    '#8E44AD', // Purple
  ]
  return vibrantColors[index % vibrantColors.length]
}

/**
 * Generate gradient for product based on index
 */
export function generateProductGradient(index: number): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
    'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    'linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)',
    'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
    'linear-gradient(135deg, #3f4c6b 0%, #606c88 100%)',
    'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
  ]
  return gradients[index % gradients.length]
}

/**
 * Get holiday theme based on current date
 */
export function getCurrentHolidayTheme(): HolidayTheme {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  // Black Friday (November, last Friday)
  if (month === 11) {
    const lastFriday = getLastFridayOfNovember(now.getFullYear())
    if (day >= lastFriday - 3 && day <= lastFriday + 3) {
      return {
        name: 'black-friday',
        colors: {
          primary: '#DC2626', // Red
          secondary: '#FCD34D', // Yellow
          accent: '#F59E0B', // Amber
          background: '#FEF2F2', // Light red
          text: '#1F2937', // Dark gray
        },
        gradient: 'linear-gradient(135deg, #DC2626 0%, #FCD34D 50%, #DC2626 100%)',
        badgeColor: '#DC2626',
      }
    }
  }

  // Christmas (December)
  if (month === 12) {
    return {
      name: 'christmas',
      colors: {
        primary: '#DC2626', // Red
        secondary: '#16A34A', // Green
        accent: '#FCD34D', // Gold
        background: '#FEF2F2', // Light red
        text: '#1F2937',
      },
      gradient: 'linear-gradient(135deg, #DC2626 0%, #16A34A 100%)',
      badgeColor: '#DC2626',
    }
  }

  // Summer (June-August)
  if (month >= 6 && month <= 8) {
    return {
      name: 'summer',
      colors: {
        primary: '#0EA5E9', // Sky blue
        secondary: '#F59E0B', // Amber
        accent: '#10B981', // Green
        background: '#E0F2FE', // Light blue
        text: '#1F2937',
      },
      gradient: 'linear-gradient(135deg, #0EA5E9 0%, #10B981 100%)',
      badgeColor: '#0EA5E9',
    }
  }

  // Default (no specific holiday)
  return {
    name: 'default',
    colors: {
      primary: '#3B82F6', // Blue
      secondary: '#8B5CF6', // Purple
      accent: '#EC4899', // Pink
      background: '#F3F4F6', // Gray
      text: '#1F2937',
    },
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    badgeColor: '#3B82F6',
  }
}

/**
 * Get last Friday of November for Black Friday calculation
 */
function getLastFridayOfNovember(year: number): number {
  const nov30 = new Date(year, 10, 30) // November 30
  const dayOfWeek = nov30.getDay() // 0 = Sunday, 5 = Friday
  const daysToSubtract = (dayOfWeek + 2) % 7 // Days to subtract to get to Friday
  return 30 - daysToSubtract
}

/**
 * Apply seasonal theme to product
 * Auto-assigns colors and themes based on product index and current season
 */
export function applySeasonalTheme(product: any, index: number): {
  backgroundColor?: string
  backgroundGradient?: string
  theme?: string
  badge?: string
} {
  const holidayTheme = getCurrentHolidayTheme()
  
  // If product already has colors, use them
  if (product.backgroundColor || product.backgroundGradient) {
    return {
      backgroundColor: product.backgroundColor,
      backgroundGradient: product.backgroundGradient,
      theme: product.theme || holidayTheme.name,
    }
  }

  // Auto-assign based on product properties
  if (product.featured) {
    return {
      backgroundGradient: generateProductGradient(index),
      theme: holidayTheme.name,
      badge: 'NEW',
    }
  }

  if (product.trending) {
    return {
      backgroundGradient: generateProductGradient(index + 10),
      theme: holidayTheme.name,
      badge: 'HOT',
    }
  }

  if (product.seasonal) {
    return {
      backgroundGradient: holidayTheme.gradient,
      theme: holidayTheme.name,
      badge: 'LIMITED',
    }
  }

  // Default: assign vibrant color
  return {
    backgroundColor: generateProductColor(index),
    theme: holidayTheme.name,
  }
}

/**
 * Generate discount percentage (for promotional banners)
 */
export function generateDiscountPercentage(min: number = 20, max: number = 65): number {
  const discounts = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65]
  return discounts[Math.floor(Math.random() * discounts.length)]
}

/**
 * Get promotional text based on holiday
 */
export function getPromotionalText(): string {
  const theme = getCurrentHolidayTheme()
  
  switch (theme.name) {
    case 'black-friday':
      return 'Black Friday Week is here!'
    case 'christmas':
      return 'Happy Holidays!'
    case 'summer':
      return 'Summer Favorites'
    default:
      return 'Special Offers'
  }
}

