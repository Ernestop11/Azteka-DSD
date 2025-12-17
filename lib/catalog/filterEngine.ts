/**
 * Catalog Filter Engine
 *
 * Composable filter functions for product catalog filtering.
 * Supports category, brand, price range, search, and enhancement filters.
 *
 * Usage:
 * ```typescript
 * const filtered = applyFilters(products, {
 *   categoryIds: [1, 2],
 *   brandIds: [5],
 *   priceRange: { min: 10, max: 50 },
 *   searchQuery: 'takis',
 *   featured: true
 * });
 * ```
 */

import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const PriceRangeSchema = z.object({
  min: z.number().min(0).optional(),
  max: z.number().positive().optional(),
});

export const FilterOptionsSchema = z.object({
  categoryIds: z.array(z.number().int().positive()).optional(),
  brandIds: z.array(z.number().int().positive()).optional(),
  priceRange: PriceRangeSchema.optional(),
  searchQuery: z.string().optional(),
  featured: z.boolean().optional(),
  seasonal: z.boolean().optional(),
  new_arrival: z.boolean().optional(),
  trending: z.boolean().optional(),
  in_stock: z.boolean().optional(),
});

export type PriceRange = z.infer<typeof PriceRangeSchema>;
export type FilterOptions = z.infer<typeof FilterOptionsSchema>;

export interface CatalogProduct {
  id: number;
  sku: string;
  name: string;
  category_id: number;
  category_name?: string;
  brand_id?: number | null;
  brand_name?: string | null;
  price_case: number;
  price_unit?: number | null;
  in_stock: boolean;
  featured: boolean;
  seasonal: boolean;
  new_arrival: boolean;
  trending: boolean;
}

// ============================================================================
// INDIVIDUAL FILTER FUNCTIONS
// ============================================================================

/**
 * Filters products by category IDs
 *
 * @param products - Product array
 * @param categoryIds - Array of category IDs to include
 * @returns Filtered products
 */
export function filterByCategory(
  products: CatalogProduct[],
  categoryIds: number[]
): CatalogProduct[] {
  if (!categoryIds || categoryIds.length === 0) return products;

  return products.filter((p) => categoryIds.includes(p.category_id));
}

/**
 * Filters products by brand IDs
 *
 * @param products - Product array
 * @param brandIds - Array of brand IDs to include
 * @returns Filtered products
 */
export function filterByBrand(
  products: CatalogProduct[],
  brandIds: number[]
): CatalogProduct[] {
  if (!brandIds || brandIds.length === 0) return products;

  return products.filter((p) => p.brand_id && brandIds.includes(p.brand_id));
}

/**
 * Filters products by price range
 *
 * @param products - Product array
 * @param priceRange - Min/max price range
 * @returns Filtered products
 */
export function filterByPriceRange(
  products: CatalogProduct[],
  priceRange: PriceRange
): CatalogProduct[] {
  if (!priceRange || (!priceRange.min && !priceRange.max)) return products;

  return products.filter((p) => {
    const price = p.price_case;

    if (priceRange.min !== undefined && price < priceRange.min) return false;
    if (priceRange.max !== undefined && price > priceRange.max) return false;

    return true;
  });
}

/**
 * Filters products by search query (fuzzy match on name and SKU)
 *
 * @param products - Product array
 * @param query - Search query string
 * @returns Filtered products
 */
export function filterBySearch(
  products: CatalogProduct[],
  query: string
): CatalogProduct[] {
  if (!query || query.trim().length === 0) return products;

  const normalizedQuery = query.toLowerCase().trim();
  const tokens = normalizedQuery.split(/\s+/);

  return products.filter((p) => {
    const searchableText = [
      p.name.toLowerCase(),
      p.sku.toLowerCase(),
      p.category_name?.toLowerCase() || '',
      p.brand_name?.toLowerCase() || '',
    ].join(' ');

    // All tokens must match (AND logic)
    return tokens.every((token) => searchableText.includes(token));
  });
}

/**
 * Filters products by enhancement flags
 *
 * @param products - Product array
 * @param flags - Enhancement flags to filter by
 * @returns Filtered products
 */
export function filterByEnhancements(
  products: CatalogProduct[],
  flags: {
    featured?: boolean;
    seasonal?: boolean;
    new_arrival?: boolean;
    trending?: boolean;
  }
): CatalogProduct[] {
  return products.filter((p) => {
    if (flags.featured !== undefined && p.featured !== flags.featured) return false;
    if (flags.seasonal !== undefined && p.seasonal !== flags.seasonal) return false;
    if (flags.new_arrival !== undefined && p.new_arrival !== flags.new_arrival) return false;
    if (flags.trending !== undefined && p.trending !== flags.trending) return false;

    return true;
  });
}

/**
 * Filters products by stock availability
 *
 * @param products - Product array
 * @param inStockOnly - If true, only show in-stock products
 * @returns Filtered products
 */
export function filterByStock(
  products: CatalogProduct[],
  inStockOnly: boolean
): CatalogProduct[] {
  if (!inStockOnly) return products;

  return products.filter((p) => p.in_stock);
}

// ============================================================================
// COMPOSITE FILTER ENGINE
// ============================================================================

/**
 * Applies all filters to a product catalog
 *
 * Filters are applied in this order:
 * 1. Stock availability
 * 2. Category
 * 3. Brand
 * 4. Price range
 * 5. Enhancement flags
 * 6. Search query (last for performance)
 *
 * @param products - Full product catalog
 * @param options - Filter options
 * @returns Filtered products
 */
export function applyFilters(
  products: CatalogProduct[],
  options: FilterOptions
): CatalogProduct[] {
  let filtered = [...products];

  // 1. Stock filter (fastest, eliminates most products)
  if (options.in_stock !== undefined) {
    filtered = filterByStock(filtered, options.in_stock);
  }

  // 2. Category filter
  if (options.categoryIds && options.categoryIds.length > 0) {
    filtered = filterByCategory(filtered, options.categoryIds);
  }

  // 3. Brand filter
  if (options.brandIds && options.brandIds.length > 0) {
    filtered = filterByBrand(filtered, options.brandIds);
  }

  // 4. Price range filter
  if (options.priceRange) {
    filtered = filterByPriceRange(filtered, options.priceRange);
  }

  // 5. Enhancement flags
  const enhancementFlags = {
    featured: options.featured,
    seasonal: options.seasonal,
    new_arrival: options.new_arrival,
    trending: options.trending,
  };

  if (Object.values(enhancementFlags).some((v) => v !== undefined)) {
    filtered = filterByEnhancements(filtered, enhancementFlags);
  }

  // 6. Search query (last, most expensive)
  if (options.searchQuery) {
    filtered = filterBySearch(filtered, options.searchQuery);
  }

  return filtered;
}

// ============================================================================
// SUGGESTED FILTERS ALGORITHM
// ============================================================================

export interface SuggestedFilter {
  type: 'category' | 'brand' | 'price' | 'enhancement';
  label: string;
  value: FilterOptions;
  count: number; // Number of products this filter would show
  confidence: number; // 0-100 confidence score
  reason: string;
}

/**
 * Generates suggested filters based on current catalog and customer context
 *
 * Algorithm considers:
 * - Most popular categories
 * - Customer's previous orders
 * - Seasonal products
 * - Featured products
 * - Price tiers with most products
 *
 * @param products - Full product catalog
 * @param currentFilters - Currently applied filters
 * @param customerContext - Optional customer purchase history
 * @returns Suggested filter options
 */
export function generateSuggestedFilters(
  products: CatalogProduct[],
  currentFilters: FilterOptions = {},
  customerContext?: {
    recentCategoryIds?: number[];
    recentBrandIds?: number[];
    avgOrderValue?: number;
  }
): SuggestedFilter[] {
  const suggestions: SuggestedFilter[] = [];

  // Get currently filtered products
  const currentProducts = applyFilters(products, currentFilters);

  // 1. Suggest popular categories (with most products)
  if (!currentFilters.categoryIds || currentFilters.categoryIds.length === 0) {
    const categoryCounts = new Map<number, { name: string; count: number }>();

    currentProducts.forEach((p) => {
      const existing = categoryCounts.get(p.category_id);
      if (existing) {
        existing.count++;
      } else {
        categoryCounts.set(p.category_id, {
          name: p.category_name || `Category ${p.category_id}`,
          count: 1,
        });
      }
    });

    // Top 3 categories
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);

    topCategories.forEach(([categoryId, { name, count }], index) => {
      const confidence = Math.max(50, 100 - index * 15);

      suggestions.push({
        type: 'category',
        label: name,
        value: { categoryIds: [categoryId] },
        count,
        confidence,
        reason: `${count} products available`,
      });
    });
  }

  // 2. Suggest brands (popular or customer favorites)
  if (!currentFilters.brandIds || currentFilters.brandIds.length === 0) {
    const brandCounts = new Map<number, { name: string; count: number }>();

    currentProducts.forEach((p) => {
      if (p.brand_id) {
        const existing = brandCounts.get(p.brand_id);
        if (existing) {
          existing.count++;
        } else {
          brandCounts.set(p.brand_id, {
            name: p.brand_name || `Brand ${p.brand_id}`,
            count: 1,
          });
        }
      }
    });

    // Prioritize customer's recent brands
    const recentBrandSet = new Set(customerContext?.recentBrandIds || []);
    const brandSuggestions = Array.from(brandCounts.entries())
      .map(([brandId, { name, count }]) => ({
        brandId,
        name,
        count,
        isRecent: recentBrandSet.has(brandId),
      }))
      .sort((a, b) => {
        // Recent brands first, then by count
        if (a.isRecent && !b.isRecent) return -1;
        if (!a.isRecent && b.isRecent) return 1;
        return b.count - a.count;
      })
      .slice(0, 3);

    brandSuggestions.forEach(({ brandId, name, count, isRecent }, index) => {
      const confidence = isRecent ? 95 : Math.max(50, 85 - index * 10);

      suggestions.push({
        type: 'brand',
        label: name,
        value: { brandIds: [brandId] },
        count,
        confidence,
        reason: isRecent ? 'You order this brand frequently' : `${count} products available`,
      });
    });
  }

  // 3. Suggest price tiers
  if (!currentFilters.priceRange) {
    const prices = currentProducts.map((p) => p.price_case).sort((a, b) => a - b);
    const avgPrice = customerContext?.avgOrderValue || prices[Math.floor(prices.length / 2)];

    const priceTiers = [
      {
        label: 'Budget Friendly',
        range: { min: 0, max: avgPrice * 0.75 },
        confidence: 70,
      },
      {
        label: 'Mid-Range',
        range: { min: avgPrice * 0.75, max: avgPrice * 1.5 },
        confidence: 85,
      },
      {
        label: 'Premium',
        range: { min: avgPrice * 1.5, max: undefined },
        confidence: 65,
      },
    ];

    priceTiers.forEach((tier) => {
      const count = filterByPriceRange(currentProducts, tier.range).length;

      if (count > 0) {
        suggestions.push({
          type: 'price',
          label: tier.label,
          value: { priceRange: tier.range },
          count,
          confidence: tier.confidence,
          reason: `$${tier.range.min?.toFixed(2) || '0'} - $${tier.range.max?.toFixed(2) || 'up'}`,
        });
      }
    });
  }

  // 4. Suggest enhancement filters (if products exist)
  const enhancementSuggestions: Array<{
    type: 'enhancement';
    label: string;
    field: keyof FilterOptions;
    confidence: number;
  }> = [
    { type: 'enhancement', label: 'Featured Products', field: 'featured', confidence: 90 },
    { type: 'enhancement', label: 'Seasonal Items', field: 'seasonal', confidence: 85 },
    { type: 'enhancement', label: 'New Arrivals', field: 'new_arrival', confidence: 80 },
    { type: 'enhancement', label: 'Trending Now', field: 'trending', confidence: 75 },
  ];

  enhancementSuggestions.forEach((enhancement) => {
    const count = currentProducts.filter((p) => p[enhancement.field as keyof CatalogProduct]).length;

    if (count > 0) {
      suggestions.push({
        type: enhancement.type,
        label: enhancement.label,
        value: { [enhancement.field]: true } as FilterOptions,
        count,
        confidence: enhancement.confidence,
        reason: `${count} products`,
      });
    }
  });

  // Sort by confidence descending
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// ============================================================================
// FILTER ANALYTICS
// ============================================================================

export interface FilterAnalytics {
  totalProducts: number;
  filteredProducts: number;
  filterReduction: number; // Percentage reduced
  appliedFilters: string[];
  priceStats: {
    min: number;
    max: number;
    avg: number;
    median: number;
  };
  categoryDistribution: Record<string, number>;
  brandDistribution: Record<string, number>;
}

/**
 * Analyzes the results of applied filters
 *
 * @param allProducts - Full catalog
 * @param filteredProducts - Filtered results
 * @param appliedFilters - Filters that were applied
 * @returns Analytics data
 */
export function analyzeFilterResults(
  allProducts: CatalogProduct[],
  filteredProducts: CatalogProduct[],
  appliedFilters: FilterOptions
): FilterAnalytics {
  const prices = filteredProducts.map((p) => p.price_case).sort((a, b) => a - b);

  const priceStats = {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: prices.reduce((sum, p) => sum + p, 0) / prices.length,
    median: prices[Math.floor(prices.length / 2)],
  };

  const categoryDistribution: Record<string, number> = {};
  const brandDistribution: Record<string, number> = {};

  filteredProducts.forEach((p) => {
    const categoryName = p.category_name || `Category ${p.category_id}`;
    categoryDistribution[categoryName] = (categoryDistribution[categoryName] || 0) + 1;

    if (p.brand_name) {
      brandDistribution[p.brand_name] = (brandDistribution[p.brand_name] || 0) + 1;
    }
  });

  const appliedFiltersList: string[] = [];
  if (appliedFilters.categoryIds?.length) appliedFiltersList.push('Category');
  if (appliedFilters.brandIds?.length) appliedFiltersList.push('Brand');
  if (appliedFilters.priceRange) appliedFiltersList.push('Price Range');
  if (appliedFilters.searchQuery) appliedFiltersList.push('Search');
  if (appliedFilters.featured) appliedFiltersList.push('Featured');
  if (appliedFilters.seasonal) appliedFiltersList.push('Seasonal');
  if (appliedFilters.new_arrival) appliedFiltersList.push('New');
  if (appliedFilters.trending) appliedFiltersList.push('Trending');

  return {
    totalProducts: allProducts.length,
    filteredProducts: filteredProducts.length,
    filterReduction: ((1 - filteredProducts.length / allProducts.length) * 100),
    appliedFilters: appliedFiltersList,
    priceStats,
    categoryDistribution,
    brandDistribution,
  };
}
