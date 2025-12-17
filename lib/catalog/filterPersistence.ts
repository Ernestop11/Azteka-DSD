/**
 * Catalog Filter Persistence
 *
 * localStorage wrapper for persisting customer filter preferences.
 * Supports per-customer filter state with TTL and migration.
 */

import { z } from 'zod';
import type { FilterOptions } from './filterEngine';
import { validateFilterOptions, sanitizeFilterOptions } from './filterValidation';

// ============================================================================
// PERSISTENCE SCHEMA
// ============================================================================

const PersistedFilterStateSchema = z.object({
  customerId: z.number().int().positive(),
  filters: z.record(z.unknown()),
  timestamp: z.number(),
  version: z.number().default(1),
});

type PersistedFilterState = z.infer<typeof PersistedFilterStateSchema>;

const STORAGE_KEY_PREFIX = 'azteka_filters_';
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CURRENT_VERSION = 1;

// ============================================================================
// STORAGE INTERFACE
// ============================================================================

export interface FilterPersistenceOptions {
  ttl?: number; // Time to live in milliseconds
  storageKey?: string; // Custom storage key
}

// ============================================================================
// SAVE FILTERS
// ============================================================================

/**
 * Saves filter state for a customer to localStorage
 *
 * @param customerId - Customer ID
 * @param filters - Filter options to persist
 * @param options - Persistence options
 * @returns Success boolean
 */
export function saveCustomerFilters(
  customerId: number,
  filters: FilterOptions,
  options: FilterPersistenceOptions = {}
): boolean {
  try {
    // Sanitize filters before saving
    const sanitized = sanitizeFilterOptions(filters);

    const state: PersistedFilterState = {
      customerId,
      filters: sanitized as Record<string, unknown>,
      timestamp: Date.now(),
      version: CURRENT_VERSION,
    };

    const key = options.storageKey || `${STORAGE_KEY_PREFIX}${customerId}`;
    localStorage.setItem(key, JSON.stringify(state));

    return true;
  } catch (error) {
    console.error('Failed to save customer filters:', error);
    return false;
  }
}

// ============================================================================
// LOAD FILTERS
// ============================================================================

/**
 * Loads filter state for a customer from localStorage
 *
 * @param customerId - Customer ID
 * @param options - Persistence options
 * @returns Filter options or null if not found/expired
 */
export function loadCustomerFilters(
  customerId: number,
  options: FilterPersistenceOptions = {}
): FilterOptions | null {
  try {
    const key = options.storageKey || `${STORAGE_KEY_PREFIX}${customerId}`;
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const validationResult = PersistedFilterStateSchema.safeParse(parsed);

    if (!validationResult.success) {
      console.warn('Invalid persisted filter state, clearing:', validationResult.error);
      clearCustomerFilters(customerId, options);
      return null;
    }

    const state = validationResult.data;

    // Check if expired
    const ttl = options.ttl || DEFAULT_TTL_MS;
    const age = Date.now() - state.timestamp;

    if (age > ttl) {
      console.debug('Filter state expired, clearing');
      clearCustomerFilters(customerId, options);
      return null;
    }

    // Check customer ID match
    if (state.customerId !== customerId) {
      console.warn('Customer ID mismatch, clearing');
      clearCustomerFilters(customerId, options);
      return null;
    }

    // Migrate if needed
    if (state.version < CURRENT_VERSION) {
      const migrated = migrateFilterState(state);
      saveCustomerFilters(customerId, migrated as FilterOptions, options);
      return migrated as FilterOptions;
    }

    // Validate filters before returning
    const filterValidation = validateFilterOptions(state.filters);
    if (!filterValidation.valid) {
      console.warn('Invalid filter data, clearing:', filterValidation.errors);
      clearCustomerFilters(customerId, options);
      return null;
    }

    return (filterValidation.sanitized as FilterOptions | undefined) || null;
  } catch (error) {
    console.error('Failed to load customer filters:', error);
    return null;
  }
}

// ============================================================================
// CLEAR FILTERS
// ============================================================================

/**
 * Clears saved filter state for a customer
 *
 * @param customerId - Customer ID
 * @param options - Persistence options
 * @returns Success boolean
 */
export function clearCustomerFilters(
  customerId: number,
  options: FilterPersistenceOptions = {}
): boolean {
  try {
    const key = options.storageKey || `${STORAGE_KEY_PREFIX}${customerId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear customer filters:', error);
    return false;
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Gets all persisted filter states (all customers)
 *
 * @returns Array of customer IDs with saved filters
 */
export function getAllPersistedCustomers(): number[] {
  const customerIds: number[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const idStr = key.replace(STORAGE_KEY_PREFIX, '');
        const id = parseInt(idStr, 10);
        if (!isNaN(id)) {
          customerIds.push(id);
        }
      }
    }
  } catch (error) {
    console.error('Failed to get persisted customers:', error);
  }

  return customerIds;
}

/**
 * Clears all persisted filter states
 *
 * @returns Number of states cleared
 */
export function clearAllPersistedFilters(): number {
  const customerIds = getAllPersistedCustomers();
  let cleared = 0;

  customerIds.forEach((id) => {
    if (clearCustomerFilters(id)) {
      cleared++;
    }
  });

  return cleared;
}

/**
 * Clears expired filter states
 *
 * @param ttl - Time to live in milliseconds
 * @returns Number of expired states cleared
 */
export function clearExpiredFilters(ttl: number = DEFAULT_TTL_MS): number {
  const customerIds = getAllPersistedCustomers();
  let cleared = 0;

  customerIds.forEach((id) => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${id}`;
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);
        const age = Date.now() - (parsed.timestamp || 0);

        if (age > ttl) {
          clearCustomerFilters(id);
          cleared++;
        }
      }
    } catch (error) {
      console.error(`Failed to check expiry for customer ${id}:`, error);
    }
  });

  return cleared;
}

// ============================================================================
// MIGRATION
// ============================================================================

/**
 * Migrates filter state from old version to current
 *
 * @param state - Old filter state
 * @returns Migrated filter state
 */
function migrateFilterState(state: PersistedFilterState): Record<string, unknown> {
  // Currently only version 1 exists, but this is where you'd handle migrations
  // Example:
  // if (state.version === 0) {
  //   // Migrate v0 -> v1
  //   return { ...state.filters, newField: defaultValue };
  // }

  return state.filters;
}

// ============================================================================
// METADATA
// ============================================================================

export interface FilterPersistenceMetadata {
  customerId: number;
  lastSaved: Date;
  age: number; // milliseconds
  filterCount: number;
  version: number;
}

/**
 * Gets metadata about persisted filter state
 *
 * @param customerId - Customer ID
 * @param options - Persistence options
 * @returns Metadata or null if not found
 */
export function getFilterMetadata(
  customerId: number,
  options: FilterPersistenceOptions = {}
): FilterPersistenceMetadata | null {
  try {
    const key = options.storageKey || `${STORAGE_KEY_PREFIX}${customerId}`;
    const stored = localStorage.getItem(key);

    if (!stored) return null;

    const parsed = JSON.parse(stored);
    const validationResult = PersistedFilterStateSchema.safeParse(parsed);

    if (!validationResult.success) return null;

    const state = validationResult.data;
    const filterCount = Object.keys(state.filters).length;

    return {
      customerId: state.customerId,
      lastSaved: new Date(state.timestamp),
      age: Date.now() - state.timestamp,
      filterCount,
      version: state.version,
    };
  } catch (error) {
    console.error('Failed to get filter metadata:', error);
    return null;
  }
}

// ============================================================================
// EXPORT/IMPORT (for debugging/testing)
// ============================================================================

/**
 * Exports all filter states as JSON
 *
 * @returns JSON string of all filter states
 */
export function exportAllFilters(): string {
  const allStates: Record<number, PersistedFilterState> = {};

  getAllPersistedCustomers().forEach((id) => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        allStates[id] = JSON.parse(stored);
      }
    } catch (error) {
      console.error(`Failed to export filters for customer ${id}:`, error);
    }
  });

  return JSON.stringify(allStates, null, 2);
}

/**
 * Imports filter states from JSON
 *
 * @param json - JSON string of filter states
 * @returns Number of states imported
 */
export function importFilters(json: string): number {
  let imported = 0;

  try {
    const allStates = JSON.parse(json) as Record<number, PersistedFilterState>;

    Object.entries(allStates).forEach(([idStr, state]) => {
      const id = parseInt(idStr, 10);
      if (!isNaN(id) && state.filters) {
        saveCustomerFilters(id, state.filters as FilterOptions);
        imported++;
      }
    });
  } catch (error) {
    console.error('Failed to import filters:', error);
  }

  return imported;
}

// ============================================================================
// STORAGE SIZE UTILITIES
// ============================================================================

/**
 * Gets approximate size of persisted filters in bytes
 *
 * @returns Size in bytes
 */
export function getFilterStorageSize(): number {
  let totalSize = 0;

  getAllPersistedCustomers().forEach((id) => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        totalSize += new Blob([stored]).size;
      }
    } catch (error) {
      console.error(`Failed to calculate size for customer ${id}:`, error);
    }
  });

  return totalSize;
}

/**
 * Checks if localStorage is available and has space
 *
 * @returns True if storage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__azteka_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('localStorage not available:', error);
    return false;
  }
}
