import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';

import { UserMethods } from '../../database/entities/user-methods.entity';
import { User } from '../../database/entities/user.entity';
import {
  UserRole,
  UserStatus,
  UserVerificationStatus,
  Permission,
} from '../../interfaces/enums/user.enum';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import {
  IAuthenticationService,
  AuthenticationResult,
  TokenPayload,
  LoginCredentials,
  RegistrationData,
  PasswordResetRequest,
  PasswordResetConfirmation,
  PasswordChangeRequest,
} from '../../interfaces/services/authentication-service.interface';
import { LoggingService } from '../logging.service';
import { CacheService } from '../cache.service';
import { EmailService } from '../email.service';

import { PasswordService } from './password.service';
import { PermissionService } from './permission.service';
import { TokenService } from './token.service';

/**
 * Authentication service implementation
 * Handles user authentication, registration, and core auth operations
 * Follows clean architecture principles with clear separation of concerns
 */
@Injectable()
export class AuthenticationService implements IAuthenticationService {
  private readonly TOKEN_BLACKLIST_PREFIX = 'token_blacklist:';
  private readonly PASSWORD_RESET_PREFIX = 'password_reset:';
  private readonly EMAIL_VERIFICATION_PREFIX = 'email_verification:';
  private readonly PASSWORD_RESET_EXPIRY = 3600; // 1 hour
  private readonly EMAIL_VERIFICATION_EXPIRY = 86400; // 24 hours
  private readonly REFRESH_TOKEN_EXPIRY = 604800; // 7 days

  /**
   * Constructor for AuthenticationService
   * @param userRepository - User repository for data access
   * @param tokenService - Token service for JWT operations
   * @param passwordService - Password service for hashing/verification
   * @param permissionService - Permission service for authorization
   * @param loggingService - Logging service for audit trails
   * @param cacheService - Cache service for token management
   * @param configService - Configuration service
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly permissionService: PermissionService,
    private readonly loggingService: LoggingService,
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
  ) {}

  // ============================================================================
  // PUBLIC METHODS - Authentication Operations
  // ============================================================================

  /**
   * Authenticate user with credentials
   * @param credentials - User login credentials
   * @param requestId - Request identifier
   * @returns Authentication result with tokens
   */
  async authenticate(
    credentials: LoginCredentials,
    requestId: string,
  ): Promise<AuthenticationResult> {
    this.logAuthenticationStart(credentials.email, requestId);

    try {
      const user = await this.validateUserForAuthentication(credentials.email, requestId);
      await this.validateUserPassword(user, credentials.password, requestId);
      await this.resetLoginAttemptsAndUpdateLastLogin(user.id, requestId);

      const result = await this.createAuthenticationResult(user, requestId);

      this.logAuthenticationSuccess(user, requestId);
      return result;
    } catch (error) {
      this.logAuthenticationError(credentials.email, requestId, error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param registrationData - User registration data
   * @param requestId - Request identifier
   * @returns Created user
   */
  async register(registrationData: RegistrationData, requestId: string): Promise<User> {
    this.logRegistrationStart(registrationData.email, requestId);

    try {
      this.validateRegistrationData(registrationData, requestId);
      await this.checkEmailAvailability(registrationData.email, requestId);

      const user = await this.createUserFromRegistration(registrationData, requestId);

      // Send email verification
      await this.sendEmailVerification(user, requestId);

      this.logRegistrationSuccess(user, requestId);
      return user;
    } catch (error) {
      this.logRegistrationError(registrationData.email, requestId, error);
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param refreshToken - Refresh token
   * @param requestId - Request identifier
   * @returns New authentication result
   */
  async refreshToken(refreshToken: string, requestId: string): Promise<AuthenticationResult> {
    this.logTokenRefreshStart(requestId);

    try {
      const secret = this.getRefreshTokenSecret();
      const payload = await this.validateRefreshTokenPayload(refreshToken, secret, requestId);

      // Check if refresh token is blacklisted
      if (await this.isTokenBlacklisted(refreshToken, requestId)) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      const user = await this.getUserForTokenRefresh(payload, requestId);
      const result = await this.createTokenRefreshResult(user, requestId);

      // Blacklist the old refresh token
      await this.blacklistToken(refreshToken, this.REFRESH_TOKEN_EXPIRY, requestId);

      this.logTokenRefreshSuccess(user, requestId);
      return result;
    } catch (error) {
      this.logTokenRefreshError(requestId, error);
      throw error;
    }
  }

  /**
   * Revoke refresh token
   * @param refreshToken - Refresh token to revoke
   * @param requestId - Request identifier
   * @returns Success status
   */
  async revokeToken(refreshToken: string, requestId: string): Promise<boolean> {
    this.loggingService.log('Revoking token', { requestId });

    try {
      // Validate the token first
      const secret = this.getRefreshTokenSecret();
      const payload = await this.tokenService.validateToken(refreshToken, secret, requestId);

      if (!payload || payload.type !== 'refresh') {
        this.loggingService.warn('Token revocation failed: Invalid refresh token', { requestId });
        return false;
      }

      // Add token to blacklist
      await this.blacklistToken(refreshToken, this.REFRESH_TOKEN_EXPIRY, requestId);

      this.loggingService.log('Token revoked successfully', {
        requestId,
        userId: payload.sub,
      });
      return true;
    } catch (error) {
      this.loggingService.error('Token revocation failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Validate token
   * @param token - Access token
   * @param requestId - Request identifier
   * @returns Token payload if valid
   */
  async validateToken(token: string, requestId: string): Promise<TokenPayload | null> {
    this.loggingService.log('Validating token', { requestId });

    try {
      const secret = process.env['JWT_ACCESS_SECRET'];
      if (!secret) {
        throw new Error('JWT_ACCESS_SECRET environment variable is not set');
      }

      const payload = await this.tokenService.validateToken(token, secret, requestId);

      if (!payload) {
        return null;
      }

      // Check if token is blacklisted
      if (await this.isTokenBlacklisted(token, requestId)) {
        this.loggingService.warn('Token validation failed: Token is blacklisted', { requestId });
        return null;
      }

      return payload;
    } catch (error) {
      this.loggingService.error('Token validation failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Get user from token
   * @param token - Access token
   * @param requestId - Request identifier
   * @returns User if token valid
   */
  async getUserFromToken(token: string, requestId: string): Promise<User | null> {
    this.loggingService.log('Getting user from token', { requestId });

    try {
      const payload = this.tokenService.decodeToken(token, requestId);
      if (!this.isValidAccessTokenPayload(payload)) {
        return null;
      }

      if (await this.isTokenBlacklisted(token, requestId)) {
        this.logTokenBlacklistedWarning(requestId);
        return null;
      }

      const user = await this.userRepository.findById(payload.sub, requestId);
      if (!user) {
        return null;
      }

      if (!this.canUserLogin(user, requestId)) {
        return null;
      }

      return user;
    } catch (error) {
      this.loggingService.error('Failed to get user from token', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Request password reset
   * @param resetRequest - Password reset request
   * @param requestId - Request identifier
   * @returns Success status
   */
  async requestPasswordReset(
    resetRequest: PasswordResetRequest,
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.log('Requesting password reset', {
      requestId,
      email: resetRequest.email,
    });

    try {
      const user = await this.userRepository.findByEmail(resetRequest.email, requestId);
      if (!user) {
        this.logPasswordResetForNonExistentUser(requestId, resetRequest.email);
        return true; // Don't reveal if user exists
      }

      if (!this.canUserResetPassword(user, requestId)) {
        return true; // Don't reveal account status
      }

      await this.processPasswordResetRequest(user, requestId);

      this.loggingService.log('Password reset email sent', {
        requestId,
        userId: user.id,
      });

      return true;
    } catch (error) {
      this.loggingService.error('Password reset request failed', {
        requestId,
        email: resetRequest.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Confirm password reset
   * @param resetConfirmation - Password reset confirmation
   * @param requestId - Request identifier
   * @returns Success status
   */
  async confirmPasswordReset(
    resetConfirmation: PasswordResetConfirmation,
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.log('Confirming password reset', { requestId });

    try {
      if (resetConfirmation.newPassword !== resetConfirmation.confirmPassword) {
        throw new BadRequestException('Password confirmation does not match');
      }

      // Validate password strength
      this.validatePasswordStrength(resetConfirmation.newPassword);

      // Find the reset token in cache
      const resetTokenHash = await this.passwordService.hashPassword(
        resetConfirmation.token,
        requestId,
      );
      const resetData = await this.cacheService.get<{
        userId: string;
        email: string;
        createdAt: string;
      }>(`${this.PASSWORD_RESET_PREFIX}${resetTokenHash}`);

      if (!resetData) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Get user
      const user = await this.userRepository.findById(resetData.userId, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update password
      const newPasswordHash = await this.passwordService.hashPassword(
        resetConfirmation.newPassword,
        requestId,
      );
      await this.userRepository.updatePassword(resetData.userId, newPasswordHash, requestId);

      // Clear reset token from cache
      await this.cacheService.delete(`${this.PASSWORD_RESET_PREFIX}${resetTokenHash}`);

      // Reset failed login attempts
      await this.userRepository.resetFailedLoginAttempts(resetData.userId, requestId);

      this.loggingService.log('Password reset confirmed', {
        requestId,
        userId: resetData.userId,
      });

      return true;
    } catch (error) {
      this.loggingService.error('Password reset confirmation failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param passwordChange - Password change data
   * @param requestId - Request identifier
   * @returns Success status
   */
  async changePassword(
    userId: string,
    passwordChange: PasswordChangeRequest,
    requestId: string,
  ): Promise<boolean> {
    this.logChangePasswordStart(userId, requestId);

    try {
      this.validatePasswordConfirmation(passwordChange);
      this.validatePasswordStrength(passwordChange.newPassword);

      const user = await this.getUserForPasswordChange(userId, requestId);
      await this.verifyCurrentPassword(user, passwordChange, requestId);
      await this.updateUserPassword(userId, passwordChange.newPassword, requestId);

      // Reset failed login attempts
      await this.userRepository.resetFailedLoginAttempts(userId, requestId);

      this.logChangePasswordSuccess(userId, requestId);
      return true;
    } catch (error) {
      this.logChangePasswordError(userId, requestId, error);
      throw error;
    }
  }

  /**
   * Verify email address
   * @param token - Email verification token
   * @param requestId - Request identifier
   * @returns Success status
   */
  async verifyEmail(token: string, requestId: string): Promise<boolean> {
    this.loggingService.log('Verifying email', { requestId });

    try {
      // Find the verification token in cache
      const verificationData = await this.cacheService.get<{
        userId: string;
        email: string;
        createdAt: string;
      }>(`${this.EMAIL_VERIFICATION_PREFIX}${token}`);

      if (!verificationData) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      // Get user
      const user = await this.userRepository.findById(verificationData.userId, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update email verification status
      await this.userRepository.markEmailAsVerified(verificationData.userId, requestId);

      // Update user status to active if it was pending verification
      if (user.status === UserStatus.PENDING_VERIFICATION) {
        await this.userRepository.changeStatus(
          verificationData.userId,
          UserStatus.ACTIVE,
          requestId,
        );
      }

      // Clear verification token from cache
      await this.cacheService.delete(`${this.EMAIL_VERIFICATION_PREFIX}${token}`);

      this.loggingService.log('Email verified successfully', {
        requestId,
        userId: verificationData.userId,
      });

      return true;
    } catch (error) {
      this.loggingService.error('Email verification failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Resend email verification
   * @param email - User email
   * @param requestId - Request identifier
   * @returns Success status
   */
  async resendEmailVerification(email: string, requestId: string): Promise<boolean> {
    this.loggingService.log('Resending email verification', {
      requestId,
      email,
    });

    try {
      const user = await this.userRepository.findByEmail(email, requestId);
      if (!user) {
        this.loggingService.warn('Email verification resend for non-existent user', {
          requestId,
          email,
        });
        return true; // Don't reveal if user exists
      }

      const userMethods = new UserMethods(user);
      if (userMethods.isEmailVerified()) {
        this.loggingService.warn('Email verification resend for already verified user', {
          requestId,
          userId: user.id,
        });
        return true; // Don't reveal verification status
      }

      // Send new verification email
      await this.sendEmailVerification(user, requestId);

      this.loggingService.log('Email verification resent', {
        requestId,
        userId: user.id,
      });

      return true;
    } catch (error) {
      this.loggingService.error('Email verification resend failed', {
        requestId,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Check if user has specific permission
   * @param userId - User ID
   * @param permission - Permission to check
   * @param requestId - Request identifier
   * @returns Whether user has permission
   */
  async hasPermission(userId: string, permission: Permission, requestId: string): Promise<boolean> {
    return this.permissionService.hasPermission(userId, permission, requestId);
  }

  /**
   * Check if user has any of the specified permissions
   * @param userId - User ID
   * @param permissions - Permissions to check
   * @param requestId - Request identifier
   * @returns Whether user has any permission
   */
  async hasAnyPermission(
    userId: string,
    permissions: Permission[],
    requestId: string,
  ): Promise<boolean> {
    return this.permissionService.hasAnyPermission(userId, permissions, requestId);
  }

  /**
   * Check if user has all specified permissions
   * @param userId - User ID
   * @param permissions - Permissions to check
   * @param requestId - Request identifier
   * @returns Whether user has all permissions
   */
  async hasAllPermissions(
    userId: string,
    permissions: Permission[],
    requestId: string,
  ): Promise<boolean> {
    return this.permissionService.hasAllPermissions(userId, permissions, requestId);
  }

  /**
   * Get user permissions
   * @param userId - User ID
   * @param requestId - Request identifier
   * @returns Array of user permissions
   */
  async getUserPermissions(userId: string, requestId: string): Promise<Permission[]> {
    return this.permissionService.getUserPermissions(userId, requestId);
  }

  /**
   * Logout user
   * @param userId - User ID
   * @param requestId - Request identifier
   * @returns Success status
   */
  async logout(userId: string, requestId: string): Promise<boolean> {
    this.loggingService.log('Logging out user', {
      requestId,
      userId,
    });

    try {
      // Validate user exists
      const user = await this.userRepository.findById(userId, requestId);
      if (!user) {
        this.loggingService.warn('Logout failed: User not found', {
          requestId,
          userId,
        });
        return false;
      }

      // Get all active refresh tokens for the user from cache
      const userRefreshTokens = await this.getUserRefreshTokens(userId, requestId);

      // Blacklist all refresh tokens
      if (userRefreshTokens.length > 0) {
        await this.blacklistUserTokens(userRefreshTokens, requestId);
        this.loggingService.log('Blacklisted user refresh tokens', {
          requestId,
          userId,
          tokenCount: userRefreshTokens.length,
        });
      }

      // Clear user session data from cache
      await this.clearUserSessionData(userId, requestId);

      // Update user's last logout time (if you have this field)
      await this.updateUserLastLogout(userId, requestId);

      // Log successful logout
      this.loggingService.log('User logged out successfully', {
        requestId,
        userId,
        email: user.email,
        blacklistedTokens: userRefreshTokens.length,
      });

      return true;
    } catch (error) {
      this.loggingService.error('Logout failed', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Logout user from all devices
   * @param userId - User ID
   * @param requestId - Request identifier
   * @returns Success status
   */
  async logoutFromAllDevices(userId: string, requestId: string): Promise<boolean> {
    this.loggingService.log('Logging out user from all devices', {
      requestId,
      userId,
    });

    try {
      // Validate user exists
      const user = await this.userRepository.findById(userId, requestId);
      if (!user) {
        this.loggingService.warn('Logout from all devices failed: User not found', {
          requestId,
          userId,
        });
        return false;
      }

      // Get all active refresh tokens for the user
      const userRefreshTokens = await this.getUserRefreshTokens(userId, requestId);

      // Blacklist all refresh tokens
      if (userRefreshTokens.length > 0) {
        await this.blacklistUserTokens(userRefreshTokens, requestId);
        this.loggingService.log('Blacklisted all user refresh tokens', {
          requestId,
          userId,
          tokenCount: userRefreshTokens.length,
        });
      }

      // Clear all user session data
      await this.clearUserSessionData(userId, requestId);

      // Clear any stored refresh tokens for the user
      await this.clearUserRefreshTokens(userId, requestId);

      // Update user's last logout time
      await this.updateUserLastLogout(userId, requestId);

      this.loggingService.log('User logged out from all devices successfully', {
        requestId,
        userId,
        email: user.email,
        blacklistedTokens: userRefreshTokens.length,
      });

      return true;
    } catch (error) {
      this.loggingService.error('Logout from all devices failed', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Generate access token
   * @param user - User object
   * @param requestId - Request identifier
   * @returns Access token
   */
  async generateAccessToken(user: User, requestId: string): Promise<string> {
    return this.tokenService.generateAccessToken(user, requestId);
  }

  /**
   * Generate refresh token
   * @param user - User object
   * @param requestId - Request identifier
   * @returns Refresh token
   */
  async generateRefreshToken(user: User, requestId: string): Promise<string> {
    return this.tokenService.generateRefreshToken(user, requestId);
  }

  /**
   * Hash password
   * @param password - Plain text password
   * @param requestId - Request identifier
   * @returns Hashed password
   */
  async hashPassword(password: string, requestId: string): Promise<string> {
    return this.passwordService.hashPassword(password, requestId);
  }

  /**
   * Verify password
   * @param password - Plain text password
   * @param hash - Password hash
   * @param requestId - Request identifier
   * @returns True if password matches
   */
  async verifyPassword(password: string, hash: string, requestId: string): Promise<boolean> {
    return this.passwordService.verifyPassword(password, hash, requestId);
  }

  // ============================================================================
  // PRIVATE METHODS - Authentication Helpers
  // ============================================================================

  private logAuthenticationStart(email: string, requestId: string): void {
    this.loggingService.log('Starting user authentication', {
      requestId,
      email,
    });
  }

  private logAuthenticationSuccess(user: User, requestId: string): void {
    this.loggingService.log('User authenticated successfully', {
      requestId,
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private logAuthenticationError(email: string, requestId: string, error: unknown): void {
    this.loggingService.error('Authentication failed', {
      requestId,
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  private async validateUserForAuthentication(email: string, requestId: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email, requestId);
    if (!user) {
      this.loggingService.warn('Authentication failed: User not found', {
        requestId,
        email,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const userMethods = new UserMethods(user);
    if (!userMethods.canLogin()) {
      this.loggingService.warn('Authentication failed: User cannot login', {
        requestId,
        userId: user.id,
        status: user.status,
        emailVerificationStatus: user.emailVerificationStatus,
        failedLoginAttempts: user.failedLoginAttempts,
      });
      throw new UnauthorizedException('Account is locked or not verified');
    }

    return user;
  }

  private async validateUserPassword(
    user: User,
    password: string,
    requestId: string,
  ): Promise<void> {
    const isPasswordValid = await this.passwordService.verifyPassword(
      password,
      user.passwordHash,
      requestId,
    );

    if (!isPasswordValid) {
      await this.userRepository.incrementFailedLoginAttempts(user.id, requestId);
      this.loggingService.warn('Authentication failed: Invalid password', {
        requestId,
        userId: user.id,
      });
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  private async resetLoginAttemptsAndUpdateLastLogin(
    userId: string,
    requestId: string,
  ): Promise<void> {
    await this.userRepository.resetFailedLoginAttempts(userId, requestId);
    await this.userRepository.updateLastLogin(userId, requestId);
  }

  private async createAuthenticationResult(
    user: User,
    requestId: string,
  ): Promise<AuthenticationResult> {
    const accessToken = await this.tokenService.generateAccessToken(user, requestId);
    const refreshToken = await this.tokenService.generateRefreshToken(user, requestId);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 900,
      tokenType: 'Bearer',
    };
  }

  // ============================================================================
  // PRIVATE METHODS - Registration Helpers
  // ============================================================================

  private logRegistrationStart(email: string, requestId: string): void {
    this.loggingService.log('Starting user registration', {
      requestId,
      email,
    });
  }

  private logRegistrationSuccess(user: User, requestId: string): void {
    this.loggingService.log('User registered successfully', {
      requestId,
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private logRegistrationError(email: string, requestId: string, error: unknown): void {
    this.loggingService.error('User registration failed', {
      requestId,
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  private validateRegistrationData(registrationData: RegistrationData, requestId: string): void {
    if (registrationData.password !== registrationData.confirmPassword) {
      this.loggingService.warn('Registration failed: Password confirmation mismatch', {
        requestId,
      });
      throw new BadRequestException('Password confirmation does not match');
    }

    this.validatePasswordStrength(registrationData.password);
  }

  private async checkEmailAvailability(email: string, requestId: string): Promise<void> {
    const emailExists = await this.userRepository.emailExists(email, requestId);
    if (emailExists) {
      this.loggingService.warn('Registration failed: Email already exists', {
        requestId,
        email,
      });
      throw new ConflictException('Email already registered');
    }
  }

  private async createUserFromRegistration(
    registrationData: RegistrationData,
    requestId: string,
  ): Promise<User> {
    const passwordHash = await this.passwordService.hashPassword(
      registrationData.password,
      requestId,
    );

    const userData: Partial<User> = {
      email: registrationData.email,
      passwordHash,
      role: registrationData.role || UserRole.USER,
      status: UserStatus.PENDING_VERIFICATION,
      emailVerificationStatus: UserVerificationStatus.UNVERIFIED,
    };

    // Add tenantId only if it exists
    if (registrationData.tenantId) {
      userData.tenantId = registrationData.tenantId;
    }

    return await this.userRepository.create(userData, requestId);
  }

  // ============================================================================
  // PRIVATE METHODS - Token Refresh Helpers
  // ============================================================================

  private logTokenRefreshStart(requestId: string): void {
    this.loggingService.log('Starting token refresh', { requestId });
  }

  private getRefreshTokenSecret(): string {
    const secret = process.env['JWT_REFRESH_SECRET'];
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }
    return secret;
  }

  private async validateRefreshTokenPayload(
    refreshToken: string,
    secret: string,
    requestId: string,
  ): Promise<TokenPayload> {
    const payload = await this.tokenService.validateToken(refreshToken, secret, requestId);
    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return payload;
  }

  private async getUserForTokenRefresh(payload: TokenPayload, requestId: string): Promise<User> {
    const user = await this.userRepository.findById(payload.sub, requestId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userMethods = new UserMethods(user);
    if (!userMethods.canLogin()) {
      throw new UnauthorizedException('User account is not active');
    }

    return user;
  }

  private async createTokenRefreshResult(
    user: User,
    requestId: string,
  ): Promise<AuthenticationResult> {
    const accessToken = await this.tokenService.generateAccessToken(user, requestId);
    const newRefreshToken = await this.tokenService.generateRefreshToken(user, requestId);
    return {
      user,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900,
      tokenType: 'Bearer',
    };
  }

  private logTokenRefreshSuccess(user: User, requestId: string): void {
    this.loggingService.log('Token refreshed successfully', {
      requestId,
      userId: user.id,
    });
  }

  private logTokenRefreshError(requestId: string, error: unknown): void {
    this.loggingService.error('Token refresh failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // ============================================================================
  // PRIVATE METHODS - Password Change Helpers
  // ============================================================================

  private logChangePasswordStart(userId: string, requestId: string): void {
    this.loggingService.log('Changing user password', {
      requestId,
      userId,
    });
  }

  private validatePasswordConfirmation(passwordChange: PasswordChangeRequest): void {
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new BadRequestException('Password must not exceed 128 characters');
    }

    // Check for at least one uppercase letter, one lowercase letter, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestException(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }
  }

  private async getUserForPasswordChange(userId: string, requestId: string): Promise<User> {
    const user = await this.userRepository.findById(userId, requestId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userMethods = new UserMethods(user);
    if (!userMethods.isAccountActive()) {
      throw new UnauthorizedException('User account is not active');
    }

    return user;
  }

  private async verifyCurrentPassword(
    user: User,
    passwordChange: PasswordChangeRequest,
    requestId: string,
  ): Promise<void> {
    const isCurrentPasswordValid = await this.passwordService.verifyPassword(
      passwordChange.currentPassword,
      user.passwordHash,
      requestId,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
  }

  private async updateUserPassword(
    userId: string,
    newPassword: string,
    requestId: string,
  ): Promise<void> {
    const newPasswordHash = await this.passwordService.hashPassword(newPassword, requestId);
    await this.userRepository.updatePassword(userId, newPasswordHash, requestId);
  }

  private logChangePasswordSuccess(userId: string, requestId: string): void {
    this.loggingService.log('Password changed successfully', {
      requestId,
      userId,
    });
  }

  private logChangePasswordError(userId: string, requestId: string, error: unknown): void {
    this.loggingService.error('Password change failed', {
      requestId,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // ============================================================================
  // PRIVATE METHODS - Token Management
  // ============================================================================

  private async blacklistToken(
    token: string,
    expirySeconds: number,
    requestId: string,
  ): Promise<void> {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await this.cacheService.set(
        `${this.TOKEN_BLACKLIST_PREFIX}${tokenHash}`,
        { blacklistedAt: new Date().toISOString() },
        expirySeconds,
      );

      this.loggingService.debug('Token blacklisted', { requestId, tokenHash });
    } catch (error) {
      this.loggingService.error('Failed to blacklist token', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async isTokenBlacklisted(token: string, requestId: string): Promise<boolean> {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const blacklisted = await this.cacheService.exists(
        `${this.TOKEN_BLACKLIST_PREFIX}${tokenHash}`,
      );

      if (blacklisted) {
        this.loggingService.debug('Token found in blacklist', { requestId, tokenHash });
      }

      return blacklisted;
    } catch (error) {
      this.loggingService.error('Failed to check token blacklist', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  // ============================================================================
  // PRIVATE METHODS - Email Services
  // ============================================================================

  private async sendEmailVerification(user: User, requestId: string): Promise<void> {
    try {
      const verificationToken = this.generateSecureToken();

      // Store verification token in cache
      await this.cacheService.set(
        `${this.EMAIL_VERIFICATION_PREFIX}${verificationToken}`,
        {
          userId: user.id,
          email: user.email,
          createdAt: new Date().toISOString(),
        },
        this.EMAIL_VERIFICATION_EXPIRY,
      );

      // Send email verification using email service
      const emailSent = await this.emailService.sendEmailVerification(
        user.email,
        verificationToken,
        user.email.split('@')[0], // Use email prefix as name
        requestId,
      );

      if (!emailSent) {
        this.loggingService.error('Failed to send email verification', {
          requestId,
          userId: user.id,
          email: user.email,
        });
        throw new Error('Failed to send email verification');
      }

      this.loggingService.log('Email verification sent successfully', {
        requestId,
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      this.loggingService.error('Failed to send email verification', {
        requestId,
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    requestId: string,
  ): Promise<void> {
    try {
      // Send password reset email using email service
      const emailSent = await this.emailService.sendPasswordReset(
        email,
        resetToken,
        email.split('@')[0], // Use email prefix as name
        requestId,
      );

      if (!emailSent) {
        this.loggingService.error('Failed to send password reset email', {
          requestId,
          email,
        });
        throw new Error('Failed to send password reset email');
      }

      this.loggingService.log('Password reset email sent successfully', {
        requestId,
        email,
      });
    } catch (error) {
      this.loggingService.error('Failed to send password reset email', {
        requestId,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE METHODS - Utility Functions
  // ============================================================================

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private isValidAccessTokenPayload(payload: TokenPayload | null): payload is TokenPayload {
    return payload !== null && payload.type === 'access';
  }

  private logTokenBlacklistedWarning(requestId: string): void {
    this.loggingService.warn('Get user from token failed: Token is blacklisted', { requestId });
  }

  private canUserLogin(user: User, requestId: string): boolean {
    const userMethods = new UserMethods(user);
    if (!userMethods.canLogin()) {
      this.loggingService.warn('Get user from token failed: User cannot login', {
        requestId,
        userId: user.id,
      });
      return false;
    }
    return true;
  }

  private logPasswordResetForNonExistentUser(requestId: string, email: string): void {
    this.loggingService.warn('Password reset requested for non-existent user', {
      requestId,
      email,
    });
  }

  private canUserResetPassword(user: User, requestId: string): boolean {
    const userMethods = new UserMethods(user);
    if (!userMethods.isAccountActive()) {
      this.loggingService.warn('Password reset requested for inactive user', {
        requestId,
        userId: user.id,
      });
      return false;
    }
    return true;
  }

  private async processPasswordResetRequest(user: User, requestId: string): Promise<void> {
    const resetToken = this.generateSecureToken();
    const resetTokenHash = await this.passwordService.hashPassword(resetToken, requestId);

    await this.cacheService.set(
      `${this.PASSWORD_RESET_PREFIX}${resetTokenHash}`,
      {
        userId: user.id,
        email: user.email,
        createdAt: new Date().toISOString(),
      },
      this.PASSWORD_RESET_EXPIRY,
    );

    await this.sendPasswordResetEmail(user.email, resetToken, requestId);
  }

  // ============================================================================
  // PRIVATE METHODS - Logout Helpers
  // ============================================================================

  private async getUserRefreshTokens(userId: string, requestId: string): Promise<string[]> {
    try {
      // In a real implementation, you would retrieve stored refresh tokens for the user
      // For now, we'll return an empty array as tokens are not stored in cache
      this.loggingService.debug('Getting user refresh tokens', { requestId, userId });
      return [];
    } catch (error) {
      this.loggingService.error('Failed to get user refresh tokens', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  private async blacklistUserTokens(tokens: string[], requestId: string): Promise<void> {
    try {
      for (const token of tokens) {
        await this.blacklistToken(token, this.REFRESH_TOKEN_EXPIRY, requestId);
      }
      this.loggingService.debug('Blacklisted user tokens', {
        requestId,
        tokenCount: tokens.length,
      });
    } catch (error) {
      this.loggingService.error('Failed to blacklist user tokens', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async clearUserSessionData(userId: string, requestId: string): Promise<void> {
    try {
      // Clear any session-related data from cache
      const sessionKeys = [
        `user_session:${userId}`,
        `user_preferences:${userId}`,
        `user_permissions:${userId}`,
      ];

      for (const key of sessionKeys) {
        await this.cacheService.delete(key);
      }

      this.loggingService.debug('Cleared user session data', { requestId, userId });
    } catch (error) {
      this.loggingService.error('Failed to clear user session data', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async clearUserRefreshTokens(userId: string, requestId: string): Promise<void> {
    try {
      // Clear stored refresh tokens for the user
      const refreshTokenKey = `user_refresh_tokens:${userId}`;
      await this.cacheService.delete(refreshTokenKey);

      this.loggingService.debug('Cleared user refresh tokens', { requestId, userId });
    } catch (error) {
      this.loggingService.error('Failed to clear user refresh tokens', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async updateUserLastLogout(userId: string, requestId: string): Promise<void> {
    try {
      // In a real implementation, you would update the user's last logout timestamp
      // For now, we'll just log it
      this.loggingService.debug('Updated user last logout time', { requestId, userId });
    } catch (error) {
      this.loggingService.error('Failed to update user last logout time', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
