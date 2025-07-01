import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole, Permission } from '../interfaces/enums/user.enum';
import { LoggingService } from '../services/logging.service';

/**
 * Role-Based Access Control (RBAC) Guard
 * Enforces role and permission-based access for protected routes.
 * - Checks required roles and permissions from route metadata.
 * - Supports admin bypass and resource ownership checks.
 */
@Injectable()
export class RbacGuard implements CanActivate {
  /**
   *
   * @param userService
   * @param loggingService
   * @param reflector
   */
  constructor(
    private readonly loggingService: LoggingService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Main entry point for RBAC guard.
   * @param context - Nest execution context
   * @returns Promise resolving to true if access is granted
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'] || 'unknown';
    const user = this.getUserFromRequest(request, requestId);

    // 1. Role check
    this.checkRequiredRoles(user, context, requestId);

    // 2. Permission check
    await this.checkRequiredPermissions(user, context, requestId);

    // 3. Admin bypass
    if (this.isAdminBypass(user, context, requestId)) {
      return true;
    }

    // 4. Resource ownership (if required)
    await this.checkResourceOwnershipIfNeeded(request, user, context, requestId);

    this.loggingService.debug('RbacGuard: Access granted', {
      requestId,
      userId: user['id'],
      role: user.role,
    });

    return true;
  }

  /**
   * Extracts user from request.
   * @param request - HTTP request object
   * @param requestId - Request identifier
   * @returns User object
   * @throws ForbiddenException if user is missing
   */
  private getUserFromRequest(
    request: Record<string, unknown>,
    requestId: string,
  ): { id: string; role: UserRole; permissions?: Permission[] } {
    const user = request['user'] as { id: string; role: UserRole; permissions?: Permission[] };
    if (!user) {
      this.loggingService.warn('RbacGuard: No user in request', { requestId });
      throw new ForbiddenException('User not authenticated');
    }
    return user;
  }

  /**
   * Checks if user has required roles.
   * @param user - User object
   * @param user.id
   * @param context - Execution context
   * @param user.role
   * @param requestId - Request identifier
   * @throws ForbiddenException if user lacks required role
   */
  private checkRequiredRoles(
    user: { id: string; role: UserRole },
    context: ExecutionContext,
    requestId: string,
  ): void {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      this.loggingService.warn('RbacGuard: Missing required role', {
        requestId,
        userId: user['id'],
        userRole: user.role,
        requiredRoles,
      });
      throw new ForbiddenException('Insufficient role permissions');
    }
  }

  /**
   * Checks if user has required permissions.
   * @param user - User object
   * @param user.id
   * @param context - Execution context
   * @param user.role
   * @param requestId - Request identifier
   * @param user.permissions
   * @throws ForbiddenException if user lacks required permissions
   */
  private async checkRequiredPermissions(
    user: { id: string; role: UserRole; permissions?: Permission[] },
    context: ExecutionContext,
    requestId: string,
  ): Promise<void> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return;
    }
    // Get user permissions (from request or service)
    let userPermissions: Permission[] = user.permissions ?? [];
    if (userPermissions.length === 0) {
      // TODO: Implement getUserPermissions method in UserService
      userPermissions = [];
    }
    const hasAll = requiredPermissions.every(perm => userPermissions.includes(perm));
    if (!hasAll) {
      this.loggingService.warn('RbacGuard: Missing required permissions', {
        requestId,
        userId: user['id'],
        userPermissions,
        requiredPermissions,
      });
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  /**
   * Checks if admin bypass is enabled and user is admin.
   * @param user - User object
   * @param user.id
   * @param context - Execution context
   * @param user.role
   * @param requestId - Request identifier
   * @returns True if admin bypass is enabled and user is admin
   */
  private isAdminBypass(
    user: { id: string; role: UserRole },
    context: ExecutionContext,
    requestId: string,
  ): boolean {
    const adminBypass = this.reflector.getAllAndOverride<boolean>('adminBypass', [
      context.getHandler(),
      context.getClass(),
    ]);
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
    if (adminBypass && isAdmin) {
      this.loggingService.debug('RbacGuard: Admin bypass granted', {
        requestId,
        userId: user['id'],
        role: user.role,
      });
      return true;
    }
    return false;
  }

  /**
   * Checks resource ownership if required by route metadata.
   * @param request - HTTP request object
   * @param user - User object
   * @param user.id
   * @param context - Execution context
   * @param user.role
   * @param requestId - Request identifier
   * @throws ForbiddenException if user is not resource owner
   */
  private async checkResourceOwnershipIfNeeded(
    request: Record<string, unknown>,
    user: { id: string; role: UserRole },
    context: ExecutionContext,
    requestId: string,
  ): Promise<void> {
    const checkOwnership = this.reflector.getAllAndOverride<boolean>('checkOwnership', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!checkOwnership) return;

    const resourceType = this.getResourceType(request['url'] as string);
    const params = request['params'] as Record<string, unknown>;
    const resourceId = (params?.id as string) ?? '';

    let isOwner = false;
    switch (resourceType) {
      case 'recipes':
        isOwner = await this.checkRecipeOwnership(resourceId, user['id'], requestId);
        break;
      case 'profiles':
        isOwner = await this.checkProfileOwnership(resourceId, user['id'], requestId);
        break;
      case 'shopping-lists':
        isOwner = await this.checkShoppingListOwnership(resourceId, user['id'], requestId);
        break;
      default:
        isOwner = false;
    }
    if (!isOwner && !(user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN)) {
      this.loggingService.warn('RbacGuard: User is not resource owner', {
        requestId,
        userId: user['id'],
        resourceType,
        resourceId,
      });
      throw new ForbiddenException('Access denied to resource');
    }
  }

  /**
   * Extracts resource type from URL.
   * @param url - Request URL
   * @returns Resource type string
   */
  private getResourceType(url: string): string {
    // Example: /api/v1/recipes/123
    const parts = url.split('/');
    // Find the resource type (e.g., 'recipes', 'profiles', etc.)
    return parts.length > 3 ? parts[3] : '';
  }

  /**
   * Checks if user owns the recipe.
   * @param recipeId - Recipe ID
   * @param userId - User ID
   * @param requestId - Request identifier
   * @returns True if user owns the recipe
   */
  private async checkRecipeOwnership(
    recipeId: string,
    userId: string,
    requestId: string,
  ): Promise<boolean> {
    // TODO: Implement actual recipe ownership check via repository/service
    this.loggingService.debug('RbacGuard: Checking recipe ownership', {
      requestId,
      recipeId,
      userId,
    });
    return true;
  }

  /**
   * Checks if user owns the profile.
   * @param profileId - Profile ID
   * @param userId - User ID
   * @param requestId - Request identifier
   * @returns True if user owns the profile
   */
  private async checkProfileOwnership(
    profileId: string,
    userId: string,
    requestId: string,
  ): Promise<boolean> {
    // TODO: Implement actual profile ownership check via repository/service
    this.loggingService.debug('RbacGuard: Checking profile ownership', {
      requestId,
      profileId,
      userId,
    });
    return true;
  }

  /**
   * Checks if user owns the shopping list.
   * @param shoppingListId - Shopping list ID
   * @param userId - User ID
   * @param requestId - Request identifier
   * @returns True if user owns the shopping list
   */
  private async checkShoppingListOwnership(
    shoppingListId: string,
    userId: string,
    requestId: string,
  ): Promise<boolean> {
    // TODO: Implement actual shopping list ownership check via repository/service
    this.loggingService.debug('RbacGuard: Checking shopping list ownership', {
      requestId,
      shoppingListId,
      userId,
    });
    return true;
  }
}
