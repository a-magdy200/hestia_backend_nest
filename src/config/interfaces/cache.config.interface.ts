import { CacheType } from '../enums/environment.enum';

/**
 * Cache configuration interface
 * Defines the structure for cache-related configuration
 */
export interface CacheConfig {
  type: CacheType;
  ttl: number;
  maxItems: number;
  redis?: RedisConfig;
  memory?: MemoryConfig;
}

/**
 * Redis configuration interface
 * Defines the structure for Redis-specific configuration
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  maxMemoryPolicy?: string;
  lazyConnect?: boolean;
  keepAlive?: number;
  family?: number;
  noDelay?: boolean;
  connectionName?: string;
  readOnly?: boolean;
  stringNumbers?: boolean;
  maxLoadingTimeout?: number;
  autoResubscribe?: boolean;
  autoResendUnfulfilledCommands?: boolean;
  scripts?: Record<string, string>;
}

/**
 * Memory cache configuration interface
 * Defines the structure for memory cache configuration
 */
export interface MemoryConfig {
  maxSize: number;
  ttl: number;
  updateAgeOnGet: boolean;
  allowStale: boolean;
  noDisposeOnSet: boolean;
  dispose: (key: string, value: unknown) => void;
}
