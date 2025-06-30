import * as Joi from 'joi';

import {
  Environment,
  LogLevel,
  DatabaseType,
  CacheType,
  AuthStrategy,
  RateLimitStrategy,
  EnvVar,
} from './enums';

/**
 * Environment validation schema using Joi
 * Validates and provides type-safe access to environment variables
 */
export const envValidationSchema = Joi.object({
  // Application
  [EnvVar.NODE_ENV]: Joi.string()
    .valid(...Object.values(Environment))
    .default(Environment.DEVELOPMENT),
  [EnvVar.PORT]: Joi.number().port().default(3000),
  [EnvVar.HOST]: Joi.string().hostname().default('localhost'),
  [EnvVar.APP_NAME]: Joi.string().min(1).default('Hestia Backend'),
  [EnvVar.APP_VERSION]: Joi.string()
    .pattern(/^\d+\.\d+\.\d+/)
    .default('1.0.0'),
  [EnvVar.APP_DESCRIPTION]: Joi.string().default('Hestia Backend API'),
  [EnvVar.LOG_LEVEL]: Joi.string()
    .valid(...Object.values(LogLevel))
    .default(LogLevel.INFO),
  [EnvVar.ENABLE_SWAGGER]: Joi.boolean().default(true),
  [EnvVar.ENABLE_METRICS]: Joi.boolean().default(true),
  [EnvVar.ENABLE_CORS]: Joi.boolean().default(true),
  [EnvVar.CORS_ORIGIN]: Joi.string().default('*'),
  [EnvVar.GLOBAL_PREFIX]: Joi.string().default('api'),
  [EnvVar.TIMEOUT]: Joi.number().positive().default(30000),
  [EnvVar.MAX_PAYLOAD_SIZE]: Joi.string().default('10mb'),

  // Database
  [EnvVar.DB_TYPE]: Joi.string()
    .valid(...Object.values(DatabaseType))
    .default(DatabaseType.POSTGRES),
  [EnvVar.DB_HOST]: Joi.string().hostname().default('localhost'),
  [EnvVar.DB_PORT]: Joi.number().port().default(5432),
  [EnvVar.DB_USERNAME]: Joi.string().min(1).default('postgres'),
  [EnvVar.DB_PASSWORD]: Joi.string().min(1).default(''),
  [EnvVar.DB_DATABASE]: Joi.string().min(1).default('hestia'),
  [EnvVar.DATABASE_URL]: Joi.string().uri().optional(),
  [EnvVar.DB_SSL]: Joi.boolean().default(false),
  [EnvVar.DB_MAX_CONNECTIONS]: Joi.number().positive().default(10),
  [EnvVar.DB_CONNECTION_TIMEOUT]: Joi.number().positive().default(60000),
  [EnvVar.DB_ACQUIRE_TIMEOUT]: Joi.number().positive().default(60000),
  [EnvVar.DB_TIMEOUT]: Joi.number().positive().default(5000),
  [EnvVar.DB_POOL_SIZE]: Joi.number().positive().default(10),

  // Authentication
  [EnvVar.AUTH_STRATEGY]: Joi.string()
    .valid(...Object.values(AuthStrategy))
    .default(AuthStrategy.JWT),
  [EnvVar.JWT_SECRET]: Joi.string().min(32).required(),
  [EnvVar.JWT_EXPIRES_IN]: Joi.string().default('15m'),
  [EnvVar.JWT_REFRESH_EXPIRES_IN]: Joi.string().default('7d'),
  [EnvVar.SALT_ROUNDS]: Joi.number().min(10).max(20).default(12),
  [EnvVar.SESSION_MAX_AGE]: Joi.number().positive().default(86400000),
  [EnvVar.SESSION_SECRET]: Joi.string().min(32).default(''),
  [EnvVar.API_KEY_HEADER]: Joi.string().default('X-API-Key'),

  // OAuth Providers
  [EnvVar.GOOGLE_CLIENT_ID]: Joi.string().optional(),
  [EnvVar.GOOGLE_CLIENT_SECRET]: Joi.string().optional(),
  [EnvVar.GOOGLE_CALLBACK_URL]: Joi.string().uri().optional(),
  [EnvVar.GITHUB_CLIENT_ID]: Joi.string().optional(),
  [EnvVar.GITHUB_CLIENT_SECRET]: Joi.string().optional(),
  [EnvVar.GITHUB_CALLBACK_URL]: Joi.string().uri().optional(),

  // Cache
  [EnvVar.CACHE_TYPE]: Joi.string()
    .valid(...Object.values(CacheType))
    .default(CacheType.REDIS),
  [EnvVar.CACHE_TTL]: Joi.number().positive().default(3600),
  [EnvVar.CACHE_MAX_ITEMS]: Joi.number().positive().default(1000),

  // Redis
  [EnvVar.REDIS_HOST]: Joi.string().hostname().default('localhost'),
  [EnvVar.REDIS_PORT]: Joi.number().port().default(6379),
  [EnvVar.REDIS_DB]: Joi.number().min(0).max(15).default(0),
  [EnvVar.REDIS_PASSWORD]: Joi.string().optional(),
  [EnvVar.REDIS_KEY_PREFIX]: Joi.string().default('hestia:'),
  [EnvVar.REDIS_RETRY_DELAY]: Joi.number().positive().default(1000),
  [EnvVar.REDIS_MAX_RETRIES]: Joi.number().min(0).default(3),
  [EnvVar.REDIS_ENABLE_READY_CHECK]: Joi.boolean().default(true),
  [EnvVar.REDIS_MAX_MEMORY_POLICY]: Joi.string().default('allkeys-lru'),
  [EnvVar.REDIS_LAZY_CONNECT]: Joi.boolean().default(false),
  [EnvVar.REDIS_KEEP_ALIVE]: Joi.boolean().default(true),
  [EnvVar.REDIS_FAMILY]: Joi.number().valid(4, 6).default(4),
  [EnvVar.REDIS_NO_DELAY]: Joi.boolean().default(true),
  [EnvVar.REDIS_CONNECTION_NAME]: Joi.string().optional(),
  [EnvVar.REDIS_READ_ONLY]: Joi.boolean().default(false),
  [EnvVar.REDIS_STRING_NUMBERS]: Joi.boolean().default(false),
  [EnvVar.REDIS_MAX_LOADING_TIMEOUT]: Joi.number().positive().default(10000),
  [EnvVar.REDIS_AUTO_RESUBSCRIBE]: Joi.boolean().default(true),
  [EnvVar.REDIS_AUTO_RESEND_COMMANDS]: Joi.boolean().default(true),

  // Memory Cache
  [EnvVar.MEMORY_CACHE_MAX_SIZE]: Joi.number().positive().default(1000),
  [EnvVar.MEMORY_CACHE_TTL]: Joi.number().positive().default(3600000),
  [EnvVar.MEMORY_CACHE_UPDATE_AGE]: Joi.number().positive().default(60000),
  [EnvVar.MEMORY_CACHE_ALLOW_STALE]: Joi.boolean().default(false),
  [EnvVar.MEMORY_CACHE_NO_DISPOSE]: Joi.boolean().default(false),

  // Rate Limiting
  [EnvVar.RATE_LIMIT_ENABLED]: Joi.boolean().default(true),
  [EnvVar.RATE_LIMIT_STRATEGY]: Joi.string()
    .valid(...Object.values(RateLimitStrategy))
    .default(RateLimitStrategy.FIXED_WINDOW),
  [EnvVar.RATE_LIMIT_TTL]: Joi.number().positive().default(60),
  [EnvVar.RATE_LIMIT_LIMIT]: Joi.number().positive().default(100),
  [EnvVar.RATE_LIMIT_SKIP_SUCCESS]: Joi.boolean().default(false),
  [EnvVar.RATE_LIMIT_SKIP_FAILED]: Joi.boolean().default(false),
  [EnvVar.RATE_LIMIT_KEY_GENERATOR]: Joi.string().default('ip'),
  [EnvVar.RATE_LIMIT_HANDLER]: Joi.string().default('default'),

  // AWS
  [EnvVar.AWS_REGION]: Joi.string().default('us-east-1'),
  [EnvVar.AWS_ACCESS_KEY_ID]: Joi.string().optional(),
  [EnvVar.AWS_SECRET_ACCESS_KEY]: Joi.string().optional(),

  // AWS S3
  [EnvVar.AWS_S3_BUCKET]: Joi.string().optional(),
  [EnvVar.AWS_S3_REGION]: Joi.string().optional(),
  [EnvVar.AWS_S3_FORCE_PATH_STYLE]: Joi.boolean().default(false),
  [EnvVar.AWS_S3_SIGNATURE_VERSION]: Joi.string().valid('v2', 'v4').default('v4'),
  [EnvVar.AWS_S3_MAX_FILE_SIZE]: Joi.number().positive().default(10485760), // 10MB
  [EnvVar.AWS_S3_ALLOWED_MIME_TYPES]: Joi.string().default(
    'image/jpeg,image/png,image/gif,application/pdf',
  ),
  [EnvVar.AWS_S3_ENDPOINT]: Joi.string().uri().optional(),
  [EnvVar.AWS_S3_PUBLIC_URL]: Joi.string().uri().optional(),

  // AWS SES
  [EnvVar.AWS_SES_REGION]: Joi.string().optional(),
  [EnvVar.AWS_SES_FROM_EMAIL]: Joi.string().email().optional(),
  [EnvVar.AWS_SES_MAX_SEND_RATE]: Joi.number().positive().default(14),
  [EnvVar.AWS_SES_REPLY_TO_EMAIL]: Joi.string().email().optional(),
  [EnvVar.AWS_SES_CONFIGURATION_SET]: Joi.string().optional(),

  // AWS SNS
  [EnvVar.AWS_SNS_REGION]: Joi.string().optional(),
  [EnvVar.AWS_SNS_TOPIC_ARN]: Joi.string().optional(),
  [EnvVar.AWS_SNS_PLATFORM_APPLICATION_ARN]: Joi.string().optional(),

  // Email
  [EnvVar.EMAIL_PROVIDER]: Joi.string().valid('smtp', 'sendgrid', 'mailgun', 'ses').default('smtp'),
  [EnvVar.EMAIL_FROM]: Joi.string().email().default('noreply@hestia.com'),
  [EnvVar.EMAIL_REPLY_TO]: Joi.string().email().optional(),

  // SMTP
  [EnvVar.SMTP_HOST]: Joi.string().hostname().default('localhost'),
  [EnvVar.SMTP_PORT]: Joi.number().port().default(587),
  [EnvVar.SMTP_SECURE]: Joi.boolean().default(false),
  [EnvVar.SMTP_USERNAME]: Joi.string().optional(),
  [EnvVar.SMTP_PASSWORD]: Joi.string().optional(),

  // SendGrid
  [EnvVar.SENDGRID_API_KEY]: Joi.string().optional(),
  [EnvVar.SENDGRID_FROM_NAME]: Joi.string().optional(),

  // Mailgun
  [EnvVar.MAILGUN_API_KEY]: Joi.string().optional(),
  [EnvVar.MAILGUN_DOMAIN]: Joi.string().optional(),
  [EnvVar.MAILGUN_FROM_NAME]: Joi.string().optional(),

  // Exception Filter
  [EnvVar.MAX_ERROR_DETAILS_SIZE]: Joi.number().positive().default(1024),
  [EnvVar.ERROR_LOG_THRESHOLD]: Joi.number().positive().default(100),
});

/**
 * Validate environment configuration using Joi schema
 * @param config - Environment configuration object
 * @returns Validated environment configuration
 */
export const validateEnv = (config: Record<string, unknown>): Record<string, unknown> => {
  const { error, value } = envValidationSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = `Environment validation failed: ${error.details
      .map(detail => `${detail.path.join('.')}: ${detail.message}`)
      .join(', ')}`;
    throw new Error(errorMessage);
  }

  return value;
};

/**
 * Validate environment variables from process.env
 * @returns Validated environment configuration
 */
export const validateProcessEnv = (): Record<string, unknown> => {
  return validateEnv(process.env);
};
