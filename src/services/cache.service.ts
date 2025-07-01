import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Cache service for application caching
 * Provides multi-layer caching with Redis and memory fallback
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryCache = new Map<string, { value: any; expires: number }>();
  private readonly defaultTTL = 300; // 5 minutes in seconds

  constructor(private readonly configService: ConfigService) {}

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memoryResult = this.getFromMemory<T>(key);
      if (memoryResult !== null) {
        this.logger.debug(`Cache hit (memory): ${key}`);
        return memoryResult;
      }

      // Check Redis cache (placeholder for Redis implementation)
      const redisResult = await this.getFromRedis<T>(key);
      if (redisResult !== null) {
        // Store in memory cache for faster subsequent access
        this.setInMemory(key, redisResult, this.defaultTTL);
        this.logger.debug(`Cache hit (Redis): ${key}`);
        return redisResult;
      }

      this.logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds (default: 5 minutes)
   */
  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      // Set in both memory and Redis
      this.setInMemory(key, value, ttl);
      await this.setInRedis(key, value, ttl);

      this.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      this.deleteFromMemory(key);
      await this.deleteFromRedis(key);

      this.logger.debug(`Cache delete: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Check if key exists in cache
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  async exists(key: string): Promise<boolean> {
    try {
      // Check memory cache
      if (this.existsInMemory(key)) {
        return true;
      }

      // Check Redis cache
      return await this.existsInRedis(key);
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get multiple values from cache
   * @param keys - Array of cache keys
   * @returns Object with key-value pairs for found items
   */
  async mget<T>(keys: string[]): Promise<Record<string, T>> {
    const result: Record<string, T> = {};

    try {
      for (const key of keys) {
        const value = await this.get<T>(key);
        if (value !== null) {
          result[key] = value;
        }
      }

      this.logger.debug(`Cache mget: ${keys.length} keys, ${Object.keys(result).length} found`);
      return result;
    } catch (error) {
      this.logger.error(`Cache mget error:`, error);
      return result;
    }
  }

  /**
   * Set multiple values in cache
   * @param data - Object with key-value pairs
   * @param ttl - Time to live in seconds (default: 5 minutes)
   */
  async mset<T>(data: Record<string, T>, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const promises = Object.entries(data).map(([key, value]) => this.set(key, value, ttl));

      await Promise.all(promises);
      this.logger.debug(`Cache mset: ${Object.keys(data).length} keys`);
    } catch (error) {
      this.logger.error(`Cache mset error:`, error);
    }
  }

  /**
   * Delete multiple keys from cache
   * @param keys - Array of cache keys
   */
  async mdelete(keys: string[]): Promise<void> {
    try {
      const promises = keys.map(key => this.delete(key));
      await Promise.all(promises);

      this.logger.debug(`Cache mdelete: ${keys.length} keys`);
    } catch (error) {
      this.logger.error(`Cache mdelete error:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      this.clearMemory();
      await this.clearRedis();

      this.logger.debug('Cache cleared');
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  async getStats(): Promise<{
    memorySize: number;
    memoryKeys: number;
    redisSize?: number;
    redisKeys?: number;
    hitRate: number;
  }> {
    try {
      const memoryStats = this.getMemoryStats();
      const redisStats = await this.getRedisStats();

      return {
        memorySize: memoryStats.size,
        memoryKeys: memoryStats.keys,
        ...(redisStats && { redisSize: redisStats.size, redisKeys: redisStats.keys }),
        hitRate: this.calculateHitRate(),
      };
    } catch (error) {
      this.logger.error('Cache stats error:', error);
      return {
        memorySize: 0,
        memoryKeys: 0,
        hitRate: 0,
      };
    }
  }

  /**
   * Get value from memory cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) {
      return null;
    }

    if (Date.now() > item.expires) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Set value in memory cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds
   */
  private setInMemory<T>(key: string, value: T, ttl: number): void {
    const expires = Date.now() + ttl * 1000;
    this.memoryCache.set(key, { value, expires });
  }

  /**
   * Delete value from memory cache
   * @param key - Cache key
   */
  private deleteFromMemory(key: string): void {
    this.memoryCache.delete(key);
  }

  /**
   * Check if key exists in memory cache
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  private existsInMemory(key: string): boolean {
    const item = this.memoryCache.get(key);
    if (!item) {
      return false;
    }

    if (Date.now() > item.expires) {
      this.memoryCache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear memory cache
   */
  private clearMemory(): void {
    this.memoryCache.clear();
  }

  /**
   * Get memory cache statistics
   * @returns Memory cache statistics
   */
  private getMemoryStats(): { size: number; keys: number } {
    // Clean expired items
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expires) {
        this.memoryCache.delete(key);
      }
    }

    return {
      size: this.memoryCache.size,
      keys: this.memoryCache.size,
    };
  }

  /**
   * Get value from Redis cache (placeholder implementation)
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  private async getFromRedis<T>(key: string): Promise<T | null> {
    // TODO: Implement Redis connection and get operation
    // For now, return null as placeholder
    return null;
  }

  /**
   * Set value in Redis cache (placeholder implementation)
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds
   */
  private async setInRedis<T>(key: string, value: T, ttl: number): Promise<void> {
    // TODO: Implement Redis connection and set operation
    // For now, do nothing as placeholder
  }

  /**
   * Delete value from Redis cache (placeholder implementation)
   * @param key - Cache key
   */
  private async deleteFromRedis(key: string): Promise<void> {
    // TODO: Implement Redis connection and delete operation
    // For now, do nothing as placeholder
  }

  /**
   * Check if key exists in Redis cache (placeholder implementation)
   * @param key - Cache key
   * @returns True if key exists
   */
  private async existsInRedis(key: string): Promise<boolean> {
    // TODO: Implement Redis connection and exists operation
    // For now, return false as placeholder
    return false;
  }

  /**
   * Clear Redis cache (placeholder implementation)
   */
  private async clearRedis(): Promise<void> {
    // TODO: Implement Redis connection and clear operation
    // For now, do nothing as placeholder
  }

  /**
   * Get Redis cache statistics (placeholder implementation)
   * @returns Redis cache statistics or null
   */
  private async getRedisStats(): Promise<{ size: number; keys: number } | null> {
    // TODO: Implement Redis connection and stats operation
    // For now, return null as placeholder
    return null;
  }

  /**
   * Calculate cache hit rate (placeholder implementation)
   * @returns Hit rate percentage
   */
  private calculateHitRate(): number {
    // TODO: Implement hit rate calculation with counters
    // For now, return 0 as placeholder
    return 0;
  }

  /**
   * Generate cache key with prefix
   * @param prefix - Key prefix
   * @param parts - Key parts
   * @returns Generated cache key
   */
  static generateKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Generate cache key for user data
   * @param userId - User ID
   * @param dataType - Type of user data
   * @returns Generated cache key
   */
  static userKey(userId: string, dataType: string): string {
    return this.generateKey('user', userId, dataType);
  }

  /**
   * Generate cache key for recipe data
   * @param recipeId - Recipe ID
   * @param dataType - Type of recipe data
   * @returns Generated cache key
   */
  static recipeKey(recipeId: string, dataType: string): string {
    return this.generateKey('recipe', recipeId, dataType);
  }

  /**
   * Generate cache key for ingredient data
   * @param ingredientId - Ingredient ID
   * @param dataType - Type of ingredient data
   * @returns Generated cache key
   */
  static ingredientKey(ingredientId: string, dataType: string): string {
    return this.generateKey('ingredient', ingredientId, dataType);
  }

  /**
   * Generate cache key for shopping list data
   * @param listId - Shopping list ID
   * @param dataType - Type of shopping list data
   * @returns Generated cache key
   */
  static shoppingListKey(listId: string, dataType: string): string {
    return this.generateKey('shopping_list', listId, dataType);
  }
}
