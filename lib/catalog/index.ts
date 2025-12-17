/**
 * Catalog Module - Barrel Exports
 *
 * Clean imports for all catalog functionality.
 *
 * Usage:
 * ```typescript
 * import { applyFilters, applySortStrategy, saveCustomerFilters } from '@/lib/catalog';
 * ```
 */

// Filter Engine
export {
  applyFilters,
  filterByCategory,
  filterByBrand,
  filterByPriceRange,
  filterBySearch,
  filterByEnhancements,
  filterByStock,
  generateSuggestedFilters,
  analyzeFilterResults,
  type FilterOptions,
  type PriceRange,
  type CatalogProduct,
  type SuggestedFilter,
  type FilterAnalytics,
  FilterOptionsSchema,
  PriceRangeSchema,
} from './filterEngine';

// Filter Validation
export {
  validateFilterOptions,
  validatePriceRange,
  validateIdArray,
  validateSearchQuery,
  validateFilterCompatibility,
  sanitizeFilterOptions,
  isEmptyFilter,
  formatValidationErrors,
  type ValidationResult,
  type ValidationError,
} from './filterValidation';

// Filter Persistence
export {
  saveCustomerFilters,
  loadCustomerFilters,
  clearCustomerFilters,
  getAllPersistedCustomers,
  clearAllPersistedFilters,
  clearExpiredFilters,
  getFilterMetadata,
  exportAllFilters,
  importFilters,
  getFilterStorageSize,
  isStorageAvailable,
  type FilterPersistenceOptions,
  type FilterPersistenceMetadata,
} from './filterPersistence';

// Sort Strategies
export {
  applySortStrategy,
  sortByNewest,
  sortByPriceAsc,
  sortByPriceDesc,
  sortByNameAsc,
  sortByNameDesc,
  sortByPopular,
  sortByFeatured,
  sortBySeasonal,
  sortByCategory,
  sortByBrand,
  sortByCustom,
  sortByMultipleCriteria,
  smartSort,
  saveSortPreference,
  loadSortPreference,
  clearSortPreference,
  getSortOption,
  isValidSortStrategy,
  reverseSortOrder,
  shuffleProducts,
  type SortStrategy,
  type SortOption,
  type SmartSortContext,
  SORT_OPTIONS,
} from './sortStrategies';
