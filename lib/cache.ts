type CacheEntry<T> = {
  value: T
  expiresAt: number
}

class LRUNode {
  key: string

  constructor(key: string) {
    this.key = key
  }
}

export class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>()

  private order = new Map<string, LRUNode>()

  constructor(private readonly maxSize = 200) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      return undefined
    }

    this.touch(key)
    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs = 60_000) {
    const expiresAt = Date.now() + ttlMs
    this.store.set(key, { value, expiresAt })
    this.touch(key)
    this.evictIfNeeded()
  }

  delete(key: string) {
    this.store.delete(key)
    this.order.delete(key)
  }

  clear() {
    this.store.clear()
    this.order.clear()
  }

  private touch(key: string) {
    if (this.order.has(key)) {
      this.order.delete(key)
    }
    this.order.set(key, new LRUNode(key))
  }

  private evictIfNeeded() {
    while (this.order.size > this.maxSize) {
      const oldestKey = this.order.keys().next().value
      if (!oldestKey) break
      this.order.delete(oldestKey)
      this.store.delete(oldestKey)
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __catalogCache__: TTLCache | undefined
}

export const catalogCache =
  global.__catalogCache__ ?? new TTLCache(typeof process !== 'undefined' && process.env.NODE_ENV === 'production' ? 500 : 200)

if (!global.__catalogCache__) {
  global.__catalogCache__ = catalogCache
}
