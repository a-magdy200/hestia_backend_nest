import { Environment, LogLevel, RateLimitStrategy } from '../enums/environment.enum';

/**
 * Application configuration interface
 * Defines the structure for application-related configuration
 */
export interface AppConfig {
  environment: Environment;
  port: number;
  host: string;
  name: string;
  version: string;
  description: string;
  logLevel: LogLevel;
  enableSwagger: boolean;
  enableMetrics: boolean;
  enableCors: boolean;
  corsOrigin: string | string[];
  globalPrefix: string;
  timeout: number;
  maxPayloadSize: string;
}

/**
 * Rate limiting configuration interface
 * Defines the structure for rate limiting configuration
 */
export interface RateLimitConfig {
  enabled: boolean;
  strategy: RateLimitStrategy;
  ttl: number;
  limit: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator?: string;
  handler?: string;
}
