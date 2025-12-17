import type { OfflineCacheSchema } from './offlineCacheSchema';

const STORAGE_KEY = 'azteka-offline-cache';

const defaultCache: OfflineCacheSchema = {
  version: 1,
  cart: [],
  customerPrefs: [],
  productSnapshots: [],
};

export const offlineDB = {
  read(): OfflineCacheSchema {
    if (typeof localStorage === 'undefined') return defaultCache;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCache;
    try {
      return JSON.parse(raw) as OfflineCacheSchema;
    } catch {
      return defaultCache;
    }
  },
  write(cache: OfflineCacheSchema) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  },
};
