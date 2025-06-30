import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfigService } from './services/app-config.service';
import { AuthConfigService } from './services/auth-config.service';
import { AwsConfigService } from './services/aws-config.service';
import { CacheConfigService } from './services/cache-config.service';
import { DatabaseConfigService } from './services/database-config.service';
import { EmailConfigService } from './services/email-config.service';
import { RateLimitConfigService } from './services/rate-limit-config.service';

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

  constructor(private configService: ConfigService) {
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
  getConfigSummary() {
    return {
      app: {
        environment: this.app.environment,
        port: this.app.port,
        name: this.app.name,
        version: this.app.version,
        logLevel: this.app.logLevel,
      },
      database: {
        type: this.database.type,
        host: this.database.host,
        port: this.database.port,
        name: this.database.database,
      },
      auth: {
        strategy: this.auth.strategy,
        jwtExpiresIn: this.auth.jwtExpiresIn,
      },
      cache: {
        type: this.cache.type,
        ttl: this.cache.ttl,
      },
      rateLimit: {
        enabled: this.rateLimit.enabled,
        strategy: this.rateLimit.strategy,
        limit: this.rateLimit.limit,
      },
      aws: {
        region: this.aws.region,
        s3Bucket: this.aws.s3Bucket,
      },
      email: {
        provider: this.email.provider,
        fromEmail: this.email.fromEmail,
      },
    };
  }

  /**
   * Get all configuration as a detailed object
   * @returns Complete configuration object
   */
  getAllConfig() {
    return {
      app: this.app.app,
      database: this.database.database,
      auth: this.auth.auth,
      cache: this.cache.cache,
      rateLimit: this.rateLimit.rateLimit,
      aws: this.aws.aws,
      email: this.email.email,
    };
  }
}
