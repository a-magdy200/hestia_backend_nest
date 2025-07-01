import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

import { CacheConfigService } from '../config/services/cache-config.service';

/**
 * Cache service for application caching
 * Provides multi-layer caching with Redis and memory fallback
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryCache = new Map<string, { value: unknown; expires: number }>();
  private readonly defaultTTL = 300; // 5 minutes in seconds
  private redisClient: Redis | null = null;
  private readonly hitCount = new Map<string, number>();
  private readonly missCount = new Map<string, number>();

  constructor(private readonly cacheConfigService: CacheConfigService) {
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    if (!this.cacheConfigService.isRedisCache) {
      this.logger.debug('Redis cache is disabled, using memory cache only');
      return;
    }

    try {
      const redisConfig = this.cacheConfigService.redis;
      if (!redisConfig) {
        this.logger.warn('Redis configuration not found, using memory cache only');
        return;
      }

      const redisOptions = this.buildRedisOptions(
        redisConfig as unknown as Record<string, unknown>,
      );
      this.redisClient = new Redis(redisOptions);

      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.redisClient.on('error', error => {
        this.logger.error('Redis client error:', error);
      });

      this.redisClient.on('close', () => {
        this.logger.warn('Redis client connection closed');
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.log('Redis client reconnecting...');
      });

      this.logger.log('Redis client initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', error);
      this.redisClient = null;
    }
  }

  private buildRedisOptions(redisConfig: Record<string, unknown>): RedisOptions {
    const options: RedisOptions = {
      host: (redisConfig['host'] as string) ?? 'localhost',
      port: (redisConfig['port'] as number) ?? 6379,
      db: (redisConfig['db'] as number) ?? 0,
    };

    this.addBasicOptions(options, redisConfig);
    this.addAdvancedOptions(options, redisConfig);
    this.addOptionalStringOptions(options, redisConfig);

    return options;
  }

  private addBasicOptions(options: RedisOptions, redisConfig: Record<string, unknown>): void {
    options.maxRetriesPerRequest = (redisConfig['maxRetriesPerRequest'] as number) ?? 3;
    options.enableReadyCheck = (redisConfig['enableReadyCheck'] as boolean) !== false;
    options.lazyConnect = (redisConfig['lazyConnect'] as boolean) ?? false;
    options.keepAlive = (redisConfig['keepAlive'] as number) ?? 30000;
  }

  private addAdvancedOptions(options: RedisOptions, redisConfig: Record<string, unknown>): void {
    options.family = (redisConfig['family'] as number) ?? 4;
    options.noDelay = (redisConfig['noDelay'] as boolean) !== false;
    options.readOnly = (redisConfig['readOnly'] as boolean) ?? false;
    options.stringNumbers = (redisConfig['stringNumbers'] as boolean) ?? false;
    options.autoResubscribe = (redisConfig['autoResubscribe'] as boolean) !== false;
    options.autoResendUnfulfilledCommands =
      (redisConfig['autoResendUnfulfilledCommands'] as boolean) !== false;
  }

  private addOptionalStringOptions(
    options: RedisOptions,
    redisConfig: Record<string, unknown>,
  ): void {
    if (typeof redisConfig['password'] === 'string') {
      options.password = redisConfig['password'];
    }
    if (typeof redisConfig['keyPrefix'] === 'string') {
      options.keyPrefix = redisConfig['keyPrefix'];
    }
    if (typeof redisConfig['connectionName'] === 'string') {
      options.connectionName = redisConfig['connectionName'];
    }
  }

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
        this.incrementHitCount('memory');
        this.logger.debug(`Cache hit (memory): ${key}`);
        return memoryResult;
      }

      // Check Redis cache
      const redisResult = await this.getFromRedis<T>(key);
      if (redisResult !== null) {
        // Store in memory cache for faster subsequent access
        this.setInMemory(key, redisResult, this.defaultTTL);
        this.incrementHitCount('redis');
        this.logger.debug(`Cache hit (Redis): ${key}`);
        return redisResult;
      }

      this.incrementMissCount('total');
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
   * Get value from Redis cache
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  private async getFromRedis<T>(key: string): Promise<T | null> {
    if (!this.redisClient) {
      return null;
    }

    try {
      const value = await this.redisClient.get(key);
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in Redis cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds
   */
  private async setInRedis<T>(key: string, value: T, ttl: number): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.redisClient.setex(key, ttl, serializedValue);
    } catch (error) {
      this.logger.error(`Redis set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from Redis cache
   * @param key - Cache key
   */
  private async deleteFromRedis(key: string): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    if (typeof key !== 'string') {
      this.logger.error('Cache delete error: key is not a string');
      return;
    }

    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error(`Redis delete error for key ${key}:`, error);
    }
  }

  /**
   * Check if key exists in Redis cache
   * @param key - Cache key
   * @returns True if key exists
   */
  private async existsInRedis(key: string): Promise<boolean> {
    if (!this.redisClient) {
      return false;
    }

    if (typeof key !== 'string') {
      this.logger.error('Cache exists error: key is not a string');
      return false;
    }

    try {
      const exists = await this.redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Redis exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear Redis cache
   */
  private async clearRedis(): Promise<void> {
    if (!this.redisClient) {
      return;
    }

    try {
      await this.redisClient.flushdb();
    } catch (error) {
      this.logger.error('Redis clear error:', error);
    }
  }

  /**
   * Get Redis cache statistics
   * @returns Redis cache statistics or null
   */
  private async getRedisStats(): Promise<{ size: number; keys: number } | null> {
    if (!this.redisClient) {
      return null;
    }

    try {
      const info = await this.redisClient.info('memory');
      const dbSize = await this.redisClient.dbsize();

      // Parse memory info to get used memory
      const usedMemoryMatch = info.match(/used_memory_human:(\S+)/);
      const usedMemory = usedMemoryMatch?.[1] ?? '0B';

      return {
        size: this.parseMemorySize(usedMemory),
        keys: dbSize,
      };
    } catch (error) {
      this.logger.error('Redis stats error:', error);
      return null;
    }
  }

  /**
   * Parse memory size string to bytes
   * @param memoryString - Memory size string (e.g., "1.5M", "2G")
   * @returns Size in bytes
   */
  private parseMemorySize(memoryString: string): number {
    const match = memoryString.match(/^(\d+(?:\.\d+)?)([KMGT]?B?)$/);
    if (!match || !match[1] || !match[2]) {
      return 0;
    }

    const value = parseFloat(match[1] || '0');
    const unit = (match[2] || '').toUpperCase();

    return this.convertToBytes(value, unit);
  }

  /**
   * Convert value to bytes based on unit
   * @param value - Numeric value
   * @param unit - Unit (KB, MB, GB, TB)
   * @returns Size in bytes
   */
  private convertToBytes(value: number, unit: string): number {
    const multipliers: Record<string, number> = {
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
    };

    const multiplier = multipliers[unit] || 1;
    return Math.round(value * multiplier);
  }

  /**
   * Calculate cache hit rate
   * @returns Hit rate percentage
   */
  private calculateHitRate(): number {
    const totalHits = Array.from(this.hitCount.values()).reduce((sum, count) => sum + count, 0);
    const totalMisses = Array.from(this.missCount.values()).reduce((sum, count) => sum + count, 0);
    const totalRequests = totalHits + totalMisses;

    if (totalRequests === 0) {
      return 0;
    }

    return Math.round((totalHits / totalRequests) * 100);
  }

  /**
   * Increment hit count for cache type
   * @param cacheType - Type of cache (memory, redis, total)
   */
  private incrementHitCount(cacheType: string): void {
    const current = this.hitCount.get(cacheType) || 0;
    this.hitCount.set(cacheType, current + 1);
  }

  /**
   * Increment miss count for cache type
   * @param cacheType - Type of cache (memory, redis, total)
   */
  private incrementMissCount(cacheType: string): void {
    const current = this.missCount.get(cacheType) || 0;
    this.missCount.set(cacheType, current + 1);
  }

  /**
   * Generate cache key with prefix
   * @param prefix - Key prefix
   * @param parts - Key parts
   * @returns Generated cache key
   */
  static generateKey(prefix: string, ...parts: (string | undefined)[]): string {
    return `${prefix}:${parts.filter((p): p is string => typeof p === 'string').join(':')}`;
  }

  /**
   * Generate cache key for user data
   * @param userId - User ID
   * @param dataType - Type of user data
   * @returns Generated cache key
   */
  static userKey(userId: string | undefined, dataType: string | undefined): string {
    return this.generateKey('user', userId ?? 'unknown', dataType ?? 'unknown');
  }

  /**
   * Generate cache key for recipe data
   * @param recipeId - Recipe ID
   * @param dataType - Type of recipe data
   * @returns Generated cache key
   */
  static recipeKey(recipeId: string | undefined, dataType: string | undefined): string {
    return this.generateKey('recipe', recipeId ?? 'unknown', dataType ?? 'unknown');
  }

  /**
   * Generate cache key for ingredient data
   * @param ingredientId - Ingredient ID
   * @param dataType - Type of ingredient data
   * @returns Generated cache key
   */
  static ingredientKey(ingredientId: string | undefined, dataType: string | undefined): string {
    return this.generateKey('ingredient', ingredientId ?? 'unknown', dataType ?? 'unknown');
  }

  /**
   * Generate cache key for shopping list data
   * @param listId - Shopping list ID
   * @param dataType - Type of shopping list data
   * @returns Generated cache key
   */
  static shoppingListKey(listId: string | undefined, dataType: string | undefined): string {
    return this.generateKey('shopping_list', listId ?? 'unknown', dataType ?? 'unknown');
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('Redis client disconnected');
    }
  }
}
