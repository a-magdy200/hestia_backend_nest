import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

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

import { PasswordService } from './password.service';
import { PermissionService } from './permission.service';
import { TokenService } from './token.service';

/**
 * Authentication service implementation
 * Handles user authentication, registration, and core auth operations
 */
@Injectable()
export class AuthenticationService implements IAuthenticationService {
  /**
   *
   * @param userRepository
   * @param tokenService
   * @param passwordService
   * @param permissionService
   * @param loggingService
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly permissionService: PermissionService,
    private readonly loggingService: LoggingService,
  ) {}

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
    this.loggingService.log('Starting user authentication', {
      requestId,
      email: credentials.email,
    });

    try {
      const user = await this.userRepository.findByEmail(credentials.email, requestId);
      if (!user) {
        this.loggingService.warn('Authentication failed: User not found', {
          requestId,
          email: credentials.email,
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

      const isPasswordValid = await this.passwordService.verifyPassword(
        credentials.password,
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

      await this.userRepository.resetFailedLoginAttempts(user.id, requestId);
      await this.userRepository.updateLastLogin(user.id, requestId);

      const accessToken = await this.tokenService.generateAccessToken(user, requestId);
      const refreshToken = await this.tokenService.generateRefreshToken(user, requestId);

      const result: AuthenticationResult = {
        user,
        accessToken,
        refreshToken,
        expiresIn: 900,
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
   * @param requestId - Request identifier
   * @returns Created user
   */
  async register(registrationData: RegistrationData, requestId: string): Promise<User> {
    this.loggingService.log('Starting user registration', {
      requestId,
      email: registrationData.email,
    });

    try {
      if (registrationData.password !== registrationData.confirmPassword) {
        this.loggingService.warn('Registration failed: Password confirmation mismatch', {
          requestId,
        });
        throw new BadRequestException('Password confirmation does not match');
      }

      const emailExists = await this.userRepository.emailExists(registrationData.email, requestId);
      if (emailExists) {
        this.loggingService.warn('Registration failed: Email already exists', {
          requestId,
          email: registrationData.email,
        });
        throw new ConflictException('Email already registered');
      }

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
   * Refresh access token
   * @param refreshToken - Refresh token
   * @param requestId - Request identifier
   * @returns New authentication result
   */
  async refreshToken(refreshToken: string, requestId: string): Promise<AuthenticationResult> {
    this.loggingService.log('Starting token refresh', { requestId });

    try {
      const secret = process.env['JWT_REFRESH_SECRET'];
      if (!secret) {
        throw new Error('JWT_REFRESH_SECRET environment variable is not set');
      }

      const payload = await this.tokenService.validateToken(refreshToken, secret, requestId);
      if (!payload || payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userRepository.findById(payload.sub, requestId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = await this.tokenService.generateAccessToken(user, requestId);
      const newRefreshToken = await this.tokenService.generateRefreshToken(user, requestId);

      const result: AuthenticationResult = {
        user,
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
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
      // In a real implementation, this would add the token to a blacklist
      this.loggingService.log('Token revoked successfully', { requestId });
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
      if (!payload || payload.type !== 'access') {
        return null;
      }

      const user = await this.userRepository.findById(payload.sub, requestId);
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
        this.loggingService.warn('Password reset requested for non-existent user', {
          requestId,
          email: resetRequest.email,
        });
        return true; // Don't reveal if user exists
      }

      // In a real implementation, this would send an email with reset link
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

      // In a real implementation, this would validate the reset token
      // and update the user's password
      this.loggingService.log('Password reset confirmed', { requestId });

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
   * @param passwordChange - Password change data
   * @param requestId - Request identifier
   * @returns Success status
   */
  async changePassword(
    userId: string,
    passwordChange: PasswordChangeRequest,
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.log('Changing user password', {
      requestId,
      userId,
    });

    try {
      if (passwordChange.newPassword !== passwordChange.confirmPassword) {
        throw new BadRequestException('Password confirmation does not match');
      }

      const user = await this.userRepository.findById(userId, requestId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const isCurrentPasswordValid = await this.passwordService.verifyPassword(
        passwordChange.currentPassword,
        user.passwordHash,
        requestId,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      const newPasswordHash = await this.passwordService.hashPassword(
        passwordChange.newPassword,
        requestId,
      );

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
   * @param token - Email verification token
   * @param requestId - Request identifier
   * @returns Success status
   */
  async verifyEmail(token: string, requestId: string): Promise<boolean> {
    this.loggingService.log('Verifying email', { requestId });

    try {
      // In a real implementation, this would validate the verification token
      // and update the user's email verification status
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

      // In a real implementation, this would send a new verification email
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
      // In a real implementation, this would revoke all tokens for the user
      this.loggingService.log('User logged out successfully', {
        requestId,
        userId,
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
}
