/**
 * Price Tier Utility
 * Determines product price tier based on price ranges
 */

export type PriceTier = 'A' | 'B' | 'C'

export function getPriceTier(price: number): PriceTier {
  if (price >= 50) return 'A' // Premium
  if (price >= 20) return 'B' // Standard
  return 'C' // Value
}

export function getTierCounts(products: Array<{ price: number | string }>): {
  A: number
  B: number
  C: number
} {
  const counts = { A: 0, B: 0, C: 0 }
  products.forEach((product) => {
    const tier = getPriceTier(Number(product.price))
    counts[tier]++
  })
  return counts
}

