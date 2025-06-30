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
import { CacheConfig } from './interfaces/cache.config.interface';
import { DatabaseConfig } from './interfaces/database.config.interface';
import { EnvUtil } from './utils/env.util';

/**
 * Create application configuration
 * @returns Application configuration object
 */
const createAppConfig = (): AppConfig => ({
  environment: (EnvUtil.getString(EnvVar.NODE_ENV) as Environment) || Environment.DEVELOPMENT,
  port: EnvUtil.getNumber(EnvVar.PORT, 3000),
  host: EnvUtil.getString(EnvVar.HOST, 'localhost'),
  name: EnvUtil.getString(EnvVar.APP_NAME, 'Hestia Backend'),
  version: EnvUtil.getString(EnvVar.APP_VERSION, '1.0.0'),
  description: EnvUtil.getString(EnvVar.APP_DESCRIPTION, 'Hestia Backend API'),
  logLevel: (EnvUtil.getString(EnvVar.LOG_LEVEL) as LogLevel) || LogLevel.INFO,
  enableSwagger: EnvUtil.getBoolean(EnvVar.ENABLE_SWAGGER, true),
  enableMetrics: EnvUtil.getBoolean(EnvVar.ENABLE_METRICS, true),
  enableCors: EnvUtil.getBoolean(EnvVar.ENABLE_CORS, true),
  corsOrigin: EnvUtil.getString(EnvVar.CORS_ORIGIN, '*'),
  globalPrefix: EnvUtil.getString(EnvVar.GLOBAL_PREFIX, 'api'),
  timeout: EnvUtil.getNumber(EnvVar.TIMEOUT, 30000),
  maxPayloadSize: EnvUtil.getString(EnvVar.MAX_PAYLOAD_SIZE, '10mb'),
});

/**
 * Create database configuration
 * @returns Database configuration object
 */
const createDatabaseConfig = (): DatabaseConfig => {
  const config: DatabaseConfig = {
    type: (EnvUtil.getString(EnvVar.DB_TYPE) as DatabaseType) || DatabaseType.POSTGRES,
    host: EnvUtil.getString(EnvVar.DB_HOST, 'localhost'),
    port: EnvUtil.getNumber(EnvVar.DB_PORT, 5432),
    username: EnvUtil.getString(EnvVar.DB_USERNAME, 'postgres'),
    password: EnvUtil.getString(EnvVar.DB_PASSWORD, ''),
    database: EnvUtil.getString(EnvVar.DB_DATABASE, 'hestia'),
    url: EnvUtil.getString(EnvVar.DATABASE_URL, ''),
    ssl: EnvUtil.getBoolean(EnvVar.DB_SSL, false),
    synchronize: EnvUtil.getString(EnvVar.NODE_ENV) === Environment.DEVELOPMENT,
    logging: EnvUtil.getString(EnvVar.NODE_ENV) === Environment.DEVELOPMENT,
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/migrations/*{.ts,.js}'],
    subscribers: ['dist/subscribers/*{.ts,.js}'],
    maxConnections: EnvUtil.getNumber(EnvVar.DB_MAX_CONNECTIONS, 10),
    connectionTimeout: EnvUtil.getNumber(EnvVar.DB_CONNECTION_TIMEOUT, 60000),
    acquireTimeout: EnvUtil.getNumber(EnvVar.DB_ACQUIRE_TIMEOUT, 60000),
    timeout: EnvUtil.getNumber(EnvVar.DB_TIMEOUT, 30000),
    poolSize: EnvUtil.getNumber(EnvVar.DB_POOL_SIZE, 10),
  };

  return config;
};

/**
 * Create OAuth providers configuration
 * @returns OAuth providers configuration object
 */
const createOAuthProviders = () => ({
  google: {
    clientId: EnvUtil.getString(EnvVar.GOOGLE_CLIENT_ID, ''),
    clientSecret: EnvUtil.getString(EnvVar.GOOGLE_CLIENT_SECRET, ''),
    callbackUrl: EnvUtil.getString(EnvVar.GOOGLE_CALLBACK_URL, ''),
    scope: ['email', 'profile'],
  },
  github: {
    clientId: EnvUtil.getString(EnvVar.GITHUB_CLIENT_ID, ''),
    clientSecret: EnvUtil.getString(EnvVar.GITHUB_CLIENT_SECRET, ''),
    callbackUrl: EnvUtil.getString(EnvVar.GITHUB_CALLBACK_URL, ''),
    scope: ['user:email'],
  },
});

/**
 * Create authentication configuration
 * @returns Authentication configuration object
 */
const createAuthConfig = (): AuthConfig => ({
  strategy: (EnvUtil.getString(EnvVar.AUTH_STRATEGY) as AuthStrategy) || AuthStrategy.JWT,
  jwtSecret: EnvUtil.getString(EnvVar.JWT_SECRET, 'your-secret-key'),
  jwtExpiresIn: EnvUtil.getString(EnvVar.JWT_EXPIRES_IN, '1h'),
  jwtRefreshExpiresIn: EnvUtil.getString(EnvVar.JWT_REFRESH_EXPIRES_IN, '7d'),
  saltRounds: EnvUtil.getNumber(EnvVar.SALT_ROUNDS, 10),
  sessionMaxAge: EnvUtil.getNumber(EnvVar.SESSION_MAX_AGE, 86400000), // 24 hours
  sessionSecret: EnvUtil.getString(EnvVar.SESSION_SECRET, 'session-secret'),
  apiKeyHeader: EnvUtil.getString(EnvVar.API_KEY_HEADER, 'x-api-key'),
  oauthProviders: createOAuthProviders(),
});

/**
 * Create Redis configuration
 * @returns Redis configuration object
 */
const createRedisConfig = () => ({
  host: EnvUtil.getString(EnvVar.REDIS_HOST, 'localhost'),
  port: EnvUtil.getNumber(EnvVar.REDIS_PORT, 6379),
  db: EnvUtil.getNumber(EnvVar.REDIS_DB, 0),
  password: EnvUtil.getString(EnvVar.REDIS_PASSWORD, ''),
  keyPrefix: EnvUtil.getString(EnvVar.REDIS_KEY_PREFIX, 'hestia:'),
  retryDelayOnFailover: EnvUtil.getNumber(EnvVar.REDIS_RETRY_DELAY, 1000),
  maxRetriesPerRequest: EnvUtil.getNumber(EnvVar.REDIS_MAX_RETRIES, 3),
  enableReadyCheck: EnvUtil.getBoolean(EnvVar.REDIS_ENABLE_READY_CHECK, true),
  maxMemoryPolicy: EnvUtil.getString(EnvVar.REDIS_MAX_MEMORY_POLICY, 'allkeys-lru'),
  lazyConnect: EnvUtil.getBoolean(EnvVar.REDIS_LAZY_CONNECT, false),
  keepAlive: EnvUtil.getNumber(EnvVar.REDIS_KEEP_ALIVE, 30000),
  family: EnvUtil.getNumber(EnvVar.REDIS_FAMILY, 4),
  noDelay: EnvUtil.getBoolean(EnvVar.REDIS_NO_DELAY, true),
  connectionName: EnvUtil.getString(EnvVar.REDIS_CONNECTION_NAME, ''),
  readOnly: EnvUtil.getBoolean(EnvVar.REDIS_READ_ONLY, false),
  stringNumbers: EnvUtil.getBoolean(EnvVar.REDIS_STRING_NUMBERS, false),
  maxLoadingTimeout: EnvUtil.getNumber(EnvVar.REDIS_MAX_LOADING_TIMEOUT, 10000),
  autoResubscribe: EnvUtil.getBoolean(EnvVar.REDIS_AUTO_RESUBSCRIBE, true),
  autoResendUnfulfilledCommands: EnvUtil.getBoolean(EnvVar.REDIS_AUTO_RESEND_COMMANDS, true),
});

/**
 * Create memory cache configuration
 * @returns Memory cache configuration object
 */
const createMemoryCacheConfig = () => ({
  maxSize: EnvUtil.getNumber(EnvVar.MEMORY_CACHE_MAX_SIZE, 1000),
  ttl: EnvUtil.getNumber(EnvVar.MEMORY_CACHE_TTL, 300000), // 5 minutes
  updateAgeOnGet: EnvUtil.getBoolean(EnvVar.MEMORY_CACHE_UPDATE_AGE, false),
  allowStale: EnvUtil.getBoolean(EnvVar.MEMORY_CACHE_ALLOW_STALE, false),
  noDisposeOnSet: EnvUtil.getBoolean(EnvVar.MEMORY_CACHE_NO_DISPOSE, false),
  dispose: () => {
    // Custom dispose function for memory cache cleanup
    // This is a no-op implementation
  },
});

/**
 * Create cache configuration
 * @returns Cache configuration object
 */
const createCacheConfig = (): CacheConfig => ({
  type: (EnvUtil.getString(EnvVar.CACHE_TYPE) as CacheType) || CacheType.REDIS,
  ttl: EnvUtil.getNumber(EnvVar.CACHE_TTL, 300000), // 5 minutes
  maxItems: EnvUtil.getNumber(EnvVar.CACHE_MAX_ITEMS, 1000),
  redis: createRedisConfig(),
  memory: createMemoryCacheConfig(),
});

/**
 * Create rate limiting configuration
 * @returns Rate limiting configuration object
 */
const createRateLimitConfig = (): RateLimitConfig => ({
  enabled: EnvUtil.getBoolean(EnvVar.RATE_LIMIT_ENABLED, true),
  strategy:
    (EnvUtil.getString(EnvVar.RATE_LIMIT_STRATEGY) as RateLimitStrategy) ||
    RateLimitStrategy.FIXED_WINDOW,
  ttl: EnvUtil.getNumber(EnvVar.RATE_LIMIT_TTL, 60000), // 1 minute
  limit: EnvUtil.getNumber(EnvVar.RATE_LIMIT_LIMIT, 100),
  skipSuccessfulRequests: EnvUtil.getBoolean(EnvVar.RATE_LIMIT_SKIP_SUCCESS, false),
  skipFailedRequests: EnvUtil.getBoolean(EnvVar.RATE_LIMIT_SKIP_FAILED, false),
  keyGenerator: EnvUtil.getString(EnvVar.RATE_LIMIT_KEY_GENERATOR, 'ip'),
  handler: EnvUtil.getString(EnvVar.RATE_LIMIT_HANDLER, 'default'),
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
