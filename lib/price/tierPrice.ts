/**
 * Tier Pricing Utilities
 * Strictly typed tier price calculations with fallbacks
 */

export type PriceTier = 'A' | 'B' | 'C'

export interface TierPricing {
  priceCase?: number | null
  priceUnit?: number | null
  priceTierA?: number | null
  priceTierB?: number | null
  priceTierC?: number | null
  unitsPerCase?: number
}

export interface TierPriceResult {
  price: number
  tier: PriceTier | null
  source: 'tierA' | 'tierB' | 'tierC' | 'priceCase' | 'priceUnit' | 'fallback'
}

/**
 * Get the effective price for a product based on active tier
 * 
 * Priority:
 * 1. priceTierA/B/C (if activeTier matches)
 * 2. priceCase
 * 3. priceUnit
 * 4. fallback to 0
 */
export function getTierPrice(
  pricing: TierPricing,
  activeTier: PriceTier | null = null
): TierPriceResult {
  // If active tier is specified, try tier-specific pricing first
  if (activeTier) {
    const tierKey = `priceTier${activeTier}` as keyof TierPricing
    const tierPrice = pricing[tierKey]
    
    if (tierPrice !== null && tierPrice !== undefined && typeof tierPrice === 'number' && tierPrice > 0) {
      return {
        price: tierPrice,
        tier: activeTier,
        source: tierKey as 'tierA' | 'tierB' | 'tierC',
      }
    }
  }

  // Fallback to priceCase
  if (pricing.priceCase !== null && pricing.priceCase !== undefined && pricing.priceCase > 0) {
    return {
      price: pricing.priceCase,
      tier: null,
      source: 'priceCase',
    }
  }

  // Fallback to priceUnit
  if (pricing.priceUnit !== null && pricing.priceUnit !== undefined && pricing.priceUnit > 0) {
    return {
      price: pricing.priceUnit,
      tier: null,
      source: 'priceUnit',
    }
  }

  // Final fallback
  return {
    price: 0,
    tier: null,
    source: 'fallback',
  }
}

/**
 * Calculate unit price from case price
 */
export function getUnitPrice(casePrice: number, unitsPerCase: number = 1): number {
  if (unitsPerCase <= 0) return casePrice
  return Number((casePrice / unitsPerCase).toFixed(2))
}

/**
 * Calculate case price from unit price
 */
export function getCasePrice(unitPrice: number, unitsPerCase: number = 1): number {
  return Number((unitPrice * unitsPerCase).toFixed(2))
}

/**
 * Get all available tier prices for a product
 */
export function getAllTierPrices(pricing: TierPricing): {
  tierA: number | null
  tierB: number | null
  tierC: number | null
  default: number
} {
  return {
    tierA: pricing.priceTierA !== null && pricing.priceTierA !== undefined ? pricing.priceTierA : null,
    tierB: pricing.priceTierB !== null && pricing.priceTierB !== undefined ? pricing.priceTierB : null,
    tierC: pricing.priceTierC !== null && pricing.priceTierC !== undefined ? pricing.priceTierC : null,
    default: pricing.priceCase || pricing.priceUnit || 0,
  }
}

