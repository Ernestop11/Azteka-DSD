type CacheEntry<T> = {
  key: string;
  value: T;
};

export class LruCache<T> {
  private entries: CacheEntry<T>[] = [];

  constructor(private limit = 10) {}

  get(key: string) {
    const index = this.entries.findIndex(entry => entry.key === key);
    if (index === -1) return undefined;
    const entry = this.entries.splice(index, 1)[0];
    this.entries.unshift(entry);
    return entry.value;
  }

  set(key: string, value: T) {
    const existingIndex = this.entries.findIndex(entry => entry.key === key);
    if (existingIndex >= 0) {
      this.entries.splice(existingIndex, 1);
    }
    this.entries.unshift({ key, value });
    if (this.entries.length > this.limit) this.entries.pop();
  }

  clear() {
    this.entries = [];
  }
}

const gridCache = new LruCache<any>(5);
const heroCache = new LruCache<any>(3);
const categoryCache = new LruCache<any>(5);

export const catalogCache = {
  getGrid: (key: string) => gridCache.get(key),
  setGrid: (key: string, value: any) => gridCache.set(key, value),
  getHero: (key: string) => heroCache.get(key),
  setHero: (key: string, value: any) => heroCache.set(key, value),
  getCategoryRow: (key: string) => categoryCache.get(key),
  setCategoryRow: (key: string, value: any) => categoryCache.set(key, value),
  invalidateAll() {
    gridCache.clear();
    heroCache.clear();
    categoryCache.clear();
  },
};
