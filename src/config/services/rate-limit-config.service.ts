import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RateLimitStrategy } from '../enums/environment.enum';
import { RateLimitConfig } from '../interfaces/app.config.interface';

/**
 * Rate limiting configuration service
 * Provides centralized access to rate limiting configuration values
 */
@Injectable()
export class RateLimitConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get rate limiting configuration
   * @returns Rate limiting configuration object
   */
  get rateLimit(): RateLimitConfig {
    const rateLimitConfig = this.configService.get<RateLimitConfig>('rateLimit');
    if (!rateLimitConfig) {
      throw new Error('Rate limit configuration is not defined');
    }
    return rateLimitConfig;
  }

  /**
   * Check if rate limiting is enabled
   * @returns True if rate limiting is enabled
   */
  get enabled(): boolean {
    return this.rateLimit.enabled;
  }

  /**
   * Get rate limiting strategy
   * @returns Rate limiting strategy
   */
  get strategy(): RateLimitStrategy {
    return this.rateLimit.strategy;
  }

  /**
   * Get rate limiting TTL
   * @returns Rate limiting TTL in seconds
   */
  get ttl(): number {
    return this.rateLimit.ttl;
  }

  /**
   * Get rate limiting limit
   * @returns Rate limiting limit
   */
  get limit(): number {
    return this.rateLimit.limit;
  }

  /**
   * Check if successful requests should be skipped
   * @returns True if successful requests should be skipped
   */
  get skipSuccessfulRequests(): boolean {
    return this.rateLimit.skipSuccessfulRequests;
  }

  /**
   * Check if failed requests should be skipped
   * @returns True if failed requests should be skipped
   */
  get skipFailedRequests(): boolean {
    return this.rateLimit.skipFailedRequests;
  }

  /**
   * Get rate limiting key generator
   * @returns Rate limiting key generator
   */
  get keyGenerator(): string | undefined {
    return this.rateLimit.keyGenerator;
  }

  /**
   * Get rate limiting handler
   * @returns Rate limiting handler
   */
  get handler(): string | undefined {
    return this.rateLimit.handler;
  }

  /**
   * Check if fixed window strategy is used
   * @returns True if fixed window strategy is used
   */
  get isFixedWindow(): boolean {
    return this.strategy === RateLimitStrategy.FIXED_WINDOW;
  }

  /**
   * Check if sliding window strategy is used
   * @returns True if sliding window strategy is used
   */
  get isSlidingWindow(): boolean {
    return this.strategy === RateLimitStrategy.SLIDING_WINDOW;
  }

  /**
   * Check if token bucket strategy is used
   * @returns True if token bucket strategy is used
   */
  get isTokenBucket(): boolean {
    return this.strategy === RateLimitStrategy.TOKEN_BUCKET;
  }
}
