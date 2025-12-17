/**
 * Bundle Pricing
 *
 * Calculates bundle pricing, savings, and discount application.
 */

import type { UpsellRecipe } from '../cards/upsellRecipes';
import type { BundleProduct } from './bundleEngine';

// ============================================================================
// PRICING CALCULATION
// ============================================================================

export interface BundlePricing {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  savingsPercentage: number;
  discount: number;
  discountType: 'percentage' | 'fixed' | 'bogo';
  productPrices: Array<{
    productId: number;
    originalPrice: number;
    discountedPrice: number;
  }>;
}

/**
 * Calculates complete bundle pricing
 *
 * @param bundle - Upsell recipe with discount info
 * @param products - Products in bundle with prices
 * @returns Complete pricing breakdown
 */
export function calculateBundlePricing(
  bundle: UpsellRecipe,
  products: BundleProduct[]
): BundlePricing {
  const originalTotal = products.reduce((sum, p) => sum + p.price_case, 0);

  let discountedTotal = originalTotal;
  const productPrices = products.map((p) => ({
    productId: p.id,
    originalPrice: p.price_case,
    discountedPrice: p.price_case,
  }));

  // Apply discount based on type
  if (bundle.discountType === 'percentage' && bundle.discount) {
    const discountAmount = originalTotal * (bundle.discount / 100);
    discountedTotal = originalTotal - discountAmount;

    // Distribute discount proportionally
    productPrices.forEach((pp) => {
      const ratio = pp.originalPrice / originalTotal;
      pp.discountedPrice = pp.originalPrice - discountAmount * ratio;
    });
  } else if (bundle.discountType === 'fixed' && bundle.discount) {
    discountedTotal = Math.max(0, originalTotal - bundle.discount);

    // Distribute fixed discount proportionally
    productPrices.forEach((pp) => {
      const ratio = pp.originalPrice / originalTotal;
      pp.discountedPrice = Math.max(0, pp.originalPrice - bundle.discount! * ratio);
    });
  } else if (bundle.discountType === 'bogo') {
    // Buy one get one: 50% off total
    discountedTotal = originalTotal * 0.5;

    productPrices.forEach((pp) => {
      pp.discountedPrice = pp.originalPrice * 0.5;
    });
  }

  const savings = originalTotal - discountedTotal;
  const savingsPercentage = originalTotal > 0 ? (savings / originalTotal) * 100 : 0;

  return {
    originalTotal: round2(originalTotal),
    discountedTotal: round2(discountedTotal),
    savings: round2(savings),
    savingsPercentage: round2(savingsPercentage),
    discount: bundle.discount || 0,
    discountType: bundle.discountType,
    productPrices: productPrices.map((pp) => ({
      ...pp,
      originalPrice: round2(pp.originalPrice),
      discountedPrice: round2(pp.discountedPrice),
    })),
  };
}

function round2(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Calculates savings compared to individual purchase
 */
export function calculateSavings(
  bundlePrice: number,
  individualTotal: number
): { savings: number; percentage: number } {
  const savings = individualTotal - bundlePrice;
  const percentage = individualTotal > 0 ? (savings / individualTotal) * 100 : 0;

  return {
    savings: round2(savings),
    percentage: round2(percentage),
  };
}

/**
 * Formats bundle pricing for display
 */
export function formatBundlePrice(pricing: BundlePricing): {
  original: string;
  discounted: string;
  savings: string;
  badge: string;
} {
  return {
    original: `$${pricing.originalTotal.toFixed(2)}`,
    discounted: `$${pricing.discountedTotal.toFixed(2)}`,
    savings: `Save $${pricing.savings.toFixed(2)}`,
    badge: `${Math.round(pricing.savingsPercentage)}% OFF`,
  };
}
