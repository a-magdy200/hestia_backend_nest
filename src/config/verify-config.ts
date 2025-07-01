import { ConfigService } from '@nestjs/config';

import {
  appConfig,
  databaseConfig,
  authConfig,
  cacheConfig,
  rateLimitConfig,
  awsConfig,
  emailConfig,
} from './configuration';
import {
  Environment,
  LogLevel,
  DatabaseType,
  CacheType,
  AuthStrategy,
} from './enums/environment.enum';
import { AppConfigService } from './services/app-config.service';
import { AuthConfigService } from './services/auth-config.service';
import { AwsConfigService } from './services/aws-config.service';
import { CacheConfigService } from './services/cache-config.service';
import { DatabaseConfigService } from './services/database-config.service';
import { EmailConfigService } from './services/email-config.service';
import { RateLimitConfigService } from './services/rate-limit-config.service';

/**
 * Test configuration factory
 * @param factory - Configuration factory function
 * @param name - Configuration name
 * @returns Configuration object
 */
const testConfigFactory = <T>(factory: () => T, name: string): T => {
  try {
    const result = factory();
    return result;
  } catch (error) {
    throw new Error(`Failed to create ${name} configuration: ${error}`);
  }
};

/**
 * Test app configuration
 * @returns App configuration test object
 */
const testAppConfig = (): Record<string, unknown> => {
  const config = testConfigFactory(appConfig, 'app');
  return {
    environment: config.environment,
    port: config.port,
    name: config.name,
    logLevel: config.logLevel,
  };
};

/**
 * Test database configuration
 * @returns Database configuration test object
 */
const testDatabaseConfig = (): Record<string, unknown> => {
  const config = testConfigFactory(databaseConfig, 'database');
  return {
    type: config.type,
    host: config.host,
    port: config.port,
    database: config.database,
  };
};

/**
 * Test auth configuration
 * @returns Auth configuration test object
 */
const testAuthConfig = (): Record<string, unknown> => {
  const config = testConfigFactory(authConfig, 'auth');
  return {
    strategy: config.strategy,
    jwtExpiresIn: config.jwtExpiresIn,
    saltRounds: config.saltRounds,
  };
};

/**
 * Test cache configuration
 * @returns Cache configuration test object
 */
const testCacheConfig = (): Record<string, unknown> => {
  const config = testConfigFactory(cacheConfig, 'cache');
  return {
    type: config.type,
    ttl: config.ttl,
    maxItems: config.maxItems,
  };
};

/**
 * Test rate limit configuration
 * @returns Rate limit configuration test object
 */
const testRateLimitConfig = (): Record<string, unknown> => {
  const config = testConfigFactory(rateLimitConfig, 'rate limit');
  return {
    enabled: config.enabled,
    strategy: config.strategy,
    ttl: config.ttl,
    limit: config.limit,
  };
};

/**
 * Test AWS configuration
 * @returns AWS configuration test object
 */
const testAwsConfig = (): Record<string, unknown> => {
  const config = testConfigFactory(awsConfig, 'AWS');
  return {
    region: config.region,
    s3Bucket: config.s3?.bucket,
    sesRegion: config.ses?.region,
  };
};

/**
 * Test email configuration
 * @returns Email configuration test object
 */
const testEmailConfig = (): Record<string, unknown> => {
  const config = testConfigFactory(emailConfig, 'email');
  return {
    provider: config.provider,
    fromEmail: config.fromEmail,
    smtpPort: config.smtp?.port,
  };
};

/**
 * Test enum values
 * @returns Enum values test object
 */
const testEnums = (): Record<string, unknown[]> => {
  return {
    environment: [Environment.DEVELOPMENT, Environment.PRODUCTION, Environment.TEST],
    logLevel: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG],
    databaseType: [DatabaseType.POSTGRES, DatabaseType.MYSQL, DatabaseType.SQLITE],
    cacheType: [CacheType.REDIS, CacheType.MEMORY, CacheType.NONE],
    authStrategy: [AuthStrategy.JWT, AuthStrategy.SESSION, AuthStrategy.API_KEY],
  };
};

/**
 * Verify configuration settings
 * Validates all configuration values and provides detailed feedback
 * @returns Promise that resolves when verification is complete
 */
const verifyConfiguration = async (): Promise<void> => {
  try {
    // Test all configuration factories
    testAppConfig();
    testDatabaseConfig();
    testAuthConfig();
    testCacheConfig();
    testRateLimitConfig();
    testAwsConfig();
    testEmailConfig();

    // Test enum values
    testEnums();

    // If we reach here, all tests passed
  } catch (error) {
    throw new Error(`Configuration verification failed: ${error}`);
  }
};

/**
 * Verify application configuration
 * @param configService - NestJS ConfigService instance
 * @returns True if configuration is valid
 */
export const verifyAppConfig = (configService: ConfigService): boolean => {
  const appConfig = new AppConfigService(configService);

  if (!appConfig.name) {
    throw new Error('Application name is required');
  }

  if (!appConfig.port || appConfig.port <= 0) {
    throw new Error('Valid application port is required');
  }

  return true;
};

/**
 * Verify database configuration
 * @param configService - NestJS ConfigService instance
 * @returns True if configuration is valid
 */
export const verifyDatabaseConfig = (configService: ConfigService): boolean => {
  const dbConfig = new DatabaseConfigService(configService);

  if (!dbConfig.url && !dbConfig.host) {
    throw new Error('Database URL or host is required');
  }

  if (!dbConfig.username) {
    throw new Error('Database username is required');
  }

  if (!dbConfig.databaseName) {
    throw new Error('Database name is required');
  }

  return true;
};

/**
 * Verify authentication configuration
 * @param configService - NestJS ConfigService instance
 * @returns True if configuration is valid
 */
export const verifyAuthConfig = (configService: ConfigService): boolean => {
  const authConfig = new AuthConfigService(configService);

  if (!authConfig.jwtSecret) {
    throw new Error('JWT secret is required');
  }

  if (authConfig.jwtSecret.length < 32) {
    throw new Error('JWT secret must be at least 32 characters long');
  }

  return true;
};

/**
 * Verify cache configuration
 * @param configService - NestJS ConfigService instance
 * @returns True if configuration is valid
 */
export const verifyCacheConfig = (configService: ConfigService): boolean => {
  const cacheConfig = new CacheConfigService(configService);

  if (cacheConfig.isRedisCache && !cacheConfig.redisHost) {
    throw new Error('Redis host is required when using Redis cache');
  }

  return true;
};

/**
 * Verify rate limiting configuration
 * @param configService - NestJS ConfigService instance
 * @returns True if configuration is valid
 */
export const verifyRateLimitConfig = (configService: ConfigService): boolean => {
  const rateLimitConfig = new RateLimitConfigService(configService);

  if (rateLimitConfig.enabled && rateLimitConfig.limit <= 0) {
    throw new Error('Rate limit must be greater than 0 when enabled');
  }

  if (rateLimitConfig.enabled && rateLimitConfig.ttl <= 0) {
    throw new Error('Rate limit TTL must be greater than 0 when enabled');
  }

  return true;
};

/**
 * Verify AWS configuration
 * @param configService - NestJS ConfigService instance
 * @returns True if configuration is valid
 */
export const verifyAwsConfig = (configService: ConfigService): boolean => {
  const awsConfig = new AwsConfigService(configService);

  if (!awsConfig.region) {
    throw new Error('AWS region is required');
  }

  return true;
};

/**
 * Verify email configuration
 * @param configService - NestJS ConfigService instance
 * @returns True if configuration is valid
 */
export const verifyEmailConfig = (configService: ConfigService): boolean => {
  const emailConfig = new EmailConfigService(configService);

  if (!emailConfig.fromEmail) {
    throw new Error('From email address is required');
  }

  verifyEmailProviderConfig(emailConfig);

  return true;
};

/**
 * Verify email provider specific configuration
 * @param emailConfig - Email configuration service
 */
const verifyEmailProviderConfig = (emailConfig: EmailConfigService): void => {
  if (emailConfig.isSmtpProvider && !emailConfig.smtpHost) {
    throw new Error('SMTP host is required when using SMTP provider');
  }

  if (emailConfig.isSendGridProvider && !emailConfig.sendGridApiKey) {
    throw new Error('SendGrid API key is required when using SendGrid provider');
  }

  if (emailConfig.isMailgunProvider && !emailConfig.mailgunApiKey) {
    throw new Error('Mailgun API key is required when using Mailgun provider');
  }
};

/**
 * Verify all configurations
 * @param configService - NestJS ConfigService instance
 * @returns True if all configurations are valid
 */
export const verifyAllConfigs = (configService: ConfigService): boolean => {
  verifyAppConfig(configService);
  verifyDatabaseConfig(configService);
  verifyAuthConfig(configService);
  verifyCacheConfig(configService);
  verifyRateLimitConfig(configService);
  verifyAwsConfig(configService);
  verifyEmailConfig(configService);

  return true;
};

// Run verification if this file is executed directly
if (require.main === module) {
  verifyConfiguration()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

export { verifyConfiguration };
