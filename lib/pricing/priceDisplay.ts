/**
 * PRICE DISPLAY UTILITIES
 * Handle competitive vs exclusive product pricing
 */

import type { PriceTier } from './tierCalculator'

export interface ProductPricing {
  basePrice: number
  isCompetitive: boolean
  isExclusive: boolean
  discountTier1?: number | null
  discountTier2?: number | null
  discountTier3?: number | null
  exclusiveDiscount?: number | null
}

export interface CalculatedPrice {
  originalPrice: number
  finalPrice: number
  discount: number
  discountPercent: number
  savings: number
  showOriginalPrice: boolean // Show strikethrough price
}

/**
 * Calculate final price for a customer's tier
 */
export function calculateTieredPrice(
  pricing: ProductPricing,
  customerTier: PriceTier
): CalculatedPrice {
  const basePrice = pricing.basePrice

  // Competitive products: Show tiered discount pricing
  if (pricing.isCompetitive) {
    let discountPercent = 0

    switch (customerTier) {
      case 1:
        discountPercent = Number(pricing.discountTier1 || 0)
        break
      case 2:
        discountPercent = Number(pricing.discountTier2 || 0)
        break
      case 3:
        discountPercent = Number(pricing.discountTier3 || 0)
        break
    }

    const discount = (basePrice * discountPercent) / 100
    const finalPrice = basePrice - discount

    return {
      originalPrice: basePrice,
      finalPrice,
      discount,
      discountPercent,
      savings: discount,
      showOriginalPrice: discount > 0,
    }
  }

  // Exclusive products: Show percentage discount only
  if (pricing.isExclusive) {
    const discountPercent = Number(pricing.exclusiveDiscount || 0)
    const discount = (basePrice * discountPercent) / 100
    const finalPrice = basePrice - discount

    return {
      originalPrice: basePrice,
      finalPrice,
      discount,
      discountPercent,
      savings: discount,
      showOriginalPrice: false, // Don't show original price for exclusive
    }
  }

  // Regular products: No discount
  return {
    originalPrice: basePrice,
    finalPrice: basePrice,
    discount: 0,
    discountPercent: 0,
    savings: 0,
    showOriginalPrice: false,
  }
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

/**
 * Format savings message
 */
export function formatSavings(savings: number, percent: number): string {
  if (savings === 0) return ''
  return `Save ${formatPrice(savings)} (${percent.toFixed(0)}%)`
}

/**
 * Get price display variant based on product type
 */
export function getPriceDisplayVariant(
  pricing: ProductPricing
): 'competitive' | 'exclusive' | 'regular' {
  if (pricing.isCompetitive) return 'competitive'
  if (pricing.isExclusive) return 'exclusive'
  return 'regular'
}

/**
 * Check if product has any tier discounts
 */
export function hasTierDiscounts(pricing: ProductPricing): boolean {
  if (pricing.isCompetitive) {
    return (
      (pricing.discountTier1 && pricing.discountTier1 > 0) ||
      (pricing.discountTier2 && pricing.discountTier2 > 0) ||
      (pricing.discountTier3 && pricing.discountTier3 > 0) ||
      false
    )
  }

  if (pricing.isExclusive) {
    return (pricing.exclusiveDiscount && pricing.exclusiveDiscount > 0) || false
  }

  return false
}
