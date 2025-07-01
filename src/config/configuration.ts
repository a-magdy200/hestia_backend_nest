import { registerAs } from '@nestjs/config';

import { createAwsConfig } from './aws.config';
import { createEmailConfig } from './email.config';
import {
  Environment,
  LogLevel,
  DatabaseType,
  CacheType,
  AuthStrategy,
  RateLimitStrategy,
  EnvVar,
} from './enums/environment.enum';
import { validateProcessEnv } from './environment.validation';
import { AppConfig, RateLimitConfig } from './interfaces/app.config.interface';
import { AuthConfig } from './interfaces/auth.config.interface';
import { CacheConfig, RedisConfig, MemoryConfig } from './interfaces/cache.config.interface';
import { DatabaseConfig } from './interfaces/database.config.interface';
import { getString, getNumber, getBoolean } from './utils/env.util';

/**
 * Create application configuration
 * @returns Application configuration object
 */
const createAppConfig = (): AppConfig => ({
  environment: (getString(EnvVar.NODE_ENV) as Environment) || Environment.DEVELOPMENT,
  port: getNumber(EnvVar.PORT, 3000),
  host: getString(EnvVar.HOST, 'localhost'),
  name: getString(EnvVar.APP_NAME, 'Hestia Backend'),
  version: getString(EnvVar.APP_VERSION, '1.0.0'),
  description: getString(EnvVar.APP_DESCRIPTION, 'Hestia Backend API'),
  logLevel: (getString(EnvVar.LOG_LEVEL) as LogLevel) || LogLevel.INFO,
  enableSwagger: getBoolean(EnvVar.ENABLE_SWAGGER, true),
  enableMetrics: getBoolean(EnvVar.ENABLE_METRICS, true),
  enableCors: getBoolean(EnvVar.ENABLE_CORS, true),
  corsOrigin: getString(EnvVar.CORS_ORIGIN, '*'),
  globalPrefix: getString(EnvVar.GLOBAL_PREFIX, 'api'),
  timeout: getNumber(EnvVar.TIMEOUT, 30000),
  maxPayloadSize: getString(EnvVar.MAX_PAYLOAD_SIZE, '10mb'),
});

/**
 * Create database configuration
 * @returns Database configuration object
 */
const createDatabaseConfig = (): DatabaseConfig => {
  const config: DatabaseConfig = {
    type: (getString(EnvVar.DB_TYPE) as DatabaseType) || DatabaseType.POSTGRES,
    host: getString(EnvVar.DB_HOST, 'localhost'),
    port: getNumber(EnvVar.DB_PORT, 5432),
    username: getString(EnvVar.DB_USERNAME, 'postgres'),
    password: getString(EnvVar.DB_PASSWORD, ''),
    database: getString(EnvVar.DB_DATABASE, 'hestia'),
    url: getString(EnvVar.DATABASE_URL, ''),
    ssl: getBoolean(EnvVar.DB_SSL, false),
    synchronize: getString(EnvVar.NODE_ENV) === Environment.DEVELOPMENT,
    logging: getString(EnvVar.NODE_ENV) === Environment.DEVELOPMENT,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    subscribers: ['dist/subscribers/*{.ts,.js}'],
    maxConnections: getNumber(EnvVar.DB_MAX_CONNECTIONS, 10),
    connectionTimeout: getNumber(EnvVar.DB_CONNECTION_TIMEOUT, 60000),
    acquireTimeout: getNumber(EnvVar.DB_ACQUIRE_TIMEOUT, 60000),
    timeout: getNumber(EnvVar.DB_TIMEOUT, 30000),
    poolSize: getNumber(EnvVar.DB_POOL_SIZE, 10),
  };

  return config;
};

/**
 * Create OAuth providers configuration
 * @returns OAuth providers configuration object
 */
const createOAuthProviders = (): Record<
  string,
  {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    scope: string[];
  }
> => ({
  google: {
    clientId: getString(EnvVar.GOOGLE_CLIENT_ID, ''),
    clientSecret: getString(EnvVar.GOOGLE_CLIENT_SECRET, ''),
    callbackUrl: getString(EnvVar.GOOGLE_CALLBACK_URL, ''),
    scope: ['email', 'profile'],
  },
  github: {
    clientId: getString(EnvVar.GITHUB_CLIENT_ID, ''),
    clientSecret: getString(EnvVar.GITHUB_CLIENT_SECRET, ''),
    callbackUrl: getString(EnvVar.GITHUB_CALLBACK_URL, ''),
    scope: ['user:email'],
  },
});

/**
 * Create authentication configuration
 * @returns Authentication configuration object
 */
const createAuthConfig = (): AuthConfig => ({
  strategy: (getString(EnvVar.AUTH_STRATEGY) as AuthStrategy) || AuthStrategy.JWT,
  jwtSecret: getString(EnvVar.JWT_SECRET, 'your-secret-key'),
  jwtExpiresIn: getString(EnvVar.JWT_EXPIRES_IN, '1h'),
  jwtRefreshExpiresIn: getString(EnvVar.JWT_REFRESH_EXPIRES_IN, '7d'),
  saltRounds: getNumber(EnvVar.SALT_ROUNDS, 10),
  sessionMaxAge: getNumber(EnvVar.SESSION_MAX_AGE, 86400000), // 24 hours
  sessionSecret: getString(EnvVar.SESSION_SECRET, 'session-secret'),
  apiKeyHeader: getString(EnvVar.API_KEY_HEADER, 'x-api-key'),
  oauthProviders: createOAuthProviders(),
});

/**
 * Create Redis configuration
 * @returns Redis configuration object
 */
const createRedisConfig = (): RedisConfig => ({
  host: getString(EnvVar.REDIS_HOST, 'localhost'),
  port: getNumber(EnvVar.REDIS_PORT, 6379),
  db: getNumber(EnvVar.REDIS_DB, 0),
  password: getString(EnvVar.REDIS_PASSWORD, ''),
  keyPrefix: getString(EnvVar.REDIS_KEY_PREFIX, 'hestia:'),
  retryDelayOnFailover: getNumber(EnvVar.REDIS_RETRY_DELAY, 1000),
  maxRetriesPerRequest: getNumber(EnvVar.REDIS_MAX_RETRIES, 3),
  enableReadyCheck: getBoolean(EnvVar.REDIS_ENABLE_READY_CHECK, true),
  maxMemoryPolicy: getString(EnvVar.REDIS_MAX_MEMORY_POLICY, 'allkeys-lru'),
  lazyConnect: getBoolean(EnvVar.REDIS_LAZY_CONNECT, false),
  keepAlive: getNumber(EnvVar.REDIS_KEEP_ALIVE, 30000),
  family: getNumber(EnvVar.REDIS_FAMILY, 4),
  noDelay: getBoolean(EnvVar.REDIS_NO_DELAY, true),
  connectionName: getString(EnvVar.REDIS_CONNECTION_NAME, ''),
  readOnly: getBoolean(EnvVar.REDIS_READ_ONLY, false),
  stringNumbers: getBoolean(EnvVar.REDIS_STRING_NUMBERS, false),
  maxLoadingTimeout: getNumber(EnvVar.REDIS_MAX_LOADING_TIMEOUT, 10000),
  autoResubscribe: getBoolean(EnvVar.REDIS_AUTO_RESUBSCRIBE, true),
  autoResendUnfulfilledCommands: getBoolean(EnvVar.REDIS_AUTO_RESEND_COMMANDS, true),
});

/**
 * Create Memory cache configuration
 * @returns Memory cache configuration object
 */
const createMemoryCacheConfig = (): MemoryConfig => ({
  maxSize: getNumber(EnvVar.MEMORY_CACHE_MAX_SIZE, 1000),
  ttl: getNumber(EnvVar.MEMORY_CACHE_TTL, 300000), // 5 minutes
  updateAgeOnGet: getBoolean(EnvVar.MEMORY_CACHE_UPDATE_AGE, false),
  allowStale: getBoolean(EnvVar.MEMORY_CACHE_ALLOW_STALE, false),
  noDisposeOnSet: getBoolean(EnvVar.MEMORY_CACHE_NO_DISPOSE, false),
  dispose: (): void => {
    // Custom dispose function for memory cache cleanup
    // This is a no-op implementation
  },
});

/**
 * Create cache configuration
 * @returns Cache configuration object
 */
const createCacheConfig = (): CacheConfig => ({
  type: (getString(EnvVar.CACHE_TYPE) as CacheType) || CacheType.REDIS,
  ttl: getNumber(EnvVar.CACHE_TTL, 300000), // 5 minutes
  maxItems: getNumber(EnvVar.CACHE_MAX_ITEMS, 1000),
  redis: createRedisConfig(),
  memory: createMemoryCacheConfig(),
});

/**
 * Create rate limiting configuration
 * @returns Rate limiting configuration object
 */
const createRateLimitConfig = (): RateLimitConfig => ({
  enabled: getBoolean(EnvVar.RATE_LIMIT_ENABLED, true),
  strategy:
    (getString(EnvVar.RATE_LIMIT_STRATEGY) as RateLimitStrategy) || RateLimitStrategy.FIXED_WINDOW,
  ttl: getNumber(EnvVar.RATE_LIMIT_TTL, 60000), // 1 minute
  limit: getNumber(EnvVar.RATE_LIMIT_LIMIT, 100),
  skipSuccessfulRequests: getBoolean(EnvVar.RATE_LIMIT_SKIP_SUCCESS, false),
  skipFailedRequests: getBoolean(EnvVar.RATE_LIMIT_SKIP_FAILED, false),
  keyGenerator: getString(EnvVar.RATE_LIMIT_KEY_GENERATOR, 'ip'),
  handler: getString(EnvVar.RATE_LIMIT_HANDLER, 'default'),
});

/**
 * Initialize and validate environment variables
 * @returns Validated environment configuration
 */
const initializeEnvironment = (): Record<string, unknown> => {
  try {
    return validateProcessEnv();
  } catch (error) {
    // Log error through proper logging service instead of console
    throw new Error(
      `Environment validation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

// Initialize environment validation
initializeEnvironment();

/**
 * Application configuration factory
 * Provides type-safe access to application configuration
 * @returns Application configuration
 */
export const appConfig = registerAs('app', createAppConfig);

/**
 * Database configuration factory
 * Provides type-safe access to database configuration
 * @returns Database configuration
 */
export const databaseConfig = registerAs('database', createDatabaseConfig);

/**
 * Authentication configuration factory
 * Provides type-safe access to authentication configuration
 * @returns Authentication configuration
 */
export const authConfig = registerAs('auth', createAuthConfig);

/**
 * Cache configuration factory
 * Provides type-safe access to cache configuration
 * @returns Cache configuration
 */
export const cacheConfig = registerAs('cache', createCacheConfig);

/**
 * Rate limiting configuration factory
 * Provides type-safe access to rate limiting configuration
 * @returns Rate limiting configuration
 */
export const rateLimitConfig = registerAs('rateLimit', createRateLimitConfig);

/**
 * AWS configuration factory
 * Provides type-safe access to AWS configuration
 * @returns AWS configuration
 */
export const awsConfig = registerAs('aws', createAwsConfig);

/**
 * Email configuration factory
 * Provides type-safe access to email configuration
 * @returns Email configuration
 */
export const emailConfig = registerAs('email', createEmailConfig);
