import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserProfile } from '../database/entities/user-profile.entity';
import { Recipe } from '../database/entities/recipe.entity';
import { ShoppingList } from '../database/entities/shopping-list.entity';
import { UserRole, Permission } from '../interfaces/enums/user.enum';
import { AuthenticationService } from '../services/authentication/authentication.service';
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
   * Constructor for RbacGuard
   * @param userProfileRepository
   * @param recipeRepository
   * @param shoppingListRepository
   * @param authenticationService
   * @param loggingService
   * @param reflector
   */
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(ShoppingList)
    private readonly shoppingListRepository: Repository<ShoppingList>,
    private readonly authenticationService: AuthenticationService,
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

    // Get user permissions from authentication service
    const userPermissions = await this.authenticationService.getUserPermissions(user.id, requestId);

    const hasAll = requiredPermissions.every(perm => userPermissions.includes(perm));
    if (!hasAll) {
      this.loggingService.warn('RbacGuard: Missing required permissions', {
        requestId,
        userId: user.id,
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
        userId: user.id,
        role: user.role,
      });
      return true;
    }
    return false;
  }

  /**
   * Check ownership for a specific resource type
   * @param resourceType - Type of resource
   * @param resourceId - Resource ID
   * @param userId - User ID
   * @param requestId - Request identifier
   * @returns True if user owns the resource
   */
  private async checkResourceOwnership(
    resourceType: string,
    resourceId: string,
    userId: string,
    requestId: string,
  ): Promise<boolean> {
    switch (resourceType) {
      case 'recipes':
        return await this.checkRecipeOwnership(resourceId, userId, requestId);
      case 'profiles':
        return await this.checkProfileOwnership(resourceId, userId, requestId);
      case 'shopping-lists':
        return await this.checkShoppingListOwnership(resourceId, userId, requestId);
      default:
        return false;
    }
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
    const resourceId = (params?.['id'] as string) ?? '';

    const isOwner = await this.checkResourceOwnership(
      resourceType,
      resourceId,
      user['id'],
      requestId,
    );
    const isAdmin = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;

    if (!isOwner && !isAdmin) {
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
    return parts.length > 3 ? parts[3] || '' : '';
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
    try {
      this.loggingService.debug('RbacGuard: Checking recipe ownership', {
        requestId,
        recipeId,
        userId,
      });

      const recipe = await this.recipeRepository.findOne({
        where: { id: recipeId },
        select: ['id', 'userId'],
      });

      if (!recipe) {
        this.loggingService.warn('RbacGuard: Recipe not found', {
          requestId,
          recipeId,
          userId,
        });
        return false;
      }

      const isOwner = recipe['userId'] === userId;

      this.loggingService.debug('RbacGuard: Recipe ownership check result', {
        requestId,
        recipeId,
        userId,
        isOwner,
      });

      return isOwner;
    } catch (error) {
      this.loggingService.error('RbacGuard: Recipe ownership check failed', {
        requestId,
        recipeId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
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
    try {
      this.loggingService.debug('RbacGuard: Checking profile ownership', {
        requestId,
        profileId,
        userId,
      });

      const profile = await this.userProfileRepository.findOne({
        where: { id: profileId },
        select: ['id', 'userId'],
      });

      if (!profile) {
        this.loggingService.warn('RbacGuard: Profile not found', {
          requestId,
          profileId,
          userId,
        });
        return false;
      }

      const isOwner = profile.userId === userId;

      this.loggingService.debug('RbacGuard: Profile ownership check result', {
        requestId,
        profileId,
        userId,
        isOwner,
      });

      return isOwner;
    } catch (error) {
      this.loggingService.error('RbacGuard: Profile ownership check failed', {
        requestId,
        profileId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
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
    try {
      this.loggingService.debug('RbacGuard: Checking shopping list ownership', {
        requestId,
        shoppingListId,
        userId,
      });

      const shoppingList = await this.shoppingListRepository.findOne({
        where: { id: shoppingListId },
        select: ['id', 'userId'],
      });

      if (!shoppingList) {
        this.loggingService.warn('RbacGuard: Shopping list not found', {
          requestId,
          shoppingListId,
          userId,
        });
        return false;
      }

      const isOwner = shoppingList.userId === userId;

      this.loggingService.debug('RbacGuard: Shopping list ownership check result', {
        requestId,
        shoppingListId,
        userId,
        isOwner,
      });

      return isOwner;
    } catch (error) {
      this.loggingService.error('RbacGuard: Shopping list ownership check failed', {
        requestId,
        shoppingListId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}
