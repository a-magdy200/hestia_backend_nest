import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Rate limit entry interface
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

/**
 * Rate limit configuration interface
 */
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

/**
 * Rate limiting service
 * Provides comprehensive rate limiting functionality with configurable rules
 */
@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly rateLimitStore = new Map<string, RateLimitEntry>();
  private readonly config: RateLimitConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      windowMs: this.configService.get<number>('RATE_LIMIT_WINDOW_MS', 60000), // 1 minute
      maxRequests: this.configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100),
      blockDurationMs: this.configService.get<number>('RATE_LIMIT_BLOCK_DURATION_MS', 300000), // 5 minutes
      skipSuccessfulRequests: this.configService.get<boolean>('RATE_LIMIT_SKIP_SUCCESS', false),
      skipFailedRequests: this.configService.get<boolean>('RATE_LIMIT_SKIP_FAILED', false),
    };
  }

  /**
   * Check if request is allowed
   * @param key - Rate limit key (usually IP or user ID)
   * @param requestId - Request identifier for logging
   * @returns Rate limit result
   */
  async isAllowed(
    key: string,
    requestId: string,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    try {
      const now = Date.now();
      const entry = this.rateLimitStore.get(key);

      // Check if currently blocked
      if (entry?.blockedUntil && now < entry.blockedUntil) {
        const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);

        this.logger.warn(`Rate limit blocked: ${key}`, {
          requestId,
          key,
          retryAfter,
          blockedUntil: entry.blockedUntil,
        });

        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
          retryAfter,
        };
      }

      // Check if window has reset
      if (!entry || now >= entry.resetTime) {
        const newEntry: RateLimitEntry = {
          count: 1,
          resetTime: now + this.config.windowMs,
        };

        this.rateLimitStore.set(key, newEntry);

        this.logger.debug(`Rate limit window started: ${key}`, {
          requestId,
          key,
          count: 1,
          resetTime: newEntry.resetTime,
        });

        return {
          allowed: true,
          remaining: this.config.maxRequests - 1,
          resetTime: newEntry.resetTime,
        };
      }

      // Check if limit exceeded
      if (entry.count >= this.config.maxRequests) {
        // Block the key
        entry.blockedUntil = now + this.config.blockDurationMs;

        this.logger.warn(`Rate limit exceeded: ${key}`, {
          requestId,
          key,
          count: entry.count,
          maxRequests: this.config.maxRequests,
          blockedUntil: entry.blockedUntil,
        });

        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime,
          retryAfter: Math.ceil(this.config.blockDurationMs / 1000),
        };
      }

      // Increment count
      entry.count++;

      this.logger.debug(`Rate limit check: ${key}`, {
        requestId,
        key,
        count: entry.count,
        remaining: this.config.maxRequests - entry.count,
        resetTime: entry.resetTime,
      });

      return {
        allowed: true,
        remaining: this.config.maxRequests - entry.count,
        resetTime: entry.resetTime,
      };
    } catch (error) {
      this.logger.error(`Rate limit check error for key ${key}:`, error);
      // Allow request on error to prevent service disruption
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
      };
    }
  }

  /**
   * Record successful request
   * @param key - Rate limit key
   * @param requestId - Request identifier
   */
  async recordSuccess(key: string, requestId: string): Promise<void> {
    if (this.config.skipSuccessfulRequests) {
      await this.reset(key, requestId);
    }
  }

  /**
   * Record failed request
   * @param key - Rate limit key
   * @param requestId - Request identifier
   */
  async recordFailure(key: string, requestId: string): Promise<void> {
    if (this.config.skipFailedRequests) {
      return;
    }

    // Increment failure count (could be used for stricter limits)
    const entry = this.rateLimitStore.get(key);
    if (entry) {
      // Could implement separate failure tracking here
      this.logger.debug(`Rate limit failure recorded: ${key}`, {
        requestId,
        key,
        count: entry.count,
      });
    }
  }

  /**
   * Reset rate limit for key
   * @param key - Rate limit key
   * @param requestId - Request identifier
   */
  async reset(key: string, requestId: string): Promise<void> {
    try {
      this.rateLimitStore.delete(key);

      this.logger.debug(`Rate limit reset: ${key}`, {
        requestId,
        key,
      });
    } catch (error) {
      this.logger.error(`Rate limit reset error for key ${key}:`, error);
    }
  }

  /**
   * Get rate limit status for key
   * @param key - Rate limit key
   * @param requestId - Request identifier
   * @returns Rate limit status
   */
  async getStatus(
    key: string,
    requestId: string,
  ): Promise<{
    count: number;
    remaining: number;
    resetTime: number;
    isBlocked: boolean;
    blockedUntil?: number;
  }> {
    try {
      const entry = this.rateLimitStore.get(key);
      const now = Date.now();

      if (!entry) {
        return {
          count: 0,
          remaining: this.config.maxRequests,
          resetTime: now + this.config.windowMs,
          isBlocked: false,
        };
      }

      const isBlocked = !!(entry.blockedUntil && now < entry.blockedUntil);
      const remaining = isBlocked ? 0 : Math.max(0, this.config.maxRequests - entry.count);

      return {
        count: entry.count,
        remaining,
        resetTime: entry.resetTime,
        isBlocked,
        blockedUntil: entry.blockedUntil,
      };
    } catch (error) {
      this.logger.error(`Rate limit status error for key ${key}:`, error);
      return {
        count: 0,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
        isBlocked: false,
      };
    }
  }

  /**
   * Get rate limit statistics
   * @returns Rate limit statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    blockedKeys: number;
    activeKeys: number;
    config: RateLimitConfig;
  }> {
    try {
      const now = Date.now();
      let blockedKeys = 0;
      let activeKeys = 0;

      // Clean up expired entries and count stats
      for (const [key, entry] of this.rateLimitStore.entries()) {
        if (entry.blockedUntil && now < entry.blockedUntil) {
          blockedKeys++;
        } else if (now < entry.resetTime) {
          activeKeys++;
        } else {
          // Remove expired entries
          this.rateLimitStore.delete(key);
        }
      }

      return {
        totalKeys: this.rateLimitStore.size,
        blockedKeys,
        activeKeys,
        config: this.config,
      };
    } catch (error) {
      this.logger.error('Rate limit stats error:', error);
      return {
        totalKeys: 0,
        blockedKeys: 0,
        activeKeys: 0,
        config: this.config,
      };
    }
  }

  /**
   * Clear all rate limit data
   * @param requestId - Request identifier
   */
  async clearAll(requestId: string): Promise<void> {
    try {
      const count = this.rateLimitStore.size;
      this.rateLimitStore.clear();

      this.logger.debug(`Rate limit cleared: ${count} entries`, {
        requestId,
        clearedCount: count,
      });
    } catch (error) {
      this.logger.error('Rate limit clear error:', error);
    }
  }

  /**
   * Generate rate limit key from request
   * @param ip - IP address
   * @param userId - User ID (optional)
   * @param endpoint - API endpoint (optional)
   * @returns Rate limit key
   */
  static generateKey(ip: string, userId?: string, endpoint?: string): string {
    const parts = [ip];

    if (userId) {
      parts.push(`user:${userId}`);
    }

    if (endpoint) {
      parts.push(`endpoint:${endpoint}`);
    }

    return parts.join(':');
  }

  /**
   * Generate rate limit key for IP only
   * @param ip - IP address
   * @returns Rate limit key
   */
  static ipKey(ip: string): string {
    return `ip:${ip}`;
  }

  /**
   * Generate rate limit key for user only
   * @param userId - User ID
   * @returns Rate limit key
   */
  static userKey(userId: string): string {
    return `user:${userId}`;
  }

  /**
   * Generate rate limit key for endpoint only
   * @param endpoint - API endpoint
   * @returns Rate limit key
   */
  static endpointKey(endpoint: string): string {
    return `endpoint:${endpoint}`;
  }

  /**
   * Generate rate limit key for combination
   * @param ip - IP address
   * @param userId - User ID
   * @returns Rate limit key
   */
  static combinedKey(ip: string, userId: string): string {
    return `combined:${ip}:${userId}`;
  }
}
