/**
 * Promotional Content Generator
 * Generates promotional banners, discounts, and seasonal content
 */

import { getCurrentHolidayTheme, generateDiscountPercentage, getPromotionalText } from './utils/colorGenerator'

export interface PromoBanner {
  id: string
  title: string
  subtitle?: string
  discount: number
  discountText: string
  validFrom: string
  validTo: string
  theme: string
  backgroundColor: string
  textColor: string
  products?: any[]
  ctaText?: string
  ctaLink?: string
}

export interface PromotionalSection {
  type: 'discount-banner' | 'hero' | 'category-spotlight' | 'brand-showcase'
  data: any
  order: number
}

/**
 * Generate Black Friday promotional banners
 */
export function generateBlackFridayPromos(products: any[]): PromoBanner[] {
  const theme = getCurrentHolidayTheme()
  const discount = generateDiscountPercentage(30, 65)
  
  return [
    {
      id: 'black-friday-main',
      title: 'Black Friday Week is here!',
      subtitle: 'Shop up to 65% off!',
      discount,
      discountText: `Hasta ${discount}% Ahorro`,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      theme: 'black-friday',
      backgroundColor: theme.colors.primary,
      textColor: '#FFFFFF',
      products: products.slice(0, 8),
      ctaText: 'Shop Now',
      ctaLink: '/catalog',
    },
  ]
}

/**
 * Generate holiday promotional banners
 */
export function generateHolidayPromos(products: any[]): PromoBanner[] {
  const theme = getCurrentHolidayTheme()
  const discount = generateDiscountPercentage(20, 50)
  
  return [
    {
      id: 'holiday-main',
      title: getPromotionalText(),
      subtitle: `Save up to ${discount}% on selected items`,
      discount,
      discountText: `${discount}% OFF`,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      theme: theme.name,
      backgroundColor: theme.colors.primary,
      textColor: '#FFFFFF',
      products: products.filter(p => p.seasonal || p.featured).slice(0, 6),
      ctaText: 'Shop Holiday Deals',
      ctaLink: '/catalog?seasonal=true',
    },
  ]
}

/**
 * Calculate discount percentages for products
 * Returns products with discount fields added (non-destructive)
 */
export function calculateDiscounts(products: any[]): any[] {
  return products.map((product) => {
    const enhanced = { ...product }
    
    // If product has originalPrice, calculate discount
    if (product.originalPrice && product.price) {
      const original = Number(product.originalPrice)
      const current = Number(product.price)
      if (original > current) {
        const discount = Math.round(((original - current) / original) * 100)
        enhanced.discount = discount
        enhanced.discountText = `${discount}% OFF`
        enhanced.originalPrice = original
        return enhanced
      }
    }

    // For featured/trending products, add promotional discount
    if (product.featured || product.trending) {
      const discount = generateDiscountPercentage(15, 40)
      enhanced.discount = discount
      enhanced.discountText = `${discount}% OFF`
      enhanced.isPromotional = true
      return enhanced
    }

    return enhanced
  })
}

/**
 * Create promotional sections for layout
 */
export function createPromotionalSections(
  products: any[],
  categories: any[],
  brands: any[]
): PromotionalSection[] {
  const sections: PromotionalSection[] = []
  const theme = getCurrentHolidayTheme()

  // Main promotional banner
  if (theme.name === 'black-friday' || theme.name === 'christmas') {
    const promos = theme.name === 'black-friday'
      ? generateBlackFridayPromos(products)
      : generateHolidayPromos(products)
    
    sections.push({
      type: 'discount-banner',
      data: promos[0],
      order: 1,
    })
  }

  // Category spotlight
  if (categories.length > 0) {
    sections.push({
      type: 'category-spotlight',
      data: {
        title: 'Shop by Category',
        categories: categories.slice(0, 8),
      },
      order: 3,
    })
  }

  // Brand showcase
  if (brands.length > 0) {
    sections.push({
      type: 'brand-showcase',
      data: {
        title: 'Brands We Love',
        brands: brands.slice(0, 12),
      },
      order: 5,
    })
  }

  return sections.sort((a, b) => a.order - b.order)
}

