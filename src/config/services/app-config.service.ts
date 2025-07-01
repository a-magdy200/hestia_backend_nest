import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment, LogLevel } from '../enums/environment.enum';
import { AppConfig } from '../interfaces/app.config.interface';

/**
 * Application configuration service
 * Provides centralized access to application configuration values
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get application configuration
   * @returns Application configuration object
   */
  get app(): AppConfig {
    const appConfig = this.configService.get<AppConfig>('app');
    if (!appConfig) {
      throw new Error('Application configuration is not defined');
    }
    return appConfig;
  }

  /**
   * Get current environment
   * @returns Current environment
   */
  get environment(): Environment {
    return this.app.environment;
  }

  /**
   * Check if running in development mode
   * @returns True if running in development mode
   */
  get isDevelopment(): boolean {
    return this.environment === Environment.DEVELOPMENT;
  }

  /**
   * Check if running in production mode
   * @returns True if running in production mode
   */
  get isProduction(): boolean {
    return this.environment === Environment.PRODUCTION;
  }

  /**
   * Check if running in test mode
   * @returns True if running in test mode
   */
  get isTest(): boolean {
    return this.environment === Environment.TEST;
  }

  /**
   * Get application port
   * @returns Application port number
   */
  get port(): number {
    return this.app.port;
  }

  /**
   * Get application host
   * @returns Application host
   */
  get host(): string {
    return this.app.host;
  }

  /**
   * Get application name
   * @returns Application name
   */
  get name(): string {
    return this.app.name;
  }

  /**
   * Get application version
   * @returns Application version
   */
  get version(): string {
    return this.app.version;
  }

  /**
   * Get log level
   * @returns Log level
   */
  get logLevel(): LogLevel {
    return this.app.logLevel;
  }

  /**
   * Check if Swagger is enabled
   * @returns True if Swagger is enabled
   */
  get enableSwagger(): boolean {
    return this.app.enableSwagger;
  }

  /**
   * Check if metrics are enabled
   * @returns True if metrics are enabled
   */
  get enableMetrics(): boolean {
    return this.app.enableMetrics;
  }

  /**
   * Check if CORS is enabled
   * @returns True if CORS is enabled
   */
  get enableCors(): boolean {
    return this.app.enableCors;
  }

  /**
   * Get CORS origin
   * @returns CORS origin configuration
   */
  get corsOrigin(): string | string[] {
    return this.app.corsOrigin;
  }

  /**
   * Get global API prefix
   * @returns Global API prefix
   */
  get globalPrefix(): string {
    return this.app.globalPrefix;
  }

  /**
   * Get timeout value
   * @returns Timeout value in milliseconds
   */
  get timeout(): number {
    return this.app.timeout;
  }

  /**
   * Get max payload size
   * @returns Maximum payload size
   */
  get maxPayloadSize(): string {
    return this.app.maxPayloadSize;
  }
}
