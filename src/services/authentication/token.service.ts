import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '../../database/entities/user.entity';
import { TokenPayload } from '../../interfaces/services/authentication-service.interface';
import { LoggingService } from '../logging.service';

/**
 * Token service for JWT operations
 * Handles token generation, validation, and management
 */
@Injectable()
export class TokenService {
  /**
   * Constructor for TokenService
   * @param jwtService - JWT service for token operations
   * @param loggingService - Logging service for audit trails
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Generate access token for user
   * @param user - User object
   * @param requestId - Request identifier
   * @returns Access token string
   */
  async generateAccessToken(user: User, requestId: string): Promise<string> {
    this.loggingService.debug('Generating access token', { requestId, userId: user.id });

    try {
      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        ...(user.tenantId && { tenantId: user.tenantId }),
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      };

      const token = this.jwtService.sign(payload);

      this.loggingService.debug('Access token generated successfully', {
        requestId,
        userId: user.id,
      });

      return token;
    } catch (error) {
      this.loggingService.error('Access token generation failed', {
        requestId,
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate refresh token for user
   * @param user - User object
   * @param requestId - Request identifier
   * @returns Refresh token string
   */
  async generateRefreshToken(user: User, requestId: string): Promise<string> {
    this.loggingService.debug('Generating refresh token', { requestId, userId: user.id });

    try {
      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        ...(user.tenantId && { tenantId: user.tenantId }),
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 604800, // 7 days
      };

      const token = this.jwtService.sign(payload);

      this.loggingService.debug('Refresh token generated successfully', {
        requestId,
        userId: user.id,
      });

      return token;
    } catch (error) {
      this.loggingService.error('Refresh token generation failed', {
        requestId,
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Validate JWT token
   * @param token - JWT token string
   * @param secret - JWT secret
   * @param requestId - Request identifier
   * @returns Token payload if valid
   */
  async validateToken(
    token: string,
    secret: string,
    requestId: string,
  ): Promise<TokenPayload | null> {
    this.loggingService.debug('Validating token', { requestId });

    try {
      const payload = this.jwtService.verify<TokenPayload>(token, { secret });

      this.loggingService.debug('Token validation successful', {
        requestId,
        userId: payload.sub,
        type: payload.type,
      });

      return payload;
    } catch (error) {
      this.loggingService.warn('Token validation failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Decode JWT token without validation
   * @param token - JWT token string
   * @param requestId - Request identifier
   * @returns Token payload
   */
  decodeToken(token: string, requestId: string): TokenPayload | null {
    this.loggingService.debug('Decoding token', { requestId });

    try {
      const payload = this.jwtService.decode(token) as TokenPayload;

      this.loggingService.debug('Token decoded successfully', {
        requestId,
        userId: payload?.sub,
        type: payload?.type,
      });

      return payload;
    } catch (error) {
      this.loggingService.warn('Token decoding failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Get token expiration time
   * @param token - JWT token string
   * @param requestId - Request identifier
   * @returns Expiration timestamp or null
   */
  getTokenExpiration(token: string, requestId: string): number | null {
    this.loggingService.debug('Getting token expiration', { requestId });

    try {
      const payload = this.decodeToken(token, requestId);
      return payload?.exp || null;
    } catch (error) {
      this.loggingService.warn('Failed to get token expiration', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param token - JWT token string
   * @param requestId - Request identifier
   * @returns True if token is expired
   */
  isTokenExpired(token: string, requestId: string): boolean {
    const expiration = this.getTokenExpiration(token, requestId);
    if (!expiration) return true;

    const now = Math.floor(Date.now() / 1000);
    return now >= expiration;
  }

  /**
   * Get time until token expires
   * @param token - JWT token string
   * @param requestId - Request identifier
   * @returns Seconds until expiration or null
   */
  getTimeUntilExpiration(token: string, requestId: string): number | null {
    const expiration = this.getTokenExpiration(token, requestId);
    if (!expiration) return null;

    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, expiration - now);
  }
}
