import { User } from '../../database/entities/user.entity';
import { Permission, UserRole } from '../enums/user.enum';

/**
 * Authentication result interface
 * Defines the result of authentication operations
 */
export interface AuthenticationResult {
  /** User information */
  user: User;
  /** Access token */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Token expiration time */
  expiresIn: number;
  /** Token type */
  tokenType: string;
}

/**
 * Token payload interface
 * Defines the payload structure for JWT tokens
 */
export interface TokenPayload {
  /** User ID */
  sub: string;
  /** User email */
  email: string;
  /** User role */
  role: UserRole;
  /** Tenant ID */
  tenantId?: string;
  /** Token type */
  type: 'access' | 'refresh';
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
}

/**
 * Login credentials interface
 * Defines the structure for login credentials
 */
export interface LoginCredentials {
  /** User email */
  email: string;
  /** User password */
  password: string;
  /** Remember me flag */
  rememberMe?: boolean;
}

/**
 * Registration data interface
 * Defines the structure for user registration data
 */
export interface RegistrationData {
  /** User email */
  email: string;
  /** User password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
  /** User role (optional, defaults to USER) */
  role?: UserRole;
  /** Tenant ID (optional) */
  tenantId?: string;
}

/**
 * Password reset request interface
 * Defines the structure for password reset requests
 */
export interface PasswordResetRequest {
  /** User email */
  email: string;
}

/**
 * Password reset confirmation interface
 * Defines the structure for password reset confirmation
 */
export interface PasswordResetConfirmation {
  /** Reset token */
  token: string;
  /** New password */
  newPassword: string;
  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Password change interface
 * Defines the structure for password change requests
 */
export interface PasswordChangeRequest {
  /** Current password */
  currentPassword: string;
  /** New password */
  newPassword: string;
  /** Password confirmation */
  confirmPassword: string;
}

/**
 * Authentication service interface
 * Defines the contract for authentication and authorization operations
 */
export interface IAuthenticationService {
  /**
   * Authenticate user with credentials
   * @param credentials - User login credentials
   * @param requestId - Request ID for logging
   * @returns Promise resolving to authentication result
   */
  authenticate(credentials: LoginCredentials, requestId: string): Promise<AuthenticationResult>;

  /**
   * Register new user
   * @param registrationData - User registration data
   * @param requestId - Request ID for logging
   * @returns Promise resolving to created user
   */
  register(registrationData: RegistrationData, requestId: string): Promise<User>;

  /**
   * Refresh access token
   * @param refreshToken - Refresh token
   * @param requestId - Request ID for logging
   * @returns Promise resolving to new authentication result
   */
  refreshToken(refreshToken: string, requestId: string): Promise<AuthenticationResult>;

  /**
   * Revoke refresh token
   * @param refreshToken - Refresh token to revoke
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating success
   */
  revokeToken(refreshToken: string, requestId: string): Promise<boolean>;

  /**
   * Validate access token
   * @param token - Access token to validate
   * @param requestId - Request ID for logging
   * @returns Promise resolving to token payload or null if invalid
   */
  validateToken(token: string, requestId: string): Promise<TokenPayload | null>;

  /**
   * Get user from token
   * @param token - Access token
   * @param requestId - Request ID for logging
   * @returns Promise resolving to user or null if token invalid
   */
  getUserFromToken(token: string, requestId: string): Promise<User | null>;

  /**
   * Request password reset
   * @param resetRequest - Password reset request data
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating success
   */
  requestPasswordReset(resetRequest: PasswordResetRequest, requestId: string): Promise<boolean>;

  /**
   * Confirm password reset
   * @param resetConfirmation - Password reset confirmation data
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating success
   */
  confirmPasswordReset(
    resetConfirmation: PasswordResetConfirmation,
    requestId: string,
  ): Promise<boolean>;

  /**
   * Change user password
   * @param userId - User ID
   * @param passwordChange - Password change data
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating success
   */
  changePassword(
    userId: string,
    passwordChange: PasswordChangeRequest,
    requestId: string,
  ): Promise<boolean>;

  /**
   * Verify email address
   * @param token - Email verification token
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating success
   */
  verifyEmail(token: string, requestId: string): Promise<boolean>;

  /**
   * Resend email verification
   * @param email - User email
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating success
   */
  resendEmailVerification(email: string, requestId: string): Promise<boolean>;

  /**
   * Check if user has permission
   * @param userId - User ID
   * @param permission - Permission to check
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if user has permission
   */
  hasPermission(userId: string, permission: Permission, requestId: string): Promise<boolean>;

  /**
   * Check if user has any of the permissions
   * @param userId - User ID
   * @param permissions - Permissions to check
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if user has any permission
   */
  hasAnyPermission(userId: string, permissions: Permission[], requestId: string): Promise<boolean>;

  /**
   * Check if user has all permissions
   * @param userId - User ID
   * @param permissions - Permissions to check
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if user has all permissions
   */
  hasAllPermissions(userId: string, permissions: Permission[], requestId: string): Promise<boolean>;

  /**
   * Get user permissions
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of user permissions
   */
  getUserPermissions(userId: string, requestId: string): Promise<Permission[]>;

  /**
   * Logout user
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating success
   */
  logout(userId: string, requestId: string): Promise<boolean>;

  /**
   * Generate access token
   * @param user - User object
   * @param requestId - Request ID for logging
   * @returns Promise resolving to access token
   */
  generateAccessToken(user: User, requestId: string): Promise<string>;

  /**
   * Generate refresh token
   * @param user - User object
   * @param requestId - Request ID for logging
   * @returns Promise resolving to refresh token
   */
  generateRefreshToken(user: User, requestId: string): Promise<string>;

  /**
   * Hash password
   * @param password - Plain text password
   * @param requestId - Request ID for logging
   * @returns Promise resolving to hashed password
   */
  hashPassword(password: string, requestId: string): Promise<string>;

  /**
   * Verify password
   * @param password - Plain text password
   * @param hash - Password hash
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if password matches
   */
  verifyPassword(password: string, hash: string, requestId: string): Promise<boolean>;
}
