/**
 * Bundle Matching
 *
 * Matches upsell bundles to customer cart and purchase history.
 * Determines which bundles are applicable and calculates match confidence.
 */

import type { UpsellRecipe } from '../cards/upsellRecipes';
import type { BundleProduct } from './bundleEngine';
import {
  calculateCartMatchFactor,
  calculateHistoricalMatchFactor,
  calculateSeasonalBoost,
  calculatePopularityBoost,
  calculateAvailabilityPenalty,
  calculateConfidenceScore,
  type ConfidenceFactors,
} from './bundleEngine';

// ============================================================================
// MATCH CONTEXT
// ============================================================================

export interface BundleMatchContext {
  cartProductIds: number[];
  cartCategoryIds: number[];
  cartBrandIds: number[];
  cartTotalValue: number;
  customerPurchaseHistory: number[];
  currentSeason?: string;
  availableProductIds: Set<number>;
}

export interface BundleMatch {
  bundle: UpsellRecipe;
  matched: boolean;
  confidenceScore: number;
  factors: ConfidenceFactors;
  reason: string;
}

// ============================================================================
// BUNDLE MATCHING ENGINE
// ============================================================================

/**
 * Finds all bundles that match the current context
 *
 * @param bundles - All available upsell recipes
 * @param context - Matching context
 * @returns Matched bundles with confidence scores
 */
export function matchBundlesToContext(
  bundles: UpsellRecipe[],
  context: BundleMatchContext
): BundleMatch[] {
  return bundles
    .filter((bundle) => bundle.enabled)
    .map((bundle) => {
      const matched = isBundleApplicable(bundle, context);

      if (!matched) {
        return {
          bundle,
          matched: false,
          confidenceScore: 0,
          factors: {
            cartMatch: 0,
            historicalMatch: 0,
            seasonalBoost: 0,
            popularityBoost: 0,
            availabilityPenalty: 0,
          },
          reason: 'Not applicable',
        };
      }

      const factors = calculateBundleFactors(bundle, context);
      const confidenceScore = calculateConfidenceScore(bundle, factors);
      const reason = generateMatchReason(bundle, factors, context);

      return {
        bundle,
        matched: true,
        confidenceScore,
        factors,
        reason,
      };
    })
    .filter((match) => match.matched);
}

/**
 * Checks if bundle is applicable to current context
 *
 * @param bundle - Upsell recipe
 * @param context - Matching context
 * @returns True if bundle matches triggers
 */
export function isBundleApplicable(
  bundle: UpsellRecipe,
  context: BundleMatchContext
): boolean {
  // Check seasonal constraint
  if (bundle.seasonalTheme && context.currentSeason !== bundle.seasonalTheme) {
    // Allow bundles to show 2 weeks before season
    const isPreSeason = false; // TODO: Implement date-based pre-season logic
    if (!isPreSeason) return false;
  }

  // Check trigger type
  switch (bundle.triggerType) {
    case 'product':
      return bundle.triggerProductIds?.some((id) => context.cartProductIds.includes(id)) || false;

    case 'category':
      return bundle.triggerCategoryIds?.some((id) => context.cartCategoryIds.includes(id)) || false;

    case 'brand':
      return bundle.triggerBrandIds?.some((id) => context.cartBrandIds.includes(id)) || false;

    case 'cart_value':
      return context.cartTotalValue >= (bundle.triggerCartValueMin || 0);

    default:
      return false;
  }
}

/**
 * Calculates all confidence factors for a bundle
 *
 * @param bundle - Upsell recipe
 * @param context - Matching context
 * @returns Confidence factors
 */
export function calculateBundleFactors(
  bundle: UpsellRecipe,
  context: BundleMatchContext
): ConfidenceFactors {
  return {
    cartMatch: calculateCartMatchFactor(bundle, context.cartProductIds),
    historicalMatch: calculateHistoricalMatchFactor(bundle, context.customerPurchaseHistory),
    seasonalBoost: calculateSeasonalBoost(bundle, context.currentSeason),
    popularityBoost: calculatePopularityBoost(bundle),
    availabilityPenalty: calculateAvailabilityPenalty(
      bundle.recommendedProductIds,
      context.availableProductIds
    ),
  };
}

/**
 * Generates match reason text
 */
function generateMatchReason(
  bundle: UpsellRecipe,
  factors: ConfidenceFactors,
  context: BundleMatchContext
): string {
  const reasons: string[] = [];

  if (factors.cartMatch >= 30) reasons.push('Based on cart items');
  if (factors.historicalMatch >= 20) reasons.push('Based on purchase history');
  if (factors.seasonalBoost >= 10) reasons.push(`Perfect for ${bundle.seasonalTheme}`);
  if (factors.popularityBoost >= 8) reasons.push('Popular combination');

  return reasons.join('. ') || 'Recommended for you';
}

// ============================================================================
// BUNDLE RANKING
// ============================================================================

/**
 * Ranks matched bundles by confidence score
 *
 * @param matches - Bundle matches
 * @returns Ranked matches
 */
export function rankBundleMatches(matches: BundleMatch[]): BundleMatch[] {
  return [...matches].sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Gets top N bundle matches
 *
 * @param matches - Bundle matches
 * @param limit - Maximum number to return
 * @returns Top matches
 */
export function getTopBundleMatches(matches: BundleMatch[], limit: number): BundleMatch[] {
  return rankBundleMatches(matches).slice(0, limit);
}
