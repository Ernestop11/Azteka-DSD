/**
 * Catalog Sort Strategies
 *
 * Complete sorting strategy set for product catalogs.
 * Supports newest, price ascending/descending, popular, alphabetical, etc.
 */

import type { CatalogProduct } from './filterEngine';

// ============================================================================
// SORT TYPES
// ============================================================================

export type SortStrategy =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'popular'
  | 'featured'
  | 'seasonal'
  | 'category'
  | 'brand';

export interface SortOption {
  id: SortStrategy;
  label: string;
  description: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: 'newest', label: 'Newest First', description: 'Most recently added products' },
  { id: 'price_asc', label: 'Price: Low to High', description: 'Lowest price first' },
  { id: 'price_desc', label: 'Price: High to Low', description: 'Highest price first' },
  { id: 'name_asc', label: 'Name: A-Z', description: 'Alphabetical order' },
  { id: 'name_desc', label: 'Name: Z-A', description: 'Reverse alphabetical order' },
  { id: 'popular', label: 'Most Popular', description: 'Trending and featured products first' },
  { id: 'featured', label: 'Featured First', description: 'Featured products at top' },
  { id: 'seasonal', label: 'Seasonal First', description: 'Seasonal items at top' },
  { id: 'category', label: 'By Category', description: 'Grouped by category' },
  { id: 'brand', label: 'By Brand', description: 'Grouped by brand' },
];

// ============================================================================
// INDIVIDUAL SORT FUNCTIONS
// ============================================================================

/**
 * Sorts products by newest first (assumes higher ID = newer)
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortByNewest(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => b.id - a.id);
}

/**
 * Sorts products by price ascending
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortByPriceAsc(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => a.price_case - b.price_case);
}

/**
 * Sorts products by price descending
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortByPriceDesc(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => b.price_case - a.price_case);
}

/**
 * Sorts products alphabetically by name (A-Z)
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortByNameAsc(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Sorts products alphabetically by name (Z-A)
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortByNameDesc(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => b.name.localeCompare(a.name));
}

/**
 * Sorts products by popularity
 *
 * Priority:
 * 1. Featured products
 * 2. Trending products
 * 3. New arrivals
 * 4. Seasonal products
 * 5. Regular products (by price desc)
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortByPopular(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => {
    // Calculate popularity score
    const scoreA = getPopularityScore(a);
    const scoreB = getPopularityScore(b);

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }

    // Tie-breaker: higher price first (premium products)
    return b.price_case - a.price_case;
  });
}

/**
 * Calculates popularity score for a product
 *
 * @param product - Product
 * @returns Popularity score (0-100)
 */
function getPopularityScore(product: CatalogProduct): number {
  let score = 0;

  if (product.featured) score += 40;
  if (product.trending) score += 30;
  if (product.new_arrival) score += 20;
  if (product.seasonal) score += 10;

  return score;
}

/**
 * Sorts products with featured first, then by price
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortByFeatured(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => {
    // Featured first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // Then by price descending
    return b.price_case - a.price_case;
  });
}

/**
 * Sorts products with seasonal first, then by price
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortBySeasonal(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => {
    // Seasonal first
    if (a.seasonal && !b.seasonal) return -1;
    if (!a.seasonal && b.seasonal) return 1;

    // Then by price descending
    return b.price_case - a.price_case;
  });
}

/**
 * Sorts products by category, then by name within category
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortByCategory(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => {
    // First by category ID
    if (a.category_id !== b.category_id) {
      return a.category_id - b.category_id;
    }

    // Then by name within category
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sorts products by brand, then by name within brand
 *
 * @param products - Product array
 * @returns Sorted products
 */
export function sortByBrand(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => {
    // Products without brand go last
    if (!a.brand_id && b.brand_id) return 1;
    if (a.brand_id && !b.brand_id) return -1;
    if (!a.brand_id && !b.brand_id) return a.name.localeCompare(b.name);

    // Sort by brand ID
    if (a.brand_id !== b.brand_id) {
      return a.brand_id! - b.brand_id!;
    }

    // Then by name within brand
    return a.name.localeCompare(b.name);
  });
}

// ============================================================================
// MAIN SORT DISPATCHER
// ============================================================================

/**
 * Applies sort strategy to product array
 *
 * @param products - Product array
 * @param strategy - Sort strategy
 * @returns Sorted products
 */
export function applySortStrategy(
  products: CatalogProduct[],
  strategy: SortStrategy
): CatalogProduct[] {
  switch (strategy) {
    case 'newest':
      return sortByNewest(products);
    case 'price_asc':
      return sortByPriceAsc(products);
    case 'price_desc':
      return sortByPriceDesc(products);
    case 'name_asc':
      return sortByNameAsc(products);
    case 'name_desc':
      return sortByNameDesc(products);
    case 'popular':
      return sortByPopular(products);
    case 'featured':
      return sortByFeatured(products);
    case 'seasonal':
      return sortBySeasonal(products);
    case 'category':
      return sortByCategory(products);
    case 'brand':
      return sortByBrand(products);
    default:
      console.warn(`Unknown sort strategy: ${strategy}, returning unsorted`);
      return products;
  }
}

// ============================================================================
// CUSTOM SORT FUNCTIONS
// ============================================================================

/**
 * Sorts products by custom comparator function
 *
 * @param products - Product array
 * @param compareFn - Custom compare function
 * @returns Sorted products
 */
export function sortByCustom(
  products: CatalogProduct[],
  compareFn: (a: CatalogProduct, b: CatalogProduct) => number
): CatalogProduct[] {
  return [...products].sort(compareFn);
}

/**
 * Sorts products by multiple criteria (cascading sort)
 *
 * Example: Sort by featured first, then price descending, then name
 *
 * @param products - Product array
 * @param strategies - Array of sort strategies (applied in order)
 * @returns Sorted products
 */
export function sortByMultipleCriteria(
  products: CatalogProduct[],
  strategies: SortStrategy[]
): CatalogProduct[] {
  if (strategies.length === 0) return products;
  if (strategies.length === 1) return applySortStrategy(products, strategies[0]);

  return [...products].sort((a, b) => {
    for (const strategy of strategies) {
      const sorted = applySortStrategy([a, b], strategy);
      if (sorted[0].id !== a.id) return 1;
      if (sorted[0].id !== b.id) return -1;
    }
    return 0;
  });
}

// ============================================================================
// SMART SORT (CONTEXT-AWARE)
// ============================================================================

export interface SmartSortContext {
  customerRecentPurchases?: number[]; // Product IDs
  customerFavoriteBrands?: number[]; // Brand IDs
  currentSeason?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

/**
 * Smart sort that adapts based on customer context
 *
 * Priority order:
 * 1. Previously purchased products (replenishment)
 * 2. Favorite brands
 * 3. Seasonal (if applicable)
 * 4. Featured
 * 5. Popular
 * 6. Price descending
 *
 * @param products - Product array
 * @param context - Customer context
 * @returns Sorted products
 */
export function smartSort(
  products: CatalogProduct[],
  context: SmartSortContext = {}
): CatalogProduct[] {
  const recentSet = new Set(context.customerRecentPurchases || []);
  const favoriteBrandSet = new Set(context.customerFavoriteBrands || []);

  return [...products].sort((a, b) => {
    // 1. Previously purchased (replenishment priority)
    const aRecent = recentSet.has(a.id);
    const bRecent = recentSet.has(b.id);
    if (aRecent && !bRecent) return -1;
    if (!aRecent && bRecent) return 1;

    // 2. Favorite brands
    const aFavBrand = a.brand_id && favoriteBrandSet.has(a.brand_id);
    const bFavBrand = b.brand_id && favoriteBrandSet.has(b.brand_id);
    if (aFavBrand && !bFavBrand) return -1;
    if (!aFavBrand && bFavBrand) return 1;

    // 3. Seasonal (if applicable)
    if (a.seasonal && !b.seasonal) return -1;
    if (!a.seasonal && b.seasonal) return 1;

    // 4. Featured
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;

    // 5. Popularity score
    const scoreA = getPopularityScore(a);
    const scoreB = getPopularityScore(b);
    if (scoreA !== scoreB) return scoreB - scoreA;

    // 6. Price descending
    return b.price_case - a.price_case;
  });
}

// ============================================================================
// SORT PREFERENCE PERSISTENCE
// ============================================================================

const SORT_PREFERENCE_KEY = 'azteka_sort_preference';

/**
 * Saves user's sort preference to localStorage
 *
 * @param strategy - Sort strategy
 * @returns Success boolean
 */
export function saveSortPreference(strategy: SortStrategy): boolean {
  try {
    localStorage.setItem(SORT_PREFERENCE_KEY, strategy);
    return true;
  } catch (error) {
    console.error('Failed to save sort preference:', error);
    return false;
  }
}

/**
 * Loads user's sort preference from localStorage
 *
 * @returns Saved sort strategy or 'popular' as default
 */
export function loadSortPreference(): SortStrategy {
  try {
    const saved = localStorage.getItem(SORT_PREFERENCE_KEY);
    if (saved && SORT_OPTIONS.find((opt) => opt.id === saved)) {
      return saved as SortStrategy;
    }
  } catch (error) {
    console.error('Failed to load sort preference:', error);
  }

  return 'popular'; // Default
}

/**
 * Clears saved sort preference
 *
 * @returns Success boolean
 */
export function clearSortPreference(): boolean {
  try {
    localStorage.removeItem(SORT_PREFERENCE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear sort preference:', error);
    return false;
  }
}

// ============================================================================
// SORT UTILITIES
// ============================================================================

/**
 * Gets sort option metadata by ID
 *
 * @param strategy - Sort strategy
 * @returns Sort option or null
 */
export function getSortOption(strategy: SortStrategy): SortOption | null {
  return SORT_OPTIONS.find((opt) => opt.id === strategy) || null;
}

/**
 * Checks if a sort strategy is valid
 *
 * @param strategy - Sort strategy
 * @returns True if valid
 */
export function isValidSortStrategy(strategy: string): strategy is SortStrategy {
  return SORT_OPTIONS.some((opt) => opt.id === strategy);
}

/**
 * Reverses the sort order of a product array
 *
 * @param products - Sorted product array
 * @returns Reversed products
 */
export function reverseSortOrder(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].reverse();
}

/**
 * Shuffles product array (random order)
 * Useful for A/B testing or variety
 *
 * @param products - Product array
 * @returns Shuffled products
 */
export function shuffleProducts(products: CatalogProduct[]): CatalogProduct[] {
  const shuffled = [...products];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
