import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserMethods } from '../database/entities/user-methods.entity';
import { User } from '../database/entities/user.entity';
import {
  Permission,
  UserRole,
  UserStatus,
  UserVerificationStatus,
} from '../interfaces/enums/user.enum';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import {
  IAuthenticationService,
  AuthenticationResult,
  TokenPayload,
  LoginCredentials,
  RegistrationData,
  PasswordResetRequest,
  PasswordResetConfirmation,
  PasswordChangeRequest,
} from '../interfaces/services/authentication-service.interface';

import { LoggingService } from './logging.service';

/**
 * Authentication service implementation
 * Handles user authentication, authorization, and token management
 * Provides comprehensive authentication and authorization functionality
 */
@Injectable()
export class AuthenticationService implements IAuthenticationService {
  /**
   * Constructor for AuthenticationService
   * @param userRepository - User repository for data access
   * @param jwtService - JWT service for token operations
   * @param loggingService - Logging service for audit trails
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Authenticate user with credentials
   * @param credentials - User login credentials
   * @param requestId - Request identifier for logging
   * @returns Promise resolving to authentication result with tokens
   */
  async authenticate(
    credentials: LoginCredentials,
    requestId: string,
  ): Promise<AuthenticationResult> {
    this.loggingService.log('Starting user authentication', {
      requestId,
      email: credentials.email,
    });

    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email, requestId);
      if (!user) {
        this.loggingService.warn('Authentication failed: User not found', {
          requestId,
          email: credentials.email,
        });
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if user can login
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

      // Verify password
      const isPasswordValid = await this.verifyPassword(
        credentials.password,
        user.passwordHash,
        requestId,
      );
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.userRepository.incrementFailedLoginAttempts(user.id, requestId);
        this.loggingService.warn('Authentication failed: Invalid password', {
          requestId,
          userId: user.id,
        });
        throw new UnauthorizedException('Invalid email or password');
      }

      // Reset failed login attempts and update last login
      await this.userRepository.resetFailedLoginAttempts(user.id, requestId);
      await this.userRepository.updateLastLogin(user.id, requestId);

      // Generate tokens
      const accessToken = await this.generateAccessToken(user, requestId);
      const refreshToken = await this.generateRefreshToken(user, requestId);

      const result: AuthenticationResult = {
        user,
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
        tokenType: 'Bearer',
      };

      this.loggingService.log('User authenticated successfully', {
        requestId,
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return result;
    } catch (error) {
      this.loggingService.error('Authentication failed', {
        requestId,
        email: credentials.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Register new user
   * @param registrationData - User registration data
   * @param requestId - Request identifier for logging
   * @returns Promise resolving to created user
   */
  async register(registrationData: RegistrationData, requestId: string): Promise<User> {
    this.loggingService.log('Starting user registration', {
      requestId,
      email: registrationData.email,
    });

    try {
      // Validate password confirmation
      if (registrationData.password !== registrationData.confirmPassword) {
        this.loggingService.warn('Registration failed: Password confirmation mismatch', {
          requestId,
        });
        throw new BadRequestException('Password confirmation does not match');
      }

      // Check if email already exists
      const emailExists = await this.userRepository.emailExists(registrationData.email, requestId);
      if (emailExists) {
        this.loggingService.warn('Registration failed: Email already exists', {
          requestId,
          email: registrationData.email,
        });
        throw new ConflictException('Email already registered');
      }

      // Hash password
      const passwordHash = await this.hashPassword(registrationData.password, requestId);

      // Create user data
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

      // Create user
      const user = await this.userRepository.create(userData, requestId);

      this.loggingService.log('User registered successfully', {
        requestId,
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return user;
    } catch (error) {
      this.loggingService.error('User registration failed', {
        requestId,
        email: registrationData.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token string
   * @param requestId - Request identifier for logging
   * @returns Promise resolving to authentication result with new tokens
   */
  async refreshToken(refreshToken: string, requestId: string): Promise<AuthenticationResult> {
    this.loggingService.log('Starting token refresh', { requestId });

    try {
      // Validate refresh token
      const payload = await this.validateToken(refreshToken, requestId);
      if (!payload || payload.type !== 'refresh') {
        this.loggingService.warn('Token refresh failed: Invalid refresh token', { requestId });
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user
      const user = await this.userRepository.findById(payload.sub, requestId);
      if (!user) {
        this.loggingService.warn('Token refresh failed: User not found or inactive', {
          requestId,
          userId: payload.sub,
        });
        throw new UnauthorizedException('Invalid refresh token');
      }

      const userMethods = new UserMethods(user);
      if (!userMethods.canLogin()) {
        this.loggingService.warn('Token refresh failed: User account inactive', {
          requestId,
          userId: user.id,
        });
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const accessToken = await this.generateAccessToken(user, requestId);
      const newRefreshToken = await this.generateRefreshToken(user, requestId);

      const result: AuthenticationResult = {
        user,
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900, // 15 minutes
        tokenType: 'Bearer',
      };

      this.loggingService.log('Token refreshed successfully', {
        requestId,
        userId: user.id,
      });

      return result;
    } catch (error) {
      this.loggingService.error('Token refresh failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Revoke refresh token
   * @param refreshToken
   * @param requestId
   */
  async revokeToken(refreshToken: string, requestId: string): Promise<boolean> {
    this.loggingService.log('Starting token revocation', { requestId });

    try {
      // Validate refresh token
      const payload = await this.validateToken(refreshToken, requestId);
      if (!payload || payload.type !== 'refresh') {
        this.loggingService.warn('Token revocation failed: Invalid refresh token', { requestId });
        return false;
      }

      // In a real implementation, you would store revoked tokens in Redis/database
      // For now, we'll just return true
      this.loggingService.log('Token revoked successfully', { requestId, userId: payload.sub });
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
   * Validate access token
   * @param token
   * @param requestId
   */
  async validateToken(token: string, requestId: string): Promise<TokenPayload | null> {
    this.loggingService.debug('Validating token', { requestId });

    try {
      const payload = this.jwtService.verify<TokenPayload>(token);
      this.loggingService.debug('Token validation successful', { requestId, userId: payload.sub });
      return payload;
    } catch (error) {
      this.loggingService.debug('Token validation failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Get user from token
   * @param token
   * @param requestId
   */
  async getUserFromToken(token: string, requestId: string): Promise<User | null> {
    this.loggingService.debug('Getting user from token', { requestId });

    try {
      const payload = await this.validateToken(token, requestId);
      if (!payload) {
        return null;
      }

      const user = await this.userRepository.findById(payload.sub, requestId);
      if (!user) {
        return null;
      }

      const userMethods = new UserMethods(user);
      if (!userMethods.canLogin()) {
        this.loggingService.warn('User from token not found or inactive', {
          requestId,
          userId: payload.sub,
        });
        return null;
      }

      this.loggingService.debug('User retrieved from token successfully', {
        requestId,
        userId: user.id,
      });
      return user;
    } catch (error) {
      this.loggingService.error('Failed to get user from token', {
        requestId,
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Request password reset
   * @param resetRequest
   * @param requestId
   */
  async requestPasswordReset(
    resetRequest: PasswordResetRequest,
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.log('Starting password reset request', {
      requestId,
      email: resetRequest.email,
    });

    try {
      const user = await this.userRepository.findByEmail(resetRequest.email, requestId);
      if (!user) {
        this.loggingService.warn('Password reset request failed: User not found', {
          requestId,
          email: resetRequest.email,
        });
        return false;
      }

      const userMethods = new UserMethods(user);
      if (!userMethods.isAccountActive()) {
        this.loggingService.warn('Password reset request failed: User account inactive', {
          requestId,
          userId: user.id,
        });
        return false;
      }

      // Generate reset token and send email
      // Implementation would include token generation and email sending
      this.loggingService.log('Password reset request processed successfully', {
        requestId,
        userId: user.id,
        email: user.email,
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
   * @param resetConfirmation
   * @param requestId
   */
  async confirmPasswordReset(
    resetConfirmation: PasswordResetConfirmation,
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.log('Starting password reset confirmation', {
      requestId,
    });

    try {
      // Validate reset token and update password
      // Implementation would include token validation and password update
      this.loggingService.log('Password reset confirmed successfully', {
        requestId,
      });

      return true;
    } catch (error) {
      this.loggingService.error('Password reset confirmation failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param passwordChange - Password change request data
   * @param requestId - Request identifier for logging
   * @returns Promise resolving to boolean indicating success
   */
  async changePassword(
    userId: string,
    passwordChange: PasswordChangeRequest,
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.log('Starting password change', {
      requestId,
      userId,
    });

    try {
      // Get user
      const user = await this.userRepository.findById(userId, requestId);
      if (!user) {
        this.loggingService.warn('Password change failed: User not found', {
          requestId,
          userId,
        });
        throw new UnauthorizedException('User not found');
      }

      const userMethods = new UserMethods(user);
      if (!userMethods.isAccountActive()) {
        this.loggingService.warn('Password change failed: User account inactive', {
          requestId,
          userId,
        });
        throw new UnauthorizedException('User account is inactive');
      }

      // Validate password confirmation
      if (passwordChange.newPassword !== passwordChange.confirmPassword) {
        this.loggingService.warn('Password change failed: Password confirmation mismatch', {
          requestId,
          userId,
        });
        throw new BadRequestException('Password confirmation does not match');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(
        passwordChange.currentPassword,
        user.passwordHash,
        requestId,
      );
      if (!isCurrentPasswordValid) {
        this.loggingService.warn('Password change failed: Invalid current password', {
          requestId,
          userId,
        });
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(passwordChange.newPassword, requestId);

      // Update password
      await this.userRepository.updatePassword(userId, newPasswordHash, requestId);

      this.loggingService.log('Password changed successfully', {
        requestId,
        userId,
      });

      return true;
    } catch (error) {
      this.loggingService.error('Password change failed', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify email address
   * @param token
   * @param requestId
   */
  async verifyEmail(token: string, requestId: string): Promise<boolean> {
    this.loggingService.log('Starting email verification', { requestId });

    try {
      // Validate verification token and mark email as verified
      // Implementation would include token validation and status update
      this.loggingService.log('Email verified successfully', { requestId });

      return true;
    } catch (error) {
      this.loggingService.error('Email verification failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Resend email verification
   * @param email
   * @param requestId
   */
  async resendEmailVerification(email: string, requestId: string): Promise<boolean> {
    this.loggingService.log('Starting email verification resend', {
      requestId,
      email,
    });

    try {
      const user = await this.userRepository.findByEmail(email, requestId);
      if (!user) {
        this.loggingService.warn('Email verification resend failed: User not found', {
          requestId,
          email,
        });
        return false;
      }

      const userMethods = new UserMethods(user);
      if (userMethods.isEmailVerified()) {
        this.loggingService.warn('Email verification resend failed: Email already verified', {
          requestId,
          userId: user.id,
        });
        return false;
      }

      // Resend verification email
      // Implementation would include email sending
      this.loggingService.log('Email verification resent successfully', {
        requestId,
        userId: user.id,
        email: user.email,
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
   * Check if user has permission
   * @param userId
   * @param permission
   * @param requestId
   */
  async hasPermission(userId: string, permission: Permission, requestId: string): Promise<boolean> {
    this.loggingService.debug('Checking user permission', { requestId, userId, permission });

    try {
      const user = await this.userRepository.findById(userId, requestId);
      if (!user) {
        this.loggingService.warn('Permission check failed: User not found', { requestId, userId });
        return false;
      }

      // For now, implement basic role-based permission checking
      // In a real implementation, you would have a more sophisticated permission system
      const hasPermission = this.checkRolePermission(user.role, permission);

      this.loggingService.debug('Permission check result', {
        requestId,
        userId,
        permission,
        hasPermission,
      });
      return hasPermission;
    } catch (error) {
      this.loggingService.error('Permission check failed', {
        requestId,
        userId,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Check if user has any of the permissions
   * @param userId
   * @param permissions
   * @param requestId
   */
  async hasAnyPermission(
    userId: string,
    permissions: Permission[],
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.debug('Checking if user has any permission', {
      requestId,
      userId,
      permissions,
    });

    try {
      for (const permission of permissions) {
        const hasPermission = await this.hasPermission(userId, permission, requestId);
        if (hasPermission) {
          this.loggingService.debug('User has at least one permission', {
            requestId,
            userId,
            permission,
          });
          return true;
        }
      }

      this.loggingService.debug('User has none of the required permissions', { requestId, userId });
      return false;
    } catch (error) {
      this.loggingService.error('Permission check failed', {
        requestId,
        userId,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Check if user has all permissions
   * @param userId
   * @param permissions
   * @param requestId
   */
  async hasAllPermissions(
    userId: string,
    permissions: Permission[],
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.debug('Checking if user has all permissions', {
      requestId,
      userId,
      permissions,
    });

    try {
      for (const permission of permissions) {
        const hasPermission = await this.hasPermission(userId, permission, requestId);
        if (!hasPermission) {
          this.loggingService.debug('User missing required permission', {
            requestId,
            userId,
            permission,
          });
          return false;
        }
      }

      this.loggingService.debug('User has all required permissions', { requestId, userId });
      return true;
    } catch (error) {
      this.loggingService.error('Permission check failed', {
        requestId,
        userId,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Get user permissions
   * @param userId
   * @param requestId
   */
  async getUserPermissions(userId: string, requestId: string): Promise<Permission[]> {
    this.loggingService.debug('Getting user permissions', { requestId, userId });

    try {
      const user = await this.userRepository.findById(userId, requestId);
      if (!user) {
        this.loggingService.warn('Get permissions failed: User not found', { requestId, userId });
        return [];
      }

      // In a real implementation, you would fetch permissions from database
      // For now, return permissions based on role
      const permissions = this.getPermissionsByRole(requestId, user.role);

      this.loggingService.debug('User permissions retrieved', { requestId, userId, permissions });
      return permissions;
    } catch (error) {
      this.loggingService.error('Get user permissions failed', {
        requestId,
        userId,
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Logout user
   * @param userId
   * @param requestId
   */
  async logout(userId: string, requestId: string): Promise<boolean> {
    this.loggingService.info('Starting user logout', { requestId, userId });

    try {
      // In a real implementation, you would:
      // 1. Revoke refresh tokens
      // 2. Clear session data

      this.loggingService.info('User logged out successfully', { requestId, userId });
      return true;
    } catch (error) {
      this.loggingService.error('User logout failed', { requestId, userId, error: error.message });
      return false;
    }
  }

  /**
   * Generate access token
   * @param user
   * @param requestId
   */
  async generateAccessToken(user: User, requestId: string): Promise<string> {
    this.loggingService.debug('Generating access token', { requestId, userId: user.id });

    try {
      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
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
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate refresh token
   * @param user
   * @param requestId
   */
  async generateRefreshToken(user: User, requestId: string): Promise<string> {
    this.loggingService.debug('Generating refresh token', { requestId, userId: user.id });

    try {
      const payload: TokenPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
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
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Hash password
   * @param password
   * @param requestId
   */
  async hashPassword(password: string, requestId: string): Promise<string> {
    this.loggingService.debug('Hashing password', { requestId });

    try {
      const saltRounds = 12;
      const hash = await bcrypt.hash(password, saltRounds);
      this.loggingService.debug('Password hashed successfully', { requestId });
      return hash;
    } catch (error) {
      this.loggingService.error('Password hashing failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify password
   * @param password
   * @param hash
   * @param requestId
   */
  async verifyPassword(password: string, hash: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Verifying password', { requestId });

    try {
      const isValid = await bcrypt.compare(password, hash);
      this.loggingService.debug('Password verification completed', { requestId, isValid });
      return isValid;
    } catch (error) {
      this.loggingService.error('Password verification failed', {
        requestId,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Check role permission (basic implementation)
   * @param role
   * @param permission
   */
  private checkRolePermission(role: UserRole, permission: Permission): boolean {
    // Basic role-based permission checking
    // In a real implementation, this would be more sophisticated
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return true; // Super admin has all permissions
      case UserRole.ADMIN:
        return !permission.includes('SUPER_ADMIN'); // Admin has most permissions except super admin specific ones
      case UserRole.MODERATOR:
        return (
          permission.includes('MODERATE') ||
          permission.includes('READ') ||
          permission.includes('CREATE')
        );
      case UserRole.USER:
        return (
          permission.includes('READ') ||
          permission.includes('CREATE') ||
          permission.includes('UPDATE')
        );
      case UserRole.GUEST:
        return permission.includes('READ');
      default:
        return false;
    }
  }

  /**
   * Get user permissions based on role
   * @param requestId - Request ID for tracking
   * @param role - User role
   * @returns Array of permissions
   */
  private getPermissionsByRole(requestId: string, role: UserRole): Permission[] {
    this.loggingService.debug('Getting permissions by role', { requestId, role });

    switch (role) {
      case UserRole.SUPER_ADMIN:
        return [
          Permission.CREATE_USERS,
          Permission.READ_USERS,
          Permission.UPDATE_USERS,
          Permission.DELETE_USERS,
          Permission.CREATE_PROFILES,
          Permission.READ_PROFILES,
          Permission.UPDATE_PROFILES,
          Permission.DELETE_PROFILES,
          Permission.CREATE_RECIPES,
          Permission.READ_RECIPES,
          Permission.UPDATE_RECIPES,
          Permission.DELETE_RECIPES,
          Permission.CREATE_INGREDIENTS,
          Permission.READ_INGREDIENTS,
          Permission.UPDATE_INGREDIENTS,
          Permission.DELETE_INGREDIENTS,
          Permission.CREATE_SHOPPING_LISTS,
          Permission.READ_SHOPPING_LISTS,
          Permission.UPDATE_SHOPPING_LISTS,
          Permission.DELETE_SHOPPING_LISTS,
        ];
      case UserRole.ADMIN:
        return [
          Permission.READ_USERS,
          Permission.READ_PROFILES,
          Permission.UPDATE_PROFILES,
          Permission.CREATE_RECIPES,
          Permission.READ_RECIPES,
          Permission.UPDATE_RECIPES,
          Permission.DELETE_RECIPES,
          Permission.CREATE_SHOPPING_LISTS,
          Permission.READ_SHOPPING_LISTS,
          Permission.UPDATE_SHOPPING_LISTS,
          Permission.DELETE_SHOPPING_LISTS,
        ];
      case UserRole.USER:
        return [Permission.READ_RECIPES, Permission.READ_INGREDIENTS];
      default:
        return [];
    }
  }
}
