import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfigService } from './services/app-config.service';
import { AuthConfigService } from './services/auth-config.service';
import { AwsConfigService } from './services/aws-config.service';
import { CacheConfigService } from './services/cache-config.service';
import { DatabaseConfigService } from './services/database-config.service';
import { EmailConfigService } from './services/email-config.service';
import { RateLimitConfigService } from './services/rate-limit-config.service';

// Configuration summary interfaces
interface AppConfigSummary {
  environment: string;
  port: number;
  name: string;
  version: string;
  logLevel: string;
}

interface DatabaseConfigSummary {
  type: string;
  host: string;
  port: number;
  name: string;
}

interface AuthConfigSummary {
  strategy: string;
  jwtExpiresIn: string;
}

interface CacheConfigSummary {
  type: string;
  ttl: number;
}

interface RateLimitConfigSummary {
  enabled: boolean;
  strategy: string;
  limit: number;
}

interface AwsConfigSummary {
  region: string;
  s3Bucket: string;
}

interface EmailConfigSummary {
  provider: string;
  fromEmail: string;
}

interface ConfigSummary {
  app: AppConfigSummary;
  database: DatabaseConfigSummary;
  auth: AuthConfigSummary;
  cache: CacheConfigSummary;
  rateLimit: RateLimitConfigSummary;
  aws: AwsConfigSummary;
  email: EmailConfigSummary;
}

// Detailed configuration interfaces
interface DetailedConfig {
  app: Record<string, unknown>;
  database: Record<string, unknown>;
  auth: Record<string, unknown>;
  cache: Record<string, unknown>;
  rateLimit: Record<string, unknown>;
  aws: Record<string, unknown>;
  email: Record<string, unknown>;
}

/**
 * Main configuration service
 * Provides centralized access to all application configuration values
 * Delegates to specialized config services for better organization
 */
@Injectable()
export class MainConfigService {
  public readonly app: AppConfigService;
  public readonly database: DatabaseConfigService;
  public readonly auth: AuthConfigService;
  public readonly cache: CacheConfigService;
  public readonly rateLimit: RateLimitConfigService;
  public readonly aws: AwsConfigService;
  public readonly email: EmailConfigService;

  constructor(private readonly configService: ConfigService) {
    this.app = new AppConfigService(this.configService);
    this.database = new DatabaseConfigService(this.configService);
    this.auth = new AuthConfigService(this.configService);
    this.cache = new CacheConfigService(this.configService);
    this.rateLimit = new RateLimitConfigService(this.configService);
    this.aws = new AwsConfigService(this.configService);
    this.email = new EmailConfigService(this.configService);
  }

  /**
   * Get all configuration as a summary object
   * @returns Configuration summary
   */
  getConfigSummary(): ConfigSummary {
    return {
      app: this.getAppConfigSummary(),
      database: this.getDatabaseConfigSummary(),
      auth: this.getAuthConfigSummary(),
      cache: this.getCacheConfigSummary(),
      rateLimit: this.getRateLimitConfigSummary(),
      aws: this.getAwsConfigSummary(),
      email: this.getEmailConfigSummary(),
    };
  }

  /**
   * Get app configuration summary
   */
  private getAppConfigSummary(): AppConfigSummary {
    return {
      environment: this.app.environment,
      port: this.app.port,
      name: this.app.name,
      version: this.app.version,
      logLevel: this.app.logLevel,
    };
  }

  /**
   * Get database configuration summary
   */
  private getDatabaseConfigSummary(): DatabaseConfigSummary {
    return {
      type: this.database.type,
      host: this.database.host,
      port: this.database.port,
      name: this.database.databaseName,
    };
  }

  /**
   * Get auth configuration summary
   */
  private getAuthConfigSummary(): AuthConfigSummary {
    return {
      strategy: this.auth.strategy,
      jwtExpiresIn: this.auth.jwtExpiresIn,
    };
  }

  /**
   * Get cache configuration summary
   */
  private getCacheConfigSummary(): CacheConfigSummary {
    return {
      type: this.cache.type,
      ttl: this.cache.ttl,
    };
  }

  /**
   * Get rate limit configuration summary
   */
  private getRateLimitConfigSummary(): RateLimitConfigSummary {
    return {
      enabled: this.rateLimit.enabled,
      strategy: this.rateLimit.strategy,
      limit: this.rateLimit.limit,
    };
  }

  /**
   * Get AWS configuration summary
   */
  private getAwsConfigSummary(): AwsConfigSummary {
    return {
      region: this.aws.region,
      s3Bucket: this.aws.s3Bucket,
    };
  }

  /**
   * Get email configuration summary
   */
  private getEmailConfigSummary(): EmailConfigSummary {
    return {
      provider: this.email.provider,
      fromEmail: this.email.fromEmail,
    };
  }

  /**
   * Get all configuration as a detailed object
   * @returns Complete configuration object
   */
  getAllConfig(): DetailedConfig {
    return {
      app: this.app.app as unknown as Record<string, unknown>,
      database: this.database.database as unknown as Record<string, unknown>,
      auth: this.auth.auth as unknown as Record<string, unknown>,
      cache: this.cache.cache as unknown as Record<string, unknown>,
      rateLimit: this.rateLimit.rateLimit as unknown as Record<string, unknown>,
      aws: this.aws.aws as unknown as Record<string, unknown>,
      email: this.email.email as unknown as Record<string, unknown>,
    };
  }
}
