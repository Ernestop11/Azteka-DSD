/**
 * TIER CALCULATOR
 * Calculate customer price tier based on average order value
 *
 * Tier 1 (Base): All customers default
 * Tier 2 (Volume): Average order > $2,000
 * Tier 3 (VIP): Average order > $3,500
 */

export type PriceTier = 1 | 2 | 3

export interface TierThresholds {
  tier2: number // Volume pricing threshold
  tier3: number // VIP pricing threshold
}

export const DEFAULT_TIER_THRESHOLDS: TierThresholds = {
  tier2: 2000, // $2,000
  tier3: 3500, // $3,500
}

/**
 * Calculate price tier based on average order value
 */
export function calculatePriceTier(
  averageOrderValue: number,
  thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS
): PriceTier {
  if (averageOrderValue >= thresholds.tier3) {
    return 3 // VIP
  }

  if (averageOrderValue >= thresholds.tier2) {
    return 2 // Volume
  }

  return 1 // Base
}

/**
 * Calculate average order value from order history
 */
export function calculateAverageOrderValue(orderTotals: number[]): number {
  if (orderTotals.length === 0) return 0

  const sum = orderTotals.reduce((acc, total) => acc + total, 0)
  return sum / orderTotals.length
}

/**
 * Get tier display information
 */
export function getTierInfo(tier: PriceTier) {
  switch (tier) {
    case 1:
      return {
        tier: 1,
        name: 'Base Price',
        color: '#FFFFFF',
        bgColor: '#F3F4F6',
        textColor: '#374151',
        icon: '⚪',
        description: 'Standard pricing for all customers',
      }
    case 2:
      return {
        tier: 2,
        name: 'Volume Pricing',
        color: '#C0C0C0',
        bgColor: '#E8E8E8',
        textColor: '#1F2937',
        icon: '🥈',
        description: 'Discounted pricing for volume orders ($2K+ avg)',
      }
    case 3:
      return {
        tier: 3,
        name: 'VIP Pricing',
        color: '#FFD700',
        bgColor: '#FEF3C7',
        textColor: '#92400E',
        icon: '🥇',
        description: 'Best pricing for our top customers ($3.5K+ avg)',
      }
    default:
      return getTierInfo(1)
  }
}

/**
 * Check if customer qualifies for tier upgrade
 */
export function checkTierUpgrade(
  currentTier: PriceTier,
  averageOrderValue: number,
  thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS
): { canUpgrade: boolean; nextTier?: PriceTier; amountNeeded?: number } {
  if (currentTier === 3) {
    return { canUpgrade: false }
  }

  if (currentTier === 1 && averageOrderValue < thresholds.tier2) {
    return {
      canUpgrade: true,
      nextTier: 2,
      amountNeeded: thresholds.tier2 - averageOrderValue,
    }
  }

  if (currentTier === 2 && averageOrderValue < thresholds.tier3) {
    return {
      canUpgrade: true,
      nextTier: 3,
      amountNeeded: thresholds.tier3 - averageOrderValue,
    }
  }

  return { canUpgrade: false }
}

/**
 * Format tier progress message
 */
export function getTierProgressMessage(
  tier: PriceTier,
  averageOrderValue: number,
  thresholds: TierThresholds = DEFAULT_TIER_THRESHOLDS
): string | null {
  const upgrade = checkTierUpgrade(tier, averageOrderValue, thresholds)

  if (!upgrade.canUpgrade || !upgrade.amountNeeded) {
    return null
  }

  const tierInfo = getTierInfo(upgrade.nextTier!)

  return `Spend $${upgrade.amountNeeded.toFixed(
    0
  )} more per order to unlock ${tierInfo.name}!`
}
