import { AuthStrategy } from '../enums/environment.enum';

/**
 * Authentication configuration interface
 * Defines the structure for authentication-related configuration
 */
export interface AuthConfig {
  strategy: AuthStrategy;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  saltRounds: number;
  sessionSecret?: string;
  sessionMaxAge?: number;
  apiKeyHeader?: string;
  oauthProviders?: Record<string, OAuthProviderConfig>;
}

/**
 * OAuth provider configuration interface
 * Defines the structure for OAuth provider configuration
 */
export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope: string[];
}
