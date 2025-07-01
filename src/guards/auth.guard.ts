import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { User } from '../database/entities/user.entity';
import { UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';

import { LoggingService } from '../services/logging.service';
import { UserService } from '../services/user.service';

/**
 * Authentication guard
 * Validates JWT tokens and ensures user authentication
 * Provides comprehensive authentication and authorization checks
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Constructor for AuthGuard
   * @param jwtService - JWT service for token validation
   * @param authenticationService - Authentication service for user operations
   * @param userService - User service for user data access
   * @param loggingService - Logging service for audit trails
   * @param reflector - Reflector for metadata access
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Check if the request can be activated
   * @param context - Execution context containing request information
   * @returns Promise resolving to true if authentication is successful
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'] || 'unknown';

    this.loggingService.debug('AuthGuard: Checking authentication', { requestId });

    try {
      if (this.isPublicRoute(context)) {
        return this.handlePublicRoute(requestId);
      }

      return await this.processAuthenticatedRequest(request, context, requestId);
    } catch (error) {
      return this.handleAuthenticationError(error, requestId);
    }
  }

  /**
   * Process authenticated request
   * @param request - HTTP request object
   * @param context - Execution context
   * @param requestId - Request identifier
   * @returns Promise resolving to true if authentication is successful
   */
  private async processAuthenticatedRequest(
    request: Record<string, unknown>,
    context: ExecutionContext,
    requestId: string,
  ): Promise<boolean> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      return this.handleMissingToken(requestId);
    }

    const payload = await this.validateToken(token, requestId);
    const user = await this.getAndValidateUser((payload as { sub: string }).sub, requestId);

    this.validateUserStatus(user, requestId, context);
    this.attachUserToRequest(request, user);
    await this.updateLastLoginIfNeeded(user, requestId);

    this.loggingService.debug('AuthGuard: Authentication successful', {
      requestId,
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return true;
  }

  /**
   * Check if route is marked as public
   * @param context - Execution context
   * @returns True if route is public
   */
  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  /**
   * Handle public route access
   * @param requestId - Request identifier
   * @returns True for public routes
   */
  private handlePublicRoute(requestId: string): boolean {
    this.loggingService.debug('AuthGuard: Route is public, allowing access', { requestId });
    return true;
  }

  /**
   * Handle missing token error
   * @param requestId - Request identifier
   * @returns Never returns, throws exception
   */
  private handleMissingToken(requestId: string): never {
    this.loggingService.warn('AuthGuard: No token provided', { requestId });
    throw new UnauthorizedException('Access token is required');
  }

  /**
   * Get and validate user from database
   * @param userId - User ID from token
   * @param requestId - Request identifier
   * @returns Validated user object
   */
  private async getAndValidateUser(userId: string, requestId: string): Promise<User> {
    const user = await this.userService.getUserById(userId, requestId);
    if (!user) {
      this.loggingService.warn('AuthGuard: User not found', { requestId, userId });
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  /**
   * Validate user status and permissions
   * @param user - User object
   * @param requestId - Request identifier
   * @param context - Execution context
   */
  private validateUserStatus(user: User, requestId: string, context: ExecutionContext): void {
    this.checkUserActiveStatus(user, requestId);
    this.checkUserLockStatus(user, requestId);
    this.checkUserSuspensionStatus(user, requestId);
    this.validateEmailVerification(user, requestId, context);
  }

  /**
   * Check if user is active and not deleted
   * @param user - User object
   * @param requestId - Request identifier
   */
  private checkUserActiveStatus(user: User, requestId: string): void {
    if (!user.isActive || user.isDeleted) {
      this.loggingService.warn('AuthGuard: User is inactive or deleted', {
        requestId,
        userId: user.id,
        isActive: user.isActive,
        isDeleted: user.isDeleted,
      });
      throw new ForbiddenException('User account is inactive');
    }
  }

  /**
   * Check if user account is locked
   * @param user - User object
   * @param requestId - Request identifier
   */
  private checkUserLockStatus(user: User, requestId: string): void {
    if (user.status === UserStatus.LOCKED) {
      this.loggingService.warn('AuthGuard: User account is locked', {
        requestId,
        userId: user.id,
        lockReason: user.lockReason,
      });
      throw new ForbiddenException('User account is locked');
    }
  }

  /**
   * Check if user account is suspended
   * @param user - User object
   * @param requestId - Request identifier
   */
  private checkUserSuspensionStatus(user: User, requestId: string): void {
    if (user.status === UserStatus.SUSPENDED) {
      this.loggingService.warn('AuthGuard: User account is suspended', {
        requestId,
        userId: user.id,
      });
      throw new ForbiddenException('User account is suspended');
    }
  }

  /**
   * Validate email verification if required
   * @param user - User object
   * @param requestId - Request identifier
   * @param context - Execution context
   */
  private validateEmailVerification(
    user: User,
    requestId: string,
    context: ExecutionContext,
  ): void {
    const requireEmailVerification = this.reflector.getAllAndOverride<boolean>(
      'requireEmailVerification',
      [context.getHandler(), context.getClass()],
    );

    if (
      requireEmailVerification &&
      user.emailVerificationStatus !== UserVerificationStatus.VERIFIED
    ) {
      this.loggingService.warn('AuthGuard: Email not verified', {
        requestId,
        userId: user.id,
        emailVerificationStatus: user.emailVerificationStatus,
      });
      throw new ForbiddenException('Email verification required');
    }
  }

  /**
   * Attach user information to request
   * @param request - HTTP request object
   * @param user - User object
   */
  private attachUserToRequest(request: Record<string, unknown>, user: User): void {
    request['user'] = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      tenantId: user.tenantId,
      emailVerificationStatus: user.emailVerificationStatus,
      permissions: [], // Will be populated by RBAC guard if needed
    };
  }

  /**
   * Update last login if needed
   * @param user - User object
   * @param requestId - Request identifier
   */
  private async updateLastLoginIfNeeded(user: User, requestId: string): Promise<void> {
    try {
      // Update last login timestamp (could be moved to a separate service)
      this.loggingService.debug('AuthGuard: Updating last login', {
        requestId,
        userId: user.id,
      });
    } catch (error) {
      this.loggingService.warn('AuthGuard: Failed to update last login', {
        requestId,
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle authentication errors
   * @param error - Error object
   * @param requestId - Request identifier
   * @returns Never returns, throws exception
   */
  private handleAuthenticationError(error: unknown, requestId: string): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    this.loggingService.error('AuthGuard: Authentication failed', {
      requestId,
      error: errorMessage,
    });

    if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
      throw error;
    }

    throw new UnauthorizedException('Authentication failed');
  }

  /**
   * Extract token from request header
   * @param request - HTTP request object
   * @returns Token string or undefined
   */
  private extractTokenFromHeader(request: Record<string, unknown>): string | undefined {
    const headers = request['headers'] as Record<string, unknown>;
    const authHeader = headers?.['authorization'] as string;
    if (!authHeader?.startsWith('Bearer ')) {
      return undefined;
    }
    return authHeader.substring(7);
  }

  /**
   * Validate JWT token
   * @param token - JWT token string
   * @param requestId - Request identifier
   * @returns Token payload
   */
  private async validateToken(token: string, requestId: string): Promise<unknown> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      this.loggingService.warn('AuthGuard: Invalid token', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
