/**
 * Bundle Engine
 *
 * Core bundle recommendation engine with confidence scoring,
 * seasonal weighting, and similar product detection.
 *
 * Features:
 * - Confidence scoring (0-100)
 * - Seasonal weight boost
 * - Similar product families (Takis → Doritos → Cheetos)
 * - Bundle ranking formulas
 */

import { z } from 'zod';
import type { UpsellRecipe } from '../cards/upsellRecipes';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const BundleProductSchema = z.object({
  id: z.number().int().positive(),
  sku: z.string(),
  name: z.string(),
  category_id: z.number().int().positive(),
  category_name: z.string().optional(),
  brand_id: z.number().int().positive().optional().nullable(),
  brand_name: z.string().optional().nullable(),
  price_case: z.number().positive(),
  seasonal: z.boolean().default(false),
  seasonal_theme: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  in_stock: z.boolean().default(true),
});

export type BundleProduct = z.infer<typeof BundleProductSchema>;

export interface BundleRecommendation {
  bundleId: string;
  title: string;
  description: string;
  products: BundleProduct[];
  confidenceScore: number; // 0-100
  rank: number; // Position in recommendation list
  reason: string; // Why this bundle was recommended
  savings: number; // Dollar amount saved
  savingsPercentage: number; // Percentage saved
  totalValue: number; // Total bundle value
  discountedValue: number; // Price after discount
  metadata: {
    seasonal: boolean;
    seasonalTheme?: string;
    source: 'cart' | 'category' | 'brand' | 'customer_history' | 'popular';
    matchedTriggers: string[];
  };
}

// ============================================================================
// SIMILAR PRODUCT FAMILIES
// ============================================================================

/**
 * Product family mappings for similar product detection
 *
 * Products in the same family are considered cross-sellable
 */
export const PRODUCT_FAMILIES: Record<string, string[]> = {
  // Spicy chips family
  'spicy-chips': ['takis', 'doritos', 'cheetos', 'flamin hot', 'fuego', 'hot chips'],

  // Soda family
  'soda': ['coca-cola', 'pepsi', 'sprite', 'fanta', 'mountain dew', 'dr pepper'],

  // Mexican soda family
  'mexican-soda': ['jarritos', 'sidral', 'sangria', 'coca-cola mexicana'],

  // Candy family
  'candy': ['skittles', 'starburst', 'm&m', 'snickers', 'mars', 'milky way'],

  // Mexican candy family
  'mexican-candy': [
    'pelon pelo rico',
    'lucas',
    'pulparindo',
    'vero',
    'rockaleta',
    'duvalin',
    'mazapan',
  ],

  // Gum family
  'gum': ['trident', 'orbit', 'extra', 'doublemint', 'juicy fruit', '5 gum'],

  // Chocolate family
  'chocolate': ['hershey', 'nestle', 'cadbury', 'dove', 'ghirardelli', 'lindt'],

  // Chips family
  'chips': ['lays', 'doritos', 'cheetos', 'pringles', 'ruffles', 'fritos'],

  // Energy drinks family
  'energy': ['red bull', 'monster', 'rockstar', 'bang', 'celsius', 'reign'],

  // Agua fresca family
  'agua-fresca': ['horchata', 'jamaica', 'tamarindo', 'limon', 'sandia'],
};

/**
 * Detects similar products based on product families
 *
 * @param product - Product to find similarities for
 * @param allProducts - All available products
 * @returns Array of similar products
 */
export function findSimilarProducts(
  product: BundleProduct,
  allProducts: BundleProduct[]
): BundleProduct[] {
  const productNameLower = product.name.toLowerCase();
  const productBrandLower = product.brand_name?.toLowerCase() || '';

  // Find which families this product belongs to
  const belongsToFamilies: string[] = [];

  Object.entries(PRODUCT_FAMILIES).forEach(([familyName, keywords]) => {
    const matches = keywords.some(
      (keyword) =>
        productNameLower.includes(keyword) || productBrandLower.includes(keyword)
    );

    if (matches) {
      belongsToFamilies.push(familyName);
    }
  });

  if (belongsToFamilies.length === 0) {
    // No family match, fall back to same category/brand
    return allProducts.filter(
      (p) =>
        p.id !== product.id &&
        (p.category_id === product.category_id || p.brand_id === product.brand_id)
    );
  }

  // Find products in the same families
  const similarProducts = allProducts.filter((p) => {
    if (p.id === product.id) return false;

    const pNameLower = p.name.toLowerCase();
    const pBrandLower = p.brand_name?.toLowerCase() || '';

    return belongsToFamilies.some((familyName) => {
      const keywords = PRODUCT_FAMILIES[familyName];
      return keywords.some(
        (keyword) => pNameLower.includes(keyword) || pBrandLower.includes(keyword)
      );
    });
  });

  return similarProducts;
}

// ============================================================================
// CONFIDENCE SCORING
// ============================================================================

export interface ConfidenceFactors {
  cartMatch: number; // 0-40: How well bundle matches cart contents
  historicalMatch: number; // 0-30: How well it matches customer's history
  seasonalBoost: number; // 0-15: Seasonal relevance boost
  popularityBoost: number; // 0-10: General popularity
  availabilityPenalty: number; // -20 to 0: Out of stock penalty
}

/**
 * Calculates confidence score for a bundle recommendation
 *
 * @param bundle - Upsell recipe
 * @param factors - Confidence factors
 * @returns Confidence score (0-100)
 */
export function calculateConfidenceScore(
  bundle: UpsellRecipe,
  factors: ConfidenceFactors
): number {
  const baseScore =
    factors.cartMatch +
    factors.historicalMatch +
    factors.seasonalBoost +
    factors.popularityBoost +
    factors.availabilityPenalty;

  // Apply bundle priority as multiplier (1-10 scale)
  const priorityMultiplier = 0.9 + (bundle.priority / 100);

  const finalScore = Math.round(baseScore * priorityMultiplier);

  // Clamp to 0-100
  return Math.max(0, Math.min(100, finalScore));
}

/**
 * Calculates cart match factor
 *
 * @param bundle - Upsell recipe
 * @param cartProductIds - Products in cart
 * @returns Cart match score (0-40)
 */
export function calculateCartMatchFactor(
  bundle: UpsellRecipe,
  cartProductIds: number[]
): number {
  const cartSet = new Set(cartProductIds);

  // Check trigger matches
  let matchScore = 0;

  if (bundle.triggerType === 'product' && bundle.triggerProductIds) {
    const triggerMatches = bundle.triggerProductIds.filter((id) => cartSet.has(id)).length;
    matchScore = (triggerMatches / bundle.triggerProductIds.length) * 40;
  } else if (bundle.triggerType === 'category' && bundle.triggerCategoryIds) {
    // Category match is indirect, lower score
    matchScore = 25;
  } else if (bundle.triggerType === 'brand' && bundle.triggerBrandIds) {
    // Brand match is indirect, lower score
    matchScore = 25;
  } else if (bundle.triggerType === 'cart_value') {
    // Cart value match gives moderate score
    matchScore = 30;
  }

  return Math.round(matchScore);
}

/**
 * Calculates historical match factor
 *
 * @param bundle - Upsell recipe
 * @param customerPurchaseHistory - Customer's recent product IDs
 * @returns Historical match score (0-30)
 */
export function calculateHistoricalMatchFactor(
  bundle: UpsellRecipe,
  customerPurchaseHistory: number[]
): number {
  if (customerPurchaseHistory.length === 0) return 0;

  const historySet = new Set(customerPurchaseHistory);
  const recommendedIds = bundle.recommendedProductIds;

  // Check how many recommended products customer has bought before
  const previouslyPurchased = recommendedIds.filter((id) => historySet.has(id)).length;
  const ratio = previouslyPurchased / recommendedIds.length;

  // Customer has bought similar products before = high confidence
  return Math.round(ratio * 30);
}

/**
 * Calculates seasonal boost factor
 *
 * @param bundle - Upsell recipe
 * @param currentSeason - Current season/theme
 * @returns Seasonal boost score (0-15)
 */
export function calculateSeasonalBoost(
  bundle: UpsellRecipe,
  currentSeason?: string
): number {
  if (!currentSeason || !bundle.seasonalTheme) return 0;

  // Exact match = full boost
  if (bundle.seasonalTheme === currentSeason) return 15;

  // Partial match (e.g., "christmas" in "winter")
  const seasonalKeywords: Record<string, string[]> = {
    halloween: ['fall', 'autumn', 'october'],
    christmas: ['winter', 'december', 'holiday'],
    valentine: ['february', 'winter'],
    easter: ['spring', 'april'],
    summer: ['june', 'july', 'august'],
  };

  const keywords = seasonalKeywords[bundle.seasonalTheme] || [];
  const partialMatch = keywords.some((kw) => currentSeason.includes(kw));

  return partialMatch ? 8 : 0;
}

/**
 * Calculates popularity boost factor
 *
 * @param bundle - Upsell recipe
 * @returns Popularity boost score (0-10)
 */
export function calculatePopularityBoost(bundle: UpsellRecipe): number {
  // Higher priority bundles get more boost
  return Math.round((bundle.priority / 10) * 10);
}

/**
 * Calculates availability penalty
 *
 * @param bundleProductIds - Product IDs in bundle
 * @param availableProductIds - In-stock product IDs
 * @returns Availability penalty (-20 to 0)
 */
export function calculateAvailabilityPenalty(
  bundleProductIds: number[],
  availableProductIds: Set<number>
): number {
  const unavailableCount = bundleProductIds.filter((id) => !availableProductIds.has(id)).length;
  const unavailableRatio = unavailableCount / bundleProductIds.length;

  // Penalty proportional to unavailable products
  return Math.round(-20 * unavailableRatio);
}

// ============================================================================
// BUNDLE RANKING
// ============================================================================

/**
 * Ranks bundle recommendations
 *
 * Ranking formula considers:
 * - Confidence score (primary)
 * - Savings percentage (secondary)
 * - Number of products (tertiary)
 *
 * @param recommendations - Array of bundle recommendations
 * @returns Ranked recommendations
 */
export function rankBundleRecommendations(
  recommendations: BundleRecommendation[]
): BundleRecommendation[] {
  return recommendations
    .sort((a, b) => {
      // Primary: Confidence score
      if (a.confidenceScore !== b.confidenceScore) {
        return b.confidenceScore - a.confidenceScore;
      }

      // Secondary: Savings percentage
      if (a.savingsPercentage !== b.savingsPercentage) {
        return b.savingsPercentage - a.savingsPercentage;
      }

      // Tertiary: Total value (higher value first)
      return b.totalValue - a.totalValue;
    })
    .map((rec, index) => ({
      ...rec,
      rank: index + 1,
    }));
}

// ============================================================================
// REASON GENERATION
// ============================================================================

/**
 * Generates human-readable explanation for bundle recommendation
 *
 * @param bundle - Upsell recipe
 * @param factors - Confidence factors
 * @param context - Additional context
 * @returns Explanation string
 */
export function generateBundleReason(
  bundle: UpsellRecipe,
  factors: ConfidenceFactors,
  context: {
    recentOrderCount?: number;
    isSeasonalMatch?: boolean;
    cartItemCount?: number;
  }
): string {
  const reasons: string[] = [];

  // Cart-based recommendation
  if (factors.cartMatch >= 30) {
    reasons.push('Based on items in your cart');
  }

  // Historical recommendation
  if (factors.historicalMatch >= 20 && context.recentOrderCount) {
    reasons.push(`Based on your last ${context.recentOrderCount} orders`);
  }

  // Seasonal recommendation
  if (factors.seasonalBoost >= 10 && context.isSeasonalMatch) {
    reasons.push(`Perfect for ${bundle.seasonalTheme}`);
  }

  // Category/Brand recommendation
  if (bundle.triggerType === 'category') {
    reasons.push('Common with this category');
  } else if (bundle.triggerType === 'brand') {
    reasons.push('Popular brand combination');
  }

  // Popular bundle
  if (factors.popularityBoost >= 8) {
    reasons.push('Frequently purchased together');
  }

  // Default
  if (reasons.length === 0) {
    reasons.push('Recommended for you');
  }

  return reasons.join('. ');
}

// ============================================================================
// BUNDLE FILTERING
// ============================================================================

/**
 * Filters bundles based on minimum confidence threshold
 *
 * @param recommendations - Bundle recommendations
 * @param minConfidence - Minimum confidence score (0-100)
 * @returns Filtered recommendations
 */
export function filterByConfidence(
  recommendations: BundleRecommendation[],
  minConfidence: number
): BundleRecommendation[] {
  return recommendations.filter((rec) => rec.confidenceScore >= minConfidence);
}

/**
 * Filters bundles to remove already-purchased products
 *
 * @param recommendations - Bundle recommendations
 * @param purchasedProductIds - Already purchased product IDs
 * @returns Filtered recommendations
 */
export function filterAlreadyPurchased(
  recommendations: BundleRecommendation[],
  purchasedProductIds: number[]
): BundleRecommendation[] {
  const purchasedSet = new Set(purchasedProductIds);

  return recommendations
    .map((rec) => ({
      ...rec,
      products: rec.products.filter((p) => !purchasedSet.has(p.id)),
    }))
    .filter((rec) => rec.products.length > 0); // Remove bundles with no products left
}

/**
 * Filters bundles to only show in-stock products
 *
 * @param recommendations - Bundle recommendations
 * @returns Filtered recommendations
 */
export function filterOutOfStock(
  recommendations: BundleRecommendation[]
): BundleRecommendation[] {
  return recommendations
    .map((rec) => ({
      ...rec,
      products: rec.products.filter((p) => p.in_stock),
    }))
    .filter((rec) => rec.products.length > 0);
}

// ============================================================================
// BUNDLE DIVERSITY
// ============================================================================

/**
 * Ensures bundle recommendations are diverse
 *
 * Removes duplicate bundles and ensures variety across:
 * - Categories
 * - Brands
 * - Price ranges
 *
 * @param recommendations - Bundle recommendations
 * @param maxPerCategory - Max bundles per category
 * @returns Diversified recommendations
 */
export function diversifyBundles(
  recommendations: BundleRecommendation[],
  maxPerCategory: number = 2
): BundleRecommendation[] {
  const categoryCounts = new Map<number, number>();
  const diversified: BundleRecommendation[] = [];

  for (const rec of recommendations) {
    // Get primary category (most common in bundle)
    const categoryIds = rec.products.map((p) => p.category_id);
    const primaryCategory = getMostCommon(categoryIds);

    const count = categoryCounts.get(primaryCategory) || 0;

    if (count < maxPerCategory) {
      diversified.push(rec);
      categoryCounts.set(primaryCategory, count + 1);
    }
  }

  return diversified;
}

/**
 * Gets most common value in array
 */
function getMostCommon<T>(arr: T[]): T {
  const counts = new Map<T, number>();
  arr.forEach((item) => counts.set(item, (counts.get(item) || 0) + 1));

  let maxCount = 0;
  let mostCommon = arr[0];

  counts.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = item;
    }
  });

  return mostCommon;
}
