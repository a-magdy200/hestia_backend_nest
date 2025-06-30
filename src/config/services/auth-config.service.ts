import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthStrategy } from '../enums/environment.enum';
import { AuthConfig } from '../interfaces/auth.config.interface';

/**
 * Authentication configuration service
 * Provides centralized access to authentication configuration values
 */
@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  /**
   * Get authentication configuration
   * @returns Authentication configuration object
   */
  get auth(): AuthConfig {
    return this.configService.get<AuthConfig>('auth')!;
  }

  /**
   * Get authentication strategy
   * @returns Authentication strategy
   */
  get strategy(): AuthStrategy {
    return this.auth.strategy;
  }

  /**
   * Get JWT secret
   * @returns JWT secret key
   */
  get jwtSecret(): string {
    return this.auth.jwtSecret;
  }

  /**
   * Get JWT expiration time
   * @returns JWT expiration time
   */
  get jwtExpiresIn(): string {
    return this.auth.jwtExpiresIn;
  }

  /**
   * Get JWT refresh expiration time
   * @returns JWT refresh expiration time
   */
  get jwtRefreshExpiresIn(): string {
    return this.auth.jwtRefreshExpiresIn;
  }

  /**
   * Get salt rounds for password hashing
   * @returns Number of salt rounds
   */
  get saltRounds(): number {
    return this.auth.saltRounds || 12;
  }

  /**
   * Get session max age
   * @returns Session max age in milliseconds
   */
  get sessionMaxAge(): number {
    return this.auth.sessionMaxAge || 86400000;
  }

  /**
   * Get API key header name
   * @returns API key header name
   */
  get apiKeyHeader(): string {
    return this.auth.apiKeyHeader || 'x-api-key';
  }

  /**
   * Get session secret
   * @returns Session secret key
   */
  get sessionSecret(): string | undefined {
    return this.auth.sessionSecret;
  }

  /**
   * Get OAuth providers configuration
   * @returns OAuth providers configuration
   */
  get oauthProviders(): AuthConfig['oauthProviders'] {
    return this.auth.oauthProviders;
  }

  /**
   * Get Google OAuth configuration
   * @returns Google OAuth configuration
   */
  get googleOAuth() {
    return this.auth.oauthProviders?.['google'];
  }

  /**
   * Get GitHub OAuth configuration
   * @returns GitHub OAuth configuration
   */
  get githubOAuth() {
    return this.auth.oauthProviders?.['github'];
  }

  /**
   * Check if JWT strategy is enabled
   * @returns True if JWT strategy is enabled
   */
  get isJwtStrategy(): boolean {
    return this.strategy === AuthStrategy.JWT;
  }

  /**
   * Check if session strategy is enabled
   * @returns True if session strategy is enabled
   */
  get isSessionStrategy(): boolean {
    return this.strategy === AuthStrategy.SESSION;
  }

  /**
   * Check if API key strategy is enabled
   * @returns True if API key strategy is enabled
   */
  get isApiKeyStrategy(): boolean {
    return this.strategy === AuthStrategy.API_KEY;
  }

  /**
   * Check if OAuth strategy is enabled
   * @returns True if OAuth strategy is enabled
   */
  get isOAuthStrategy(): boolean {
    return this.strategy === AuthStrategy.OAUTH;
  }
}
