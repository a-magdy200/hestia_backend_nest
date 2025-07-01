import { Injectable } from '@nestjs/common';

import { UserRole, Permission } from '../../interfaces/enums/user.enum';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { LoggingService } from '../logging.service';
import { User } from '../../database/entities/user.entity';

/**
 * Permission service for authorization
 * Handles role-based access control and permission checking
 */
@Injectable()
export class PermissionService {
  /**
   * Constructor for PermissionService
   * @param userRepository - User repository for data access
   * @param loggingService - Logging service for audit trails
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Check if user has specific permission
   * @param userId - User ID
   * @param permission - Permission to check
   * @param requestId - Request identifier
   * @returns Whether user has permission
   */
  async hasPermission(userId: string, permission: Permission, requestId: string): Promise<boolean> {
    this.loggingService.debug('Checking user permission', { requestId, userId, permission });

    try {
      const user = await this.userRepository.findById(userId, requestId);
      if (!user) {
        this.loggingService.warn('Permission check failed: User not found', { requestId, userId });
        return false;
      }

      const userPermissions = await this.getUserPermissions(userId, requestId);
      const hasPermission = userPermissions.includes(permission);

      this.loggingService.debug('Permission check completed', {
        requestId,
        userId,
        permission,
        hasPermission,
        userRole: user.role,
      });

      return hasPermission;
    } catch (error) {
      this.loggingService.error('Permission check failed', {
        requestId,
        userId,
        permission,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
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
    this.loggingService.debug('Checking if user has any permission', {
      requestId,
      userId,
      permissions,
    });

    try {
      const userPermissions = await this.getUserPermissions(userId, requestId);
      const hasAny = permissions.some(permission => userPermissions.includes(permission));

      this.loggingService.debug('Any permission check completed', {
        requestId,
        userId,
        permissions,
        hasAny,
        userPermissions,
      });

      return hasAny;
    } catch (error) {
      this.loggingService.error('Any permission check failed', {
        requestId,
        userId,
        permissions,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
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
    this.loggingService.debug('Checking if user has all permissions', {
      requestId,
      userId,
      permissions,
    });

    try {
      const userPermissions = await this.getUserPermissions(userId, requestId);
      const hasAll = permissions.every(permission => userPermissions.includes(permission));

      this.loggingService.debug('All permissions check completed', {
        requestId,
        userId,
        permissions,
        hasAll,
        userPermissions,
      });

      return hasAll;
    } catch (error) {
      this.loggingService.error('All permissions check failed', {
        requestId,
        userId,
        permissions,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Get user permissions based on role
   * @param userId - User ID
   * @param requestId - Request identifier
   * @returns Array of user permissions
   */
  async getUserPermissions(userId: string, requestId: string): Promise<Permission[]> {
    this.loggingService.debug('Getting user permissions', { requestId, userId });

    try {
      const user = await this.userRepository.findById(userId, requestId);
      if (!user) {
        this.loggingService.warn('Get permissions failed: User not found', { requestId, userId });
        return [];
      }

      const permissions = this.getPermissionsByRole(user.role, requestId);

      this.loggingService.debug('User permissions retrieved', {
        requestId,
        userId,
        role: user.role,
        permissions,
      });

      return permissions;
    } catch (error) {
      this.loggingService.error('Get user permissions failed', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  /**
   * Get permissions for a specific role
   * @param role - User role
   * @param requestId - Request identifier
   * @returns Array of permissions for the role
   */
  private getPermissionsByRole(role: UserRole, requestId: string): Permission[] {
    this.loggingService.debug('Getting permissions by role', { requestId, role });

    const permissions = this.getRolePermissions(role);

    this.loggingService.debug('Permissions by role retrieved', {
      requestId,
      role,
      permissionCount: permissions.length,
    });

    return permissions;
  }

  /**
   * Get permissions for a specific role
   */
  private getRolePermissions(role: UserRole): Permission[] {
    const rolePermissions: Record<UserRole, Permission[]> = {
      [UserRole.SUPER_ADMIN]: this.getSuperAdminPermissions(),
      [UserRole.ADMIN]: this.getAdminPermissions(),
      [UserRole.MODERATOR]: this.getModeratorPermissions(),
      [UserRole.USER]: this.getBasicUserPermissions(),
      [UserRole.GUEST]: this.getGuestPermissions(),
      [UserRole.BETA_TESTER]: this.getBetaTesterPermissions(),
      [UserRole.PREMIUM_USER]: this.getPremiumUserPermissions(),
    };

    return rolePermissions[role] || [];
  }

  /**
   * Get super admin permissions
   */
  private getSuperAdminPermissions(): Permission[] {
    return [
      Permission.READ_USERS,
      Permission.CREATE_USERS,
      Permission.UPDATE_USERS,
      Permission.DELETE_USERS,
      Permission.MANAGE_USER_ROLES,
      Permission.SUSPEND_USERS,
      Permission.UNLOCK_USERS,
      Permission.READ_PROFILES,
      Permission.UPDATE_PROFILES,
      Permission.DELETE_PROFILES,
      Permission.READ_RECIPES,
      Permission.CREATE_RECIPES,
      Permission.UPDATE_RECIPES,
      Permission.DELETE_RECIPES,
      Permission.PUBLISH_RECIPES,
      Permission.APPROVE_RECIPES,
      Permission.READ_INGREDIENTS,
      Permission.CREATE_INGREDIENTS,
      Permission.UPDATE_INGREDIENTS,
      Permission.DELETE_INGREDIENTS,
      Permission.APPROVE_INGREDIENTS,
      Permission.READ_SHOPPING_LISTS,
      Permission.CREATE_SHOPPING_LISTS,
      Permission.UPDATE_SHOPPING_LISTS,
      Permission.DELETE_SHOPPING_LISTS,
      Permission.MANAGE_SYSTEM_SETTINGS,
      Permission.VIEW_ANALYTICS,
      Permission.MANAGE_TENANTS,
      Permission.MANAGE_BILLING,
      Permission.VIEW_AUDIT_LOGS,
      Permission.MANAGE_API_KEYS,
      Permission.MODERATE_CONTENT,
      Permission.APPROVE_CONTENT,
      Permission.REJECT_CONTENT,
      Permission.FLAG_CONTENT,
      Permission.SEND_NOTIFICATIONS,
      Permission.MANAGE_NOTIFICATIONS,
      Permission.READ_NOTIFICATIONS,
      Permission.SEARCH_CONTENT,
      Permission.ADVANCED_SEARCH,
      Permission.EXPORT_DATA,
    ];
  }

  /**
   * Get admin permissions
   */
  private getAdminPermissions(): Permission[] {
    return [
      Permission.READ_USERS,
      Permission.CREATE_USERS,
      Permission.UPDATE_USERS,
      Permission.DELETE_USERS,
      Permission.MANAGE_USER_ROLES,
      Permission.SUSPEND_USERS,
      Permission.UNLOCK_USERS,
      Permission.READ_PROFILES,
      Permission.UPDATE_PROFILES,
      Permission.DELETE_PROFILES,
      Permission.READ_RECIPES,
      Permission.CREATE_RECIPES,
      Permission.UPDATE_RECIPES,
      Permission.DELETE_RECIPES,
      Permission.PUBLISH_RECIPES,
      Permission.APPROVE_RECIPES,
      Permission.READ_INGREDIENTS,
      Permission.CREATE_INGREDIENTS,
      Permission.UPDATE_INGREDIENTS,
      Permission.DELETE_INGREDIENTS,
      Permission.APPROVE_INGREDIENTS,
      Permission.READ_SHOPPING_LISTS,
      Permission.CREATE_SHOPPING_LISTS,
      Permission.UPDATE_SHOPPING_LISTS,
      Permission.DELETE_SHOPPING_LISTS,
      Permission.VIEW_ANALYTICS,
      Permission.MANAGE_TENANTS,
      Permission.VIEW_AUDIT_LOGS,
      Permission.MODERATE_CONTENT,
      Permission.APPROVE_CONTENT,
      Permission.REJECT_CONTENT,
      Permission.FLAG_CONTENT,
      Permission.SEND_NOTIFICATIONS,
      Permission.MANAGE_NOTIFICATIONS,
      Permission.READ_NOTIFICATIONS,
      Permission.SEARCH_CONTENT,
      Permission.ADVANCED_SEARCH,
      Permission.EXPORT_DATA,
    ];
  }

  /**
   * Get moderator permissions
   */
  private getModeratorPermissions(): Permission[] {
    return [
      Permission.READ_USERS,
      Permission.READ_PROFILES,
      Permission.UPDATE_PROFILES,
      Permission.READ_RECIPES,
      Permission.CREATE_RECIPES,
      Permission.UPDATE_RECIPES,
      Permission.DELETE_RECIPES,
      Permission.APPROVE_RECIPES,
      Permission.READ_INGREDIENTS,
      Permission.CREATE_INGREDIENTS,
      Permission.UPDATE_INGREDIENTS,
      Permission.DELETE_INGREDIENTS,
      Permission.APPROVE_INGREDIENTS,
      Permission.READ_SHOPPING_LISTS,
      Permission.CREATE_SHOPPING_LISTS,
      Permission.UPDATE_SHOPPING_LISTS,
      Permission.DELETE_SHOPPING_LISTS,
      Permission.VIEW_AUDIT_LOGS,
      Permission.MODERATE_CONTENT,
      Permission.APPROVE_CONTENT,
      Permission.REJECT_CONTENT,
      Permission.FLAG_CONTENT,
      Permission.READ_NOTIFICATIONS,
      Permission.SEARCH_CONTENT,
    ];
  }

  /**
   * Get basic user permissions
   */
  private getBasicUserPermissions(): Permission[] {
    return [
      Permission.READ_OWN_PROFILE,
      Permission.UPDATE_OWN_PROFILE,
      Permission.READ_OWN_RECIPES,
      Permission.CREATE_OWN_RECIPES,
      Permission.UPDATE_OWN_RECIPES,
      Permission.DELETE_OWN_RECIPES,
      Permission.READ_INGREDIENTS,
      Permission.CREATE_INGREDIENTS,
      Permission.UPDATE_INGREDIENTS,
      Permission.DELETE_INGREDIENTS,
      Permission.READ_OWN_SHOPPING_LISTS,
      Permission.CREATE_OWN_SHOPPING_LISTS,
      Permission.UPDATE_OWN_SHOPPING_LISTS,
      Permission.DELETE_OWN_SHOPPING_LISTS,
      Permission.READ_NOTIFICATIONS,
      Permission.SEARCH_CONTENT,
      Permission.FLAG_CONTENT,
    ];
  }

  /**
   * Get guest permissions
   */
  private getGuestPermissions(): Permission[] {
    return [Permission.READ_RECIPES, Permission.READ_INGREDIENTS, Permission.SEARCH_CONTENT];
  }

  /**
   * Get beta tester permissions
   */
  private getBetaTesterPermissions(): Permission[] {
    return [
      Permission.READ_OWN_PROFILE,
      Permission.UPDATE_OWN_PROFILE,
      Permission.READ_OWN_RECIPES,
      Permission.CREATE_OWN_RECIPES,
      Permission.UPDATE_OWN_RECIPES,
      Permission.DELETE_OWN_RECIPES,
      Permission.READ_INGREDIENTS,
      Permission.CREATE_INGREDIENTS,
      Permission.UPDATE_INGREDIENTS,
      Permission.DELETE_INGREDIENTS,
      Permission.READ_OWN_SHOPPING_LISTS,
      Permission.CREATE_OWN_SHOPPING_LISTS,
      Permission.UPDATE_OWN_SHOPPING_LISTS,
      Permission.DELETE_OWN_SHOPPING_LISTS,
      Permission.READ_NOTIFICATIONS,
      Permission.SEARCH_CONTENT,
      Permission.ADVANCED_SEARCH,
      Permission.FLAG_CONTENT,
    ];
  }

  /**
   * Get premium user permissions
   */
  private getPremiumUserPermissions(): Permission[] {
    return [
      Permission.READ_OWN_PROFILE,
      Permission.UPDATE_OWN_PROFILE,
      Permission.READ_OWN_RECIPES,
      Permission.CREATE_OWN_RECIPES,
      Permission.UPDATE_OWN_RECIPES,
      Permission.DELETE_OWN_RECIPES,
      Permission.READ_INGREDIENTS,
      Permission.CREATE_INGREDIENTS,
      Permission.UPDATE_INGREDIENTS,
      Permission.DELETE_INGREDIENTS,
      Permission.READ_OWN_SHOPPING_LISTS,
      Permission.CREATE_OWN_SHOPPING_LISTS,
      Permission.UPDATE_OWN_SHOPPING_LISTS,
      Permission.DELETE_OWN_SHOPPING_LISTS,
      Permission.READ_NOTIFICATIONS,
      Permission.SEARCH_CONTENT,
      Permission.ADVANCED_SEARCH,
      Permission.EXPORT_DATA,
      Permission.FLAG_CONTENT,
    ];
  }

  /**
   * Check if user can access resource
   * @param userId - User ID
   * @param resourceType - Type of resource
   * @param resourceId - Resource ID
   * @param action - Action to perform
   * @param requestId - Request identifier
   * @returns Whether user can access resource
   */
  async canAccessResource(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.debug('Checking resource access', {
      requestId,
      userId,
      resourceType,
      resourceId,
      action,
    });

    try {
      const user = await this.getUserForAccessCheck(userId, requestId);
      if (!user) {
        return false;
      }

      if (this.isAdminUser(user)) {
        this.logAdminAccessGranted(requestId, userId, user.role);
        return true;
      }

      if (await this.isResourceOwner(userId, resourceType, resourceId, requestId)) {
        this.logOwnerAccessGranted(requestId, userId, resourceType, resourceId);
        return true;
      }

      return await this.checkPermissionBasedAccess(
        userId,
        resourceType,
        resourceId,
        action,
        requestId,
      );
    } catch (error) {
      this.logResourceAccessError(requestId, userId, resourceType, resourceId, action, error);
      return false;
    }
  }

  /**
   * Get user for access check
   */
  private async getUserForAccessCheck(userId: string, requestId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId, requestId);
    if (!user) {
      this.loggingService.warn('Resource access check failed: User not found', {
        requestId,
        userId,
      });
    }
    return user;
  }

  /**
   * Check if user is admin
   */
  private isAdminUser(user: { role: UserRole }): boolean {
    return user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;
  }

  /**
   * Log admin access granted
   */
  private logAdminAccessGranted(requestId: string, userId: string, role: UserRole): void {
    this.loggingService.debug('Resource access granted for admin role', {
      requestId,
      userId,
      role,
    });
  }

  /**
   * Log owner access granted
   */
  private logOwnerAccessGranted(
    requestId: string,
    userId: string,
    resourceType: string,
    resourceId: string,
  ): void {
    this.loggingService.debug('Resource access granted for owner', {
      requestId,
      userId,
      resourceType,
      resourceId,
    });
  }

  /**
   * Check permission-based access
   */
  private async checkPermissionBasedAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    requestId: string,
  ): Promise<boolean> {
    const requiredPermission = this.mapActionToPermission(action, resourceType);
    if (!requiredPermission) {
      return false;
    }

    const hasPermission = await this.hasPermission(userId, requiredPermission, requestId);

    this.loggingService.debug('Resource access check completed', {
      requestId,
      userId,
      resourceType,
      resourceId,
      action,
      requiredPermission,
      hasPermission,
    });

    return hasPermission;
  }

  /**
   * Log resource access error
   */
  private logResourceAccessError(
    requestId: string,
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    error: unknown,
  ): void {
    this.loggingService.error('Resource access check failed', {
      requestId,
      userId,
      resourceType,
      resourceId,
      action,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  /**
   * Check if user is resource owner
   * @param userId - User ID
   * @param resourceType - Type of resource
   * @param resourceId - Resource ID
   * @param requestId - Request identifier
   * @returns Whether user is resource owner
   */
  private async isResourceOwner(
    userId: string,
    resourceType: string,
    resourceId: string,
    requestId: string,
  ): Promise<boolean> {
    // This would typically query the database to check ownership
    // For now, return false as a placeholder
    this.loggingService.debug('Checking resource ownership', {
      requestId,
      userId,
      resourceType,
      resourceId,
    });

    return false;
  }

  /**
   * Map action to permission
   * @param action - Action to perform
   * @param resourceType - Type of resource
   * @returns Required permission or null
   */
  private mapActionToPermission(action: string, resourceType: string): Permission | null {
    const actionMap: Record<string, Record<string, Permission>> = {
      create: {
        user: Permission.CREATE_USERS,
        profile: Permission.READ_PROFILES, // Profiles are created with users
        recipe: Permission.CREATE_RECIPES,
        ingredient: Permission.CREATE_INGREDIENTS,
        'shopping-list': Permission.CREATE_SHOPPING_LISTS,
      },
      read: {
        user: Permission.READ_USERS,
        profile: Permission.READ_PROFILES,
        recipe: Permission.READ_RECIPES,
        ingredient: Permission.READ_INGREDIENTS,
        'shopping-list': Permission.READ_SHOPPING_LISTS,
      },
      update: {
        user: Permission.UPDATE_USERS,
        profile: Permission.UPDATE_PROFILES,
        recipe: Permission.UPDATE_RECIPES,
        ingredient: Permission.UPDATE_INGREDIENTS,
        'shopping-list': Permission.UPDATE_SHOPPING_LISTS,
      },
      delete: {
        user: Permission.DELETE_USERS,
        profile: Permission.DELETE_PROFILES,
        recipe: Permission.DELETE_RECIPES,
        ingredient: Permission.DELETE_INGREDIENTS,
        'shopping-list': Permission.DELETE_SHOPPING_LISTS,
      },
      manage: {
        user: Permission.MANAGE_USER_ROLES,
        profile: Permission.READ_PROFILES, // Use read as base for manage
        recipe: Permission.APPROVE_RECIPES,
        ingredient: Permission.APPROVE_INGREDIENTS,
        'shopping-list': Permission.READ_SHOPPING_LISTS, // Use read as base for manage
      },
    };

    return actionMap[action]?.[resourceType] || null;
  }
}
