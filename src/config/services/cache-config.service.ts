import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CacheType } from '../enums/environment.enum';
import { CacheConfig } from '../interfaces/cache.config.interface';

/**
 * Cache configuration service
 * Provides centralized access to cache configuration values
 */
@Injectable()
export class CacheConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get cache configuration
   * @returns Cache configuration object
   */
  get cache(): CacheConfig {
    const cacheConfig = this.configService.get<CacheConfig>('cache');
    if (!cacheConfig) {
      throw new Error('Cache configuration is not defined');
    }
    return cacheConfig;
  }

  /**
   * Get cache type
   * @returns Cache type
   */
  get type(): CacheType {
    return this.cache.type;
  }

  /**
   * Get cache TTL
   * @returns Cache TTL in seconds
   */
  get ttl(): number {
    return this.cache.ttl;
  }

  /**
   * Get maximum cache items
   * @returns Maximum cache items
   */
  get maxItems(): number {
    return this.cache.maxItems;
  }

  /**
   * Get Redis configuration
   * @returns Redis configuration
   */
  get redis(): CacheConfig['redis'] {
    return this.cache.redis;
  }

  /**
   * Get memory cache configuration
   * @returns Memory cache configuration
   */
  get memory(): CacheConfig['memory'] {
    return this.cache.memory;
  }

  /**
   * Check if Redis cache is enabled
   * @returns True if Redis cache is enabled
   */
  get isRedisCache(): boolean {
    return this.type === CacheType.REDIS;
  }

  /**
   * Check if memory cache is enabled
   * @returns True if memory cache is enabled
   */
  get isMemoryCache(): boolean {
    return this.type === CacheType.MEMORY;
  }

  /**
   * Check if cache is disabled
   * @returns True if cache is disabled
   */
  get isCacheDisabled(): boolean {
    return this.type === CacheType.NONE;
  }

  /**
   * Get Redis host
   * @returns Redis host
   */
  get redisHost(): string {
    return this.redis?.host || 'localhost';
  }

  /**
   * Get Redis port
   * @returns Redis port
   */
  get redisPort(): number {
    return this.redis?.port || 6379;
  }

  /**
   * Get Redis database number
   * @returns Redis database number
   */
  get redisDb(): number {
    return this.redis?.db || 0;
  }

  /**
   * Get Redis password
   * @returns Redis password
   */
  get redisPassword(): string | undefined {
    return this.redis?.password;
  }

  /**
   * Get Redis key prefix
   * @returns Redis key prefix
   */
  get redisKeyPrefix(): string {
    return this.redis?.keyPrefix || 'hestia:';
  }

  /**
   * Get memory cache max size
   * @returns Memory cache max size
   */
  get memoryMaxSize(): number {
    return this.memory?.maxSize || 1000;
  }

  /**
   * Get memory cache TTL
   * @returns Memory cache TTL in milliseconds
   */
  get memoryTtl(): number {
    return this.memory?.ttl || 3600000;
  }
}
