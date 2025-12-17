/**
 * Bundles Module - Barrel Exports
 *
 * Clean imports for all bundle and upsell functionality.
 *
 * Usage:
 * ```typescript
 * import { matchBundlesToContext, calculateBundlePricing, generateBundleMetadata } from '@/lib/bundles';
 * ```
 */

// Bundle Engine
export {
  findSimilarProducts,
  calculateConfidenceScore,
  calculateCartMatchFactor,
  calculateHistoricalMatchFactor,
  calculateSeasonalBoost,
  calculatePopularityBoost,
  calculateAvailabilityPenalty,
  rankBundleRecommendations,
  generateBundleReason,
  filterByConfidence,
  filterAlreadyPurchased,
  filterOutOfStock,
  diversifyBundles,
  type BundleProduct,
  type BundleRecommendation,
  type ConfidenceFactors,
  BundleProductSchema,
  PRODUCT_FAMILIES,
} from './bundleEngine';

// Bundle Matching
export {
  matchBundlesToContext,
  isBundleApplicable,
  calculateBundleFactors,
  rankBundleMatches,
  getTopBundleMatches,
  type BundleMatchContext,
  type BundleMatch,
} from './bundleMatching';

// Bundle Pricing
export {
  calculateBundlePricing,
  calculateSavings,
  formatBundlePrice,
  type BundlePricing,
} from './bundlePricing';

// Bundle Metadata
export {
  generateBundleMetadata,
  generateExplanation,
  type BundleMetadata,
} from './bundleMetadata';
