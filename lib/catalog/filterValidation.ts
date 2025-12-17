/**
 * Catalog Filter Validation
 *
 * Validation utilities for filter options with detailed error messages.
 * Ensures filter values are valid before applying to catalog.
 */

import { z } from 'zod';
import type { FilterOptions, PriceRange } from './filterEngine';

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult<T = FilterOptions> {
  valid: boolean;
  errors: ValidationError[];
  sanitized?: T;
}

// ============================================================================
// PRICE RANGE VALIDATION
// ============================================================================

/**
 * Validates price range values
 *
 * Rules:
 * - Min must be >= 0
 * - Max must be > 0
 * - Min must be < Max
 *
 * @param priceRange - Price range to validate
 * @returns Validation result
 */
export function validatePriceRange(priceRange: PriceRange): ValidationResult<PriceRange> {
  const errors: ValidationError[] = [];

  if (priceRange.min !== undefined) {
    if (priceRange.min < 0) {
      errors.push({
        field: 'priceRange.min',
        message: 'Minimum price must be greater than or equal to 0',
        value: priceRange.min,
      });
    }

    if (!Number.isFinite(priceRange.min)) {
      errors.push({
        field: 'priceRange.min',
        message: 'Minimum price must be a valid number',
        value: priceRange.min,
      });
    }
  }

  if (priceRange.max !== undefined) {
    if (priceRange.max <= 0) {
      errors.push({
        field: 'priceRange.max',
        message: 'Maximum price must be greater than 0',
        value: priceRange.max,
      });
    }

    if (!Number.isFinite(priceRange.max)) {
      errors.push({
        field: 'priceRange.max',
        message: 'Maximum price must be a valid number',
        value: priceRange.max,
      });
    }
  }

  if (
    priceRange.min !== undefined &&
    priceRange.max !== undefined &&
    priceRange.min >= priceRange.max
  ) {
    errors.push({
      field: 'priceRange',
      message: 'Minimum price must be less than maximum price',
      value: priceRange,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? priceRange : undefined,
  };
}

// ============================================================================
// ID ARRAY VALIDATION
// ============================================================================

/**
 * Validates an array of IDs (category or brand)
 *
 * Rules:
 * - Must be an array
 * - All values must be positive integers
 * - No duplicates
 *
 * @param ids - Array of IDs
 * @param fieldName - Field name for error messages
 * @returns Validation result
 */
export function validateIdArray(ids: unknown, fieldName: string): ValidationResult<number[]> {
  const errors: ValidationError[] = [];

  if (!Array.isArray(ids)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be an array`,
      value: ids,
    });

    return { valid: false, errors };
  }

  const validIds: number[] = [];
  const seen = new Set<number>();

  ids.forEach((id, index) => {
    if (!Number.isInteger(id) || id <= 0) {
      errors.push({
        field: `${fieldName}[${index}]`,
        message: `Invalid ID: must be a positive integer`,
        value: id,
      });
    } else if (seen.has(id)) {
      errors.push({
        field: `${fieldName}[${index}]`,
        message: `Duplicate ID: ${id}`,
        value: id,
      });
    } else {
      seen.add(id);
      validIds.push(id);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    sanitized: validIds.length > 0 ? validIds : undefined,
  };
}

// ============================================================================
// SEARCH QUERY VALIDATION
// ============================================================================

/**
 * Validates and sanitizes search query
 *
 * Rules:
 * - Must be a string
 * - Max length: 100 characters
 * - No SQL injection patterns
 * - Trims whitespace
 *
 * @param query - Search query string
 * @returns Validation result
 */
export function validateSearchQuery(query: unknown): ValidationResult<string | undefined> {
  const errors: ValidationError[] = [];

  if (typeof query !== 'string') {
    errors.push({
      field: 'searchQuery',
      message: 'Search query must be a string',
      value: query,
    });

    return { valid: false, errors };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return {
      valid: true,
      errors: [],
      sanitized: undefined, // Empty query = no filter
    };
  }

  if (trimmed.length > 100) {
    errors.push({
      field: 'searchQuery',
      message: 'Search query must be 100 characters or less',
      value: trimmed,
    });
  }

  // Check for SQL injection patterns (basic)
  const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi;
  if (sqlPatterns.test(trimmed)) {
    errors.push({
      field: 'searchQuery',
      message: 'Search query contains invalid characters',
      value: trimmed,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? trimmed : undefined,
  };
}

// ============================================================================
// COMPLETE FILTER VALIDATION
// ============================================================================

/**
 * Validates complete filter options object
 *
 * @param options - Filter options to validate
 * @returns Validation result with sanitized options
 */
export function validateFilterOptions(options: unknown): ValidationResult<FilterOptions> {
  const errors: ValidationError[] = [];
  const sanitized: FilterOptions = {};

  if (!options || typeof options !== 'object') {
    errors.push({
      field: 'filterOptions',
      message: 'Filter options must be an object',
      value: options,
    });

    return { valid: false, errors };
  }

  const opts = options as Partial<FilterOptions>;

  // Validate category IDs
  if (opts.categoryIds !== undefined) {
    const result = validateIdArray(opts.categoryIds, 'categoryIds');
    errors.push(...result.errors);
    if (result.sanitized) {
      sanitized.categoryIds = result.sanitized;
    }
  }

  // Validate brand IDs
  if (opts.brandIds !== undefined) {
    const result = validateIdArray(opts.brandIds, 'brandIds');
    errors.push(...result.errors);
    if (result.sanitized) {
      sanitized.brandIds = result.sanitized;
    }
  }

  // Validate price range
  if (opts.priceRange !== undefined) {
    const result = validatePriceRange(opts.priceRange);
    errors.push(...result.errors);
    if (result.sanitized) {
      sanitized.priceRange = result.sanitized;
    }
  }

  // Validate search query
  if (opts.searchQuery !== undefined) {
    const result = validateSearchQuery(opts.searchQuery);
    errors.push(...result.errors);
    if (result.sanitized !== undefined) {
      sanitized.searchQuery = result.sanitized;
    }
  }

  const booleanAssignments: Array<{ field: keyof FilterOptions; value: unknown }> = [
    { field: 'featured', value: opts.featured },
    { field: 'seasonal', value: opts.seasonal },
    { field: 'new_arrival', value: opts.new_arrival },
    { field: 'trending', value: opts.trending },
    { field: 'in_stock', value: opts.in_stock },
  ];

  booleanAssignments.forEach(({ field, value }) => {
    if (value !== undefined) {
      if (typeof value !== 'boolean') {
        errors.push({
          field,
          message: `${field} must be a boolean`,
          value,
        });
      } else {
        switch (field) {
          case 'featured':
            sanitized.featured = value;
            break;
          case 'seasonal':
            sanitized.seasonal = value;
            break;
          case 'new_arrival':
            sanitized.new_arrival = value;
            break;
          case 'trending':
            sanitized.trending = value;
            break;
          case 'in_stock':
            sanitized.in_stock = value;
            break;
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined,
  };
}

// ============================================================================
// FILTER COMPATIBILITY VALIDATION
// ============================================================================

/**
 * Checks if filter combination is compatible
 *
 * Some filter combinations might not make sense or conflict.
 * This function identifies such cases.
 *
 * @param options - Filter options
 * @returns Compatibility warnings
 */
export function validateFilterCompatibility(
  options: FilterOptions
): { compatible: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check for contradictory enhancement filters
  const enhancementCount = [
    options.featured,
    options.seasonal,
    options.new_arrival,
    options.trending,
  ].filter(Boolean).length;

  if (enhancementCount > 2) {
    warnings.push(
      'Selecting multiple enhancement filters may return very few results. Consider using one or two filters.'
    );
  }

  // Check for very narrow price range
  if (options.priceRange) {
    const { min, max } = options.priceRange;
    if (min !== undefined && max !== undefined && max - min < 1) {
      warnings.push('Price range is very narrow. Consider widening the range for more results.');
    }
  }

  // Check for excessive filters
  const filterCount =
    (options.categoryIds?.length || 0) +
    (options.brandIds?.length || 0) +
    (options.priceRange ? 1 : 0) +
    (options.searchQuery ? 1 : 0) +
    enhancementCount;

  if (filterCount > 5) {
    warnings.push(
      'Many filters applied. If you see no results, try removing some filters.'
    );
  }

  return {
    compatible: warnings.length === 0,
    warnings,
  };
}

// ============================================================================
// SANITIZATION HELPERS
// ============================================================================

/**
 * Removes empty/null filter values
 *
 * @param options - Filter options
 * @returns Cleaned filter options
 */
export function sanitizeFilterOptions(options: FilterOptions): FilterOptions {
  const sanitized: FilterOptions = {};

  if (options.categoryIds && options.categoryIds.length > 0) {
    sanitized.categoryIds = options.categoryIds;
  }

  if (options.brandIds && options.brandIds.length > 0) {
    sanitized.brandIds = options.brandIds;
  }

  if (options.priceRange && (options.priceRange.min !== undefined || options.priceRange.max !== undefined)) {
    sanitized.priceRange = options.priceRange;
  }

  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    sanitized.searchQuery = options.searchQuery.trim();
  }

  if (options.featured !== undefined) sanitized.featured = options.featured;
  if (options.seasonal !== undefined) sanitized.seasonal = options.seasonal;
  if (options.new_arrival !== undefined) sanitized.new_arrival = options.new_arrival;
  if (options.trending !== undefined) sanitized.trending = options.trending;
  if (options.in_stock !== undefined) sanitized.in_stock = options.in_stock;

  return sanitized;
}

/**
 * Checks if filter options are empty
 *
 * @param options - Filter options
 * @returns True if no filters applied
 */
export function isEmptyFilter(options: FilterOptions): boolean {
  const sanitized = sanitizeFilterOptions(options);
  return Object.keys(sanitized).length === 0;
}

// ============================================================================
// VALIDATION ERROR FORMATTER
// ============================================================================

/**
 * Formats validation errors into human-readable messages
 *
 * @param errors - Array of validation errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return errors[0].message;
  }

  return `${errors.length} validation errors:\n${errors.map((e, i) => `${i + 1}. ${e.field}: ${e.message}`).join('\n')}`;
}
