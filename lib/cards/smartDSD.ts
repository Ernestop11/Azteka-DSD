/**
 * Smart DSD Recommendation Algorithm
 *
 * AI-powered product recommendation engine for Direct Store Delivery.
 *
 * Algorithm factors:
 * 1. Purchase history velocity (30-day rolling window)
 * 2. Seasonality (current season alignment)
 * 3. Brand loyalty (brand affinity score)
 * 4. Category coverage (ensure balanced cart)
 * 5. Cart composition synergy (complementary products)
 *
 * Input: Customer, Recent Orders (30 days), Product Catalog
 * Output: Top 20 recommended items with confidence scores + quantity suggestions
 */

import { z } from 'zod';

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const CustomerSchema = z.object({
  id: z.string().uuid('Customer ID must be a valid UUID'),
  name: z.string(),
  store_type: z.string().optional(),
  location: z.string().optional(),
  created_at: z.date().optional(),
});

export const OrderItemSchema = z.object({
  product_id: z.string().uuid('Product ID must be a valid UUID'),
  sku: z.string(),
  quantity: z.number().int().positive(),
  price_case: z.number().positive(),
  order_date: z.date(),
});

export const ProductCatalogItemSchema = z.object({
  id: z.string().uuid('Product ID must be a valid UUID'),
  sku: z.string(),
  name: z.string(),
  category_id: z.string().uuid('Category ID must be a valid UUID'),
  category_name: z.string().optional(),
  brand_id: z.string().uuid('Brand ID must be a valid UUID').optional().nullable(),
  brand_name: z.string().optional().nullable(),
  price_case: z.number().positive(),
  price_unit: z.number().positive().optional().nullable(),
  in_stock: z.boolean().default(true),
  featured: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  seasonal_theme: z.string().optional().nullable(),
  seasonal_start: z.string().optional().nullable(),
  seasonal_end: z.string().optional().nullable(),
  new_arrival: z.boolean().default(false),
  trending: z.boolean().default(false),
});

export type Customer = z.infer<typeof CustomerSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type ProductCatalogItem = z.infer<typeof ProductCatalogItemSchema>;

export const SmartDSDInputSchema = z.object({
  customer: CustomerSchema,
  recentOrders: z.array(OrderItemSchema),
  productCatalog: z.array(ProductCatalogItemSchema),
});

// ============================================================================
// OUTPUT SCHEMA
// ============================================================================

export const RecommendationSchema = z.object({
  product_id: z.string().uuid('Product ID must be a valid UUID'),
  sku: z.string(),
  name: z.string(),
  category_name: z.string(),
  brand_name: z.string().optional().nullable(),
  price_case: z.number().positive(),

  // Recommendation metrics
  confidence_score: z.number().min(0).max(100),
  suggested_quantity: z.number().int().positive(),

  // Reasoning breakdown
  velocity_score: z.number().min(0).max(100),
  seasonality_score: z.number().min(0).max(100),
  brand_loyalty_score: z.number().min(0).max(100),
  category_coverage_score: z.number().min(0).max(100),
  synergy_score: z.number().min(0).max(100),

  // Flags
  is_replenishment: z.boolean(), // Product ordered in last 30 days
  is_new_suggestion: z.boolean(), // Never ordered before
  is_seasonal: z.boolean(),
  is_trending: z.boolean(),

  // Reasoning text
  reason: z.string(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

// ============================================================================
// ALGORITHM CONSTANTS
// ============================================================================

const WEIGHTS = {
  velocity: 0.35, // 35% weight
  seasonality: 0.15, // 15% weight
  brand_loyalty: 0.20, // 20% weight
  category_coverage: 0.15, // 15% weight
  synergy: 0.15, // 15% weight
};

const RECOMMENDATION_LIMIT = 20;
const DAYS_LOOKBACK = 30;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates purchase velocity score (0-100)
 * Based on order frequency and quantity in last 30 days
 */
function calculateVelocityScore(
  productId: string,
  recentOrders: OrderItem[]
): { score: number; avgQuantity: number; orderCount: number } {
  const productOrders = recentOrders.filter((item) => item.product_id === productId);

  if (productOrders.length === 0) {
    return { score: 0, avgQuantity: 0, orderCount: 0 };
  }

  const totalQuantity = productOrders.reduce((sum, item) => sum + item.quantity, 0);
  const avgQuantity = Math.round(totalQuantity / productOrders.length);
  const orderCount = productOrders.length;

  // Score based on frequency and volume
  // Max score if ordered 4+ times with avg quantity 10+
  const frequencyScore = Math.min((orderCount / 4) * 100, 100);
  const volumeScore = Math.min((avgQuantity / 10) * 100, 100);

  const score = (frequencyScore + volumeScore) / 2;

  return { score, avgQuantity, orderCount };
}

/**
 * Calculates seasonality score (0-100)
 * Higher score for in-season products
 */
function calculateSeasonalityScore(product: ProductCatalogItem): number {
  if (!product.seasonal) {
    return 50; // Neutral score for non-seasonal
  }

  if (!product.seasonal_start || !product.seasonal_end) {
    return 50;
  }

  const now = new Date();
  const start = new Date(product.seasonal_start);
  const end = new Date(product.seasonal_end);

  // Check if currently in season
  if (now >= start && now <= end) {
    return 100; // Max score for in-season
  }

  // Check if season is approaching (within 14 days)
  const daysUntilStart = Math.floor((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilStart > 0 && daysUntilStart <= 14) {
    return 80; // High score for upcoming season
  }

  // Out of season
  return 20;
}

/**
 * Calculates brand loyalty score (0-100)
 * Based on customer's historical brand preferences
 */
function calculateBrandLoyaltyScore(
  product: ProductCatalogItem,
  recentOrders: OrderItem[],
  catalog: ProductCatalogItem[]
): number {
  if (!product.brand_id) {
    return 50; // Neutral for no-brand products
  }

  // Get all ordered products by this brand
  const brandOrders = recentOrders.filter((order) => {
    const orderedProduct = catalog.find((p) => p.id === order.product_id);
    return orderedProduct?.brand_id === product.brand_id;
  });

  const totalOrders = recentOrders.length;

  if (totalOrders === 0) {
    return 50; // No order history
  }

  // Calculate brand affinity as percentage of orders
  const brandAffinity = (brandOrders.length / totalOrders) * 100;

  return Math.min(brandAffinity * 1.5, 100); // Boost brand affinity, cap at 100
}

/**
 * Calculates category coverage score (0-100)
 * Encourages diverse cart composition
 */
function calculateCategoryCoverageScore(
  product: ProductCatalogItem,
  recentOrders: OrderItem[],
  catalog: ProductCatalogItem[]
): number {
  // Get categories already ordered
  const orderedCategories = new Set(
    recentOrders
      .map((order) => {
        const p = catalog.find((p) => p.id === order.product_id);
        return p?.category_id;
      })
      .filter((id): id is string => id !== undefined)
  );

  // If category not yet ordered, boost score (encourages diversity)
  if (!orderedCategories.has(product.category_id)) {
    return 80; // High score for new category
  }

  // Check how many products from this category were ordered
  const categoryOrders = recentOrders.filter((order) => {
    const p = catalog.find((p) => p.id === order.product_id);
    return p?.category_id === product.category_id;
  });

  // Lower score if category heavily represented (encourages balance)
  const categoryRepresentation = categoryOrders.length / recentOrders.length;

  if (categoryRepresentation > 0.4) {
    return 30; // Low score if category >40% of orders
  }

  if (categoryRepresentation > 0.2) {
    return 50; // Medium score if category >20% of orders
  }

  return 70; // Good score for balanced representation
}

/**
 * Calculates cart synergy score (0-100)
 * Products that pair well with recent purchases
 */
function calculateSynergyScore(
  product: ProductCatalogItem,
  recentOrders: OrderItem[],
  catalog: ProductCatalogItem[]
): number {
  // Define complementary category pairs
  const complementaryCategoryPairs: Record<string, string[]> = {
    'Candy': ['Beverages', 'Gum'],
    'Beverages': ['Candy', 'Chips', 'Snacks'],
    'Chips': ['Beverages', 'Dips'],
    'Gum': ['Candy', 'Mints'],
    'Ice Cream': ['Cones', 'Toppings', 'Beverages'],
    'Cookies': ['Milk', 'Beverages'],
  };

  // Get categories recently ordered
  const recentCategories = recentOrders
    .map((order) => {
      const p = catalog.find((p) => p.id === order.product_id);
      return p?.category_name;
    })
    .filter((name): name is string => name !== undefined);

  const productCategory = product.category_name || '';

  // Check if this product complements recent categories
  let synergyFound = false;

  for (const recentCategory of recentCategories) {
    const complements = complementaryCategoryPairs[recentCategory] || [];

    if (complements.some((c) => productCategory.includes(c))) {
      synergyFound = true;
      break;
    }
  }

  if (synergyFound) {
    return 90; // High synergy
  }

  // Check if same category (moderate synergy)
  if (recentCategories.includes(productCategory)) {
    return 60;
  }

  return 40; // No clear synergy
}

/**
 * Generates human-readable reasoning text
 */
function generateReasoningText(
  isReplenishment: boolean,
  velocity: { orderCount: number; avgQuantity: number },
  seasonalityScore: number,
  brandLoyaltyScore: number,
  product: ProductCatalogItem
): string {
  if (isReplenishment && velocity.orderCount > 0) {
    return `Frequently ordered (${velocity.orderCount}x in 30 days, avg ${velocity.avgQuantity} units). Likely needs replenishment.`;
  }

  if (seasonalityScore === 100) {
    return `In-season product (${product.seasonal_theme}). Perfect timing for this item.`;
  }

  if (seasonalityScore === 80) {
    return `Upcoming seasonal product (${product.seasonal_theme}). Consider stocking ahead.`;
  }

  if (brandLoyaltyScore >= 75 && product.brand_name) {
    return `Strong affinity for ${product.brand_name}. Customer frequently orders this brand.`;
  }

  if (product.trending) {
    return `Trending product with high demand. Popular choice among similar customers.`;
  }

  if (product.new_arrival) {
    return `New arrival worth trying. Complements existing purchase patterns.`;
  }

  return `Recommended based on purchase history and category preferences.`;
}

// ============================================================================
// MAIN ALGORITHM
// ============================================================================

export interface SmartDSDInput {
  customer: Customer;
  recentOrders: OrderItem[];
  productCatalog: ProductCatalogItem[];
}

export interface SmartDSDOutput {
  recommendations: Recommendation[];
  metadata: {
    customer_id: string;
    total_recent_orders: number;
    lookback_days: number;
    generated_at: Date;
  };
}

/**
 * Main Smart DSD Recommendation Algorithm
 *
 * @param input - Customer, recent orders (30 days), product catalog
 * @returns Top 20 recommendations with confidence scores
 */
export function generateSmartDSDRecommendations(input: SmartDSDInput): SmartDSDOutput {
  SmartDSDInputSchema.parse(input);
  const { customer, recentOrders, productCatalog } = input;

  // Filter to in-stock products only
  const availableProducts = productCatalog.filter((p) => p.in_stock);

  // Calculate scores for each product
  const scoredProducts = availableProducts.map((product) => {
    const velocity = calculateVelocityScore(product.id, recentOrders);
    const velocityScore = velocity.score;

    const seasonalityScore = calculateSeasonalityScore(product);
    const brandLoyaltyScore = calculateBrandLoyaltyScore(product, recentOrders, productCatalog);
    const categoryCoverageScore = calculateCategoryCoverageScore(
      product,
      recentOrders,
      productCatalog
    );
    const synergyScore = calculateSynergyScore(product, recentOrders, productCatalog);

    // Calculate weighted confidence score
    const confidenceScore = Math.round(
      velocityScore * WEIGHTS.velocity +
        seasonalityScore * WEIGHTS.seasonality +
        brandLoyaltyScore * WEIGHTS.brand_loyalty +
        categoryCoverageScore * WEIGHTS.category_coverage +
        synergyScore * WEIGHTS.synergy
    );

    // Flags
    const isReplenishment = velocity.orderCount > 0;
    const isNewSuggestion = velocity.orderCount === 0;

    // Suggested quantity
    let suggestedQuantity = 1;

    if (isReplenishment && velocity.avgQuantity > 0) {
      suggestedQuantity = velocity.avgQuantity; // Reorder average quantity
    } else if (product.featured || product.trending) {
      suggestedQuantity = 2; // Suggest 2 cases for featured/trending
    } else {
      suggestedQuantity = 1; // Default trial quantity
    }

    // Reasoning text
    const reason = generateReasoningText(
      isReplenishment,
      velocity,
      seasonalityScore,
      brandLoyaltyScore,
      product
    );

    const recommendation: Recommendation = {
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      category_name: product.category_name || 'Unknown',
      brand_name: product.brand_name || null,
      price_case: product.price_case,
      confidence_score: confidenceScore,
      suggested_quantity: suggestedQuantity,
      velocity_score: Math.round(velocityScore),
      seasonality_score: Math.round(seasonalityScore),
      brand_loyalty_score: Math.round(brandLoyaltyScore),
      category_coverage_score: Math.round(categoryCoverageScore),
      synergy_score: Math.round(synergyScore),
      is_replenishment: isReplenishment,
      is_new_suggestion: isNewSuggestion,
      is_seasonal: product.seasonal,
      is_trending: product.trending,
      reason,
    };

    return recommendation;
  });

  // Sort by confidence score descending
  const sortedRecommendations = scoredProducts.sort(
    (a, b) => b.confidence_score - a.confidence_score
  );

  // Take top N recommendations
  const topRecommendations = sortedRecommendations.slice(0, RECOMMENDATION_LIMIT);

  return {
    recommendations: topRecommendations,
    metadata: {
      customer_id: customer.id,
      total_recent_orders: recentOrders.length,
      lookback_days: DAYS_LOOKBACK,
      generated_at: new Date(),
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Filters recommendations by minimum confidence threshold
 */
export function filterByConfidence(
  recommendations: Recommendation[],
  minConfidence: number
): Recommendation[] {
  return recommendations.filter((r) => r.confidence_score >= minConfidence);
}

/**
 * Groups recommendations by category
 */
export function groupByCategory(
  recommendations: Recommendation[]
): Record<string, Recommendation[]> {
  return recommendations.reduce(
    (acc, rec) => {
      const category = rec.category_name;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(rec);
      return acc;
    },
    {} as Record<string, Recommendation[]>
  );
}

/**
 * Separates replenishment vs new suggestions
 */
export function separateReplenishmentAndNew(recommendations: Recommendation[]): {
  replenishment: Recommendation[];
  new_suggestions: Recommendation[];
} {
  return {
    replenishment: recommendations.filter((r) => r.is_replenishment),
    new_suggestions: recommendations.filter((r) => r.is_new_suggestion),
  };
}

/**
 * Calculates total recommended cart value
 */
export function calculateRecommendedCartValue(recommendations: Recommendation[]): {
  total_cases: number;
  total_value: number;
  avg_confidence: number;
} {
  const totalCases = recommendations.reduce((sum, r) => sum + r.suggested_quantity, 0);
  const totalValue = recommendations.reduce(
    (sum, r) => sum + r.price_case * r.suggested_quantity,
    0
  );
  const avgConfidence = Math.round(
    recommendations.reduce((sum, r) => sum + r.confidence_score, 0) / recommendations.length
  );

  return {
    total_cases: totalCases,
    total_value: Math.round(totalValue * 100) / 100,
    avg_confidence: avgConfidence,
  };
}
