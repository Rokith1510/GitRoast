/**
 * Simple in-memory TTL cache with LRU eviction for GitHub API requests.
 */

class MemoryCache {
  constructor(defaultTtlSeconds = 900, maxEntries = 200) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
    this.maxEntries = maxEntries;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Refresh position for LRU
    this.store.delete(key);
    this.store.set(key, entry);

    return entry.value;
  }

  set(key, value, ttlSeconds) {
    const ttlMs = (ttlSeconds !== undefined ? ttlSeconds : (this.defaultTtlMs / 1000)) * 1000;
    
    // Evict oldest if exceeding limit
    if (this.store.size >= this.maxEntries) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now()
    });
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  size() {
    // Clean expired first
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (now > v.expiresAt) {
        this.store.delete(k);
      }
    }
    return this.store.size;
  }
}

// Singleton cache instance
const defaultTtl = parseInt(process.env.CACHE_TTL_SECONDS || '900', 10);
const apiCache = new MemoryCache(defaultTtl);

module.exports = {
  MemoryCache,
  apiCache
};

