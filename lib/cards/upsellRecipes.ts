/**
 * Upsell Bundle Recipes
 *
 * 15 pre-configured upsell recipes for automatic recommendations.
 *
 * Recipe types:
 * - Brand Bundles: Cross-sell products from same brand
 * - Category Bundles: Complementary products from related categories
 * - Flavor Bundles: Similar flavor profiles
 *
 * Format optimized for API usage and frontend rendering.
 */

import { z } from 'zod';

// ============================================================================
// UPSELL RECIPE SCHEMA
// ============================================================================

export const UpsellRecipeSchema = z.object({
  bundleId: z.string(),
  title: z.string(),
  description: z.string(),

  // Trigger configuration
  triggerType: z.enum(['product', 'category', 'brand', 'cart_value']),
  triggerProductIds: z.array(z.number().int().positive()).optional(),
  triggerCategoryIds: z.array(z.number().int().positive()).optional(),
  triggerBrandIds: z.array(z.number().int().positive()).optional(),
  triggerCartValueMin: z.number().positive().optional(),

  // Recommendations
  recommendedProductIds: z.array(z.number().int().positive()),

  // Discount & pricing
  discount: z.number().min(0).max(100).optional(), // Percentage discount
  discountType: z.enum(['percentage', 'fixed', 'bogo']).default('percentage'),

  // Visual preset
  visualPresetId: z.string().optional(),
  badgeText: z.string().optional(), // e.g., "Bundle Deal", "Save 15%"
  badgeColor: z.string().optional(),

  // Metadata
  priority: z.number().int().min(1).max(10).default(5),
  enabled: z.boolean().default(true),
  seasonalTheme: z.string().optional(),
});

export type UpsellRecipe = z.infer<typeof UpsellRecipeSchema>;

// ============================================================================
// UPSELL BUNDLE RECIPES (15 RECIPES)
// ============================================================================

export const UPSELL_RECIPES: UpsellRecipe[] = [
  // ===== BRAND BUNDLES =====
  {
    bundleId: 'coca-cola-family',
    title: 'Coca-Cola Family Pack',
    description: 'Complete your Coca-Cola order with the full family of flavors',
    triggerType: 'brand',
    triggerBrandIds: [1], // Coca-Cola brand ID
    recommendedProductIds: [101, 102, 103, 104], // Coke, Diet Coke, Coke Zero, Sprite
    discount: 10,
    discountType: 'percentage',
    visualPresetId: 'steel-gray',
    badgeText: 'Brand Bundle',
    badgeColor: '#dc2626',
    priority: 8,
    enabled: true,
  },
  {
    bundleId: 'takis-variety',
    title: 'Takis Flavor Explosion',
    description: 'Mix and match Takis flavors for maximum variety',
    triggerType: 'brand',
    triggerBrandIds: [5], // Takis brand ID
    recommendedProductIds: [201, 202, 203, 204, 205], // Fuego, Nitro, Blue Heat, Crunchy Fajitas, Zombie
    discount: 15,
    discountType: 'percentage',
    visualPresetId: 'sunset-glow',
    badgeText: 'Save 15%',
    badgeColor: '#dc2626',
    priority: 9,
    enabled: true,
  },
  {
    bundleId: 'jarritos-rainbow',
    title: 'Jarritos Rainbow Collection',
    description: 'All your favorite Jarritos flavors in one bundle',
    triggerType: 'brand',
    triggerBrandIds: [3], // Jarritos brand ID
    recommendedProductIds: [301, 302, 303, 304, 305, 306], // Tamarind, Lime, Pineapple, Mandarin, Grapefruit, Strawberry
    discount: 12,
    discountType: 'percentage',
    visualPresetId: 'citrus-splash',
    badgeText: 'Rainbow Deal',
    badgeColor: '#f97316',
    priority: 8,
    enabled: true,
  },

  // ===== CATEGORY BUNDLES =====
  {
    bundleId: 'candy-beverage-combo',
    title: 'Sweet & Refreshing Combo',
    description: 'Perfect pairing of candy and cold drinks',
    triggerType: 'category',
    triggerCategoryIds: [10], // Candy category
    recommendedProductIds: [401, 402, 403], // Popular sodas
    discount: 8,
    discountType: 'percentage',
    visualPresetId: 'candy-dream',
    badgeText: 'Perfect Pair',
    badgeColor: '#ec4899',
    priority: 7,
    enabled: true,
  },
  {
    bundleId: 'chips-dip-duo',
    title: 'Chips & Dip Duo',
    description: 'Complete the snack experience with complementary dips',
    triggerType: 'category',
    triggerCategoryIds: [15], // Chips category
    recommendedProductIds: [501, 502, 503], // Salsa, Queso, Guacamole
    discount: 10,
    discountType: 'percentage',
    visualPresetId: 'sunset-glow',
    badgeText: 'Snack Bundle',
    badgeColor: '#f59e0b',
    priority: 7,
    enabled: true,
  },
  {
    bundleId: 'ice-cream-toppings',
    title: 'Ice Cream Sundae Kit',
    description: 'Everything you need for the perfect sundae',
    triggerType: 'category',
    triggerCategoryIds: [20], // Ice cream category
    recommendedProductIds: [601, 602, 603, 604], // Chocolate syrup, sprinkles, cherries, cones
    discount: 15,
    discountType: 'percentage',
    visualPresetId: 'arctic-blue',
    badgeText: 'Sundae Kit',
    badgeColor: '#06b6d4',
    priority: 6,
    enabled: true,
    seasonalTheme: 'summer',
  },
  {
    bundleId: 'gum-mints-combo',
    title: 'Fresh Breath Essentials',
    description: 'Stock up on gum and mints together',
    triggerType: 'category',
    triggerCategoryIds: [25], // Gum category
    recommendedProductIds: [701, 702, 703], // Mints and breath fresheners
    discount: 10,
    discountType: 'percentage',
    visualPresetId: 'mint-grove',
    badgeText: 'Fresh Bundle',
    badgeColor: '#10b981',
    priority: 5,
    enabled: true,
  },

  // ===== FLAVOR BUNDLES =====
  {
    bundleId: 'citrus-fiesta',
    title: 'Citrus Fiesta',
    description: 'All your favorite citrus flavors in one bundle',
    triggerType: 'product',
    triggerProductIds: [801, 802], // Lemon/lime sodas
    recommendedProductIds: [803, 804, 805, 806], // Orange soda, grapefruit, lemonade, lime chips
    discount: 12,
    discountType: 'percentage',
    visualPresetId: 'sunshine',
    badgeText: 'Citrus Pack',
    badgeColor: '#fbbf24',
    priority: 7,
    enabled: true,
    seasonalTheme: 'summer',
  },
  {
    bundleId: 'berry-blast',
    title: 'Berry Blast Collection',
    description: 'Berry-flavored favorites across categories',
    triggerType: 'product',
    triggerProductIds: [901, 902], // Strawberry/raspberry products
    recommendedProductIds: [903, 904, 905], // Mixed berry items
    discount: 10,
    discountType: 'percentage',
    visualPresetId: 'berry-bliss',
    badgeText: 'Berry Bundle',
    badgeColor: '#a855f7',
    priority: 6,
    enabled: true,
  },
  {
    bundleId: 'spicy-lovers',
    title: 'Spicy Lovers Pack',
    description: 'For customers who love the heat',
    triggerType: 'product',
    triggerProductIds: [1001, 1002, 1003], // Spicy chips, hot candy
    recommendedProductIds: [1004, 1005, 1006, 1007], // More spicy snacks, chamoy
    discount: 15,
    discountType: 'percentage',
    visualPresetId: 'sunset-glow',
    badgeText: 'Fuego Bundle',
    badgeColor: '#dc2626',
    priority: 9,
    enabled: true,
  },
  {
    bundleId: 'tropical-paradise',
    title: 'Tropical Paradise',
    description: 'Escape to the tropics with these exotic flavors',
    triggerType: 'product',
    triggerProductIds: [1101, 1102], // Pineapple, coconut products
    recommendedProductIds: [1103, 1104, 1105], // Mango, passion fruit, tropical mix
    discount: 12,
    discountType: 'percentage',
    visualPresetId: 'tropical-sea',
    badgeText: 'Tropical Deal',
    badgeColor: '#06b6d4',
    priority: 7,
    enabled: true,
    seasonalTheme: 'summer',
  },

  // ===== SEASONAL BUNDLES =====
  {
    bundleId: 'halloween-candy-haul',
    title: 'Halloween Candy Haul',
    description: 'Stock up on Halloween favorites',
    triggerType: 'cart_value',
    triggerCartValueMin: 100,
    recommendedProductIds: [1201, 1202, 1203, 1204, 1205], // Halloween candy variety
    discount: 20,
    discountType: 'percentage',
    visualPresetId: 'candy-dream',
    badgeText: 'Halloween Special',
    badgeColor: '#f97316',
    priority: 10,
    enabled: true,
    seasonalTheme: 'halloween',
  },
  {
    bundleId: 'dia-muertos-dulces',
    title: 'Día de Muertos Dulces',
    description: 'Traditional sweets for Día de Muertos celebration',
    triggerType: 'cart_value',
    triggerCartValueMin: 75,
    recommendedProductIds: [1301, 1302, 1303, 1304], // Traditional Mexican candy
    discount: 15,
    discountType: 'percentage',
    visualPresetId: 'candy-dream',
    badgeText: 'Día de Muertos',
    badgeColor: '#ec4899',
    priority: 10,
    enabled: true,
    seasonalTheme: 'dia-de-muertos',
  },
  {
    bundleId: 'summer-coolers',
    title: 'Summer Coolers Pack',
    description: 'Beat the heat with refreshing beverages and frozen treats',
    triggerType: 'cart_value',
    triggerCartValueMin: 50,
    recommendedProductIds: [1401, 1402, 1403, 1404, 1405], // Cold beverages, paletas
    discount: 10,
    discountType: 'percentage',
    visualPresetId: 'coastal-mist',
    badgeText: 'Summer Deal',
    badgeColor: '#06b6d4',
    priority: 8,
    enabled: true,
    seasonalTheme: 'summer',
  },
  {
    bundleId: 'valentine-sweets',
    title: 'Valentine Sweets Collection',
    description: 'Sweet treats perfect for Valentine\'s Day',
    triggerType: 'cart_value',
    triggerCartValueMin: 60,
    recommendedProductIds: [1501, 1502, 1503], // Heart-shaped candy, chocolates
    discount: 15,
    discountType: 'percentage',
    visualPresetId: 'rose-garden',
    badgeText: 'Love Bundle',
    badgeColor: '#ec4899',
    priority: 9,
    enabled: true,
    seasonalTheme: 'valentine',
  },
];

// ============================================================================
// UPSELL MATCHING LOGIC
// ============================================================================

export interface UpsellMatchInput {
  cartProductIds: number[];
  cartCategoryIds: number[];
  cartBrandIds: number[];
  cartTotalValue: number;
  currentSeason?: string;
}

/**
 * Finds applicable upsell recipes based on current cart state
 *
 * @param input - Current cart state
 * @returns Matching upsell recipes sorted by priority
 */
export function findApplicableUpsells(input: UpsellMatchInput): UpsellRecipe[] {
  const { cartProductIds, cartCategoryIds, cartBrandIds, cartTotalValue, currentSeason } = input;

  const matches: UpsellRecipe[] = [];

  for (const recipe of UPSELL_RECIPES) {
    if (!recipe.enabled) continue;

    // Skip if seasonal and not current season
    if (recipe.seasonalTheme && recipe.seasonalTheme !== currentSeason) {
      continue;
    }

    let isMatch = false;

    // Check product trigger
    if (recipe.triggerType === 'product' && recipe.triggerProductIds) {
      isMatch = recipe.triggerProductIds.some((id) => cartProductIds.includes(id));
    }

    // Check category trigger
    if (recipe.triggerType === 'category' && recipe.triggerCategoryIds) {
      isMatch = recipe.triggerCategoryIds.some((id) => cartCategoryIds.includes(id));
    }

    // Check brand trigger
    if (recipe.triggerType === 'brand' && recipe.triggerBrandIds) {
      isMatch = recipe.triggerBrandIds.some((id) => cartBrandIds.includes(id));
    }

    // Check cart value trigger
    if (recipe.triggerType === 'cart_value' && recipe.triggerCartValueMin) {
      isMatch = cartTotalValue >= recipe.triggerCartValueMin;
    }

    if (isMatch) {
      matches.push(recipe);
    }
  }

  // Sort by priority (highest first)
  return matches.sort((a, b) => b.priority - a.priority);
}

/**
 * Filters recommended products to exclude already-in-cart items
 */
export function filterRecommendedProducts(
  recipe: UpsellRecipe,
  cartProductIds: number[]
): number[] {
  return recipe.recommendedProductIds.filter((id) => !cartProductIds.includes(id));
}

/**
 * Calculates bundle savings
 */
export function calculateBundleSavings(
  recipe: UpsellRecipe,
  productPrices: Record<number, number>
): {
  original_total: number;
  discounted_total: number;
  savings: number;
  savings_percentage: number;
} {
  const originalTotal = recipe.recommendedProductIds.reduce(
    (sum, id) => sum + (productPrices[id] || 0),
    0
  );

  let discountedTotal = originalTotal;

  if (recipe.discountType === 'percentage' && recipe.discount) {
    discountedTotal = originalTotal * (1 - recipe.discount / 100);
  } else if (recipe.discountType === 'fixed' && recipe.discount) {
    discountedTotal = originalTotal - recipe.discount;
  } else if (recipe.discountType === 'bogo') {
    // Buy one get one: 50% off total
    discountedTotal = originalTotal * 0.5;
  }

  const savings = originalTotal - discountedTotal;
  const savingsPercentage = (savings / originalTotal) * 100;

  return {
    original_total: Math.round(originalTotal * 100) / 100,
    discounted_total: Math.round(discountedTotal * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    savings_percentage: Math.round(savingsPercentage),
  };
}

// ============================================================================
// API RESPONSE FORMAT
// ============================================================================

export interface UpsellAPIResponse {
  bundleId: string;
  title: string;
  description: string;
  products: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  }[];
  pricing: {
    original_total: number;
    discounted_total: number;
    savings: number;
    discount_percentage: number;
  };
  badge: {
    text: string;
    color: string;
  };
  visualPreset?: string;
}

/**
 * Formats upsell recipe for API response
 *
 * @param recipe - Upsell recipe
 * @param products - Product details
 * @param productPrices - Product pricing lookup
 * @returns Formatted API response
 */
export function formatUpsellForAPI(
  recipe: UpsellRecipe,
  products: Array<{ id: number; name: string; price: number; image_url?: string }>,
  productPrices: Record<number, number>
): UpsellAPIResponse {
  const pricing = calculateBundleSavings(recipe, productPrices);

  return {
    bundleId: recipe.bundleId,
    title: recipe.title,
    description: recipe.description,
    products: products.filter((p) => recipe.recommendedProductIds.includes(p.id)),
    pricing: {
      original_total: pricing.original_total,
      discounted_total: pricing.discounted_total,
      savings: pricing.savings,
      discount_percentage: pricing.savings_percentage,
    },
    badge: {
      text: recipe.badgeText || `Save ${recipe.discount}%`,
      color: recipe.badgeColor || '#10b981',
    },
    visualPreset: recipe.visualPresetId,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets all seasonal upsells for current season
 */
export function getSeasonalUpsells(season: string): UpsellRecipe[] {
  return UPSELL_RECIPES.filter((r) => r.seasonalTheme === season && r.enabled);
}

/**
 * Gets upsells by bundle type
 */
export function getUpsellsByType(type: 'brand' | 'category' | 'flavor'): UpsellRecipe[] {
  const typeMap = {
    brand: ['brand'],
    category: ['category'],
    flavor: ['product'],
  };

  return UPSELL_RECIPES.filter((r) => typeMap[type].includes(r.triggerType) && r.enabled);
}

/**
 * Gets top priority upsells
 */
export function getTopPriorityUpsells(limit: number = 5): UpsellRecipe[] {
  return UPSELL_RECIPES.filter((r) => r.enabled)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}
