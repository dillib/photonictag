import Redis from "ioredis";

// Redis client configuration
const redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL;

let redis: Redis | null = null;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

  redis.on("connect", () => {
    console.log("[Cache] Redis connected");
  });

  redis.on("error", (err) => {
    console.error("[Cache] Redis error:", err.message);
  });
} else {
  console.log("[Cache] Redis not configured, using memory fallback");
}

// In-memory fallback for development
const memoryCache = new Map<string, { value: any; expiry: number }>();

/**
 * Cache Service
 * Provides caching with Redis (production) or in-memory (development)
 */
export class CacheService {
  private static instance: CacheService;
  private readonly DEFAULT_TTL = 300; // 5 minutes

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (redis) {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
      }

      // Memory fallback
      const item = memoryCache.get(key);
      if (item && item.expiry > Date.now()) {
        return item.value;
      }
      memoryCache.delete(key);
      return null;
    } catch (error) {
      console.error("[Cache] Get error:", error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = this.DEFAULT_TTL): Promise<void> {
    try {
      if (redis) {
        await redis.setex(key, ttlSeconds, JSON.stringify(value));
        return;
      }

      // Memory fallback
      memoryCache.set(key, {
        value,
        expiry: Date.now() + ttlSeconds * 1000,
      });
    } catch (error) {
      console.error("[Cache] Set error:", error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      if (redis) {
        await redis.del(key);
        return;
      }

      // Memory fallback
      memoryCache.delete(key);
    } catch (error) {
      console.error("[Cache] Delete error:", error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      if (redis) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        return;
      }

      // Memory fallback - delete keys matching pattern
      const regex = new RegExp(pattern.replace("*", ".*"));
      const keys = Array.from(memoryCache.keys()); // Fix iteration
      for (const key of keys) {
        if (regex.test(key)) {
          memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.error("[Cache] Delete pattern error:", error);
    }
  }

  // ... (other methods)

  /**
   * Generate cache key
   */
  generateKey(prefix: string, identifier: string): string { // Removed static
    return `photonictag:${prefix}:${identifier}`;
  }
}

export const cacheService = CacheService.getInstance();
