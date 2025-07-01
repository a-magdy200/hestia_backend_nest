import { SetMetadata } from '@nestjs/common';

import { Permission } from '../interfaces/enums/user.enum';

/**
 * Decorator to require user management permissions
 * @returns Metadata for user management permissions
 */
export const RequireUserManagement = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [
    Permission.READ_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.DELETE_USERS,
  ]);

/**
 * Decorator to require profile management permissions
 * @returns Metadata for profile management permissions
 */
export const RequireProfileManagement = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [
    Permission.READ_PROFILES,
    Permission.UPDATE_PROFILES,
    Permission.DELETE_PROFILES,
  ]);

/**
 * Decorator to require recipe management permissions
 * @returns Metadata for recipe management permissions
 */
export const RequireRecipeManagement = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [
    Permission.READ_RECIPES,
    Permission.CREATE_RECIPES,
    Permission.UPDATE_RECIPES,
    Permission.DELETE_RECIPES,
  ]);

/**
 * Decorator to require ingredient management permissions
 * @returns Metadata for ingredient management permissions
 */
export const RequireIngredientManagement = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [
    Permission.READ_INGREDIENTS,
    Permission.CREATE_INGREDIENTS,
    Permission.UPDATE_INGREDIENTS,
    Permission.DELETE_INGREDIENTS,
  ]);

/**
 * Decorator to require shopping list management permissions
 * @returns Metadata for shopping list management permissions
 */
export const RequireShoppingListManagement = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [
    Permission.READ_SHOPPING_LISTS,
    Permission.CREATE_SHOPPING_LISTS,
    Permission.UPDATE_SHOPPING_LISTS,
    Permission.DELETE_SHOPPING_LISTS,
  ]);

/**
 * Decorator to require system administration permissions
 * @returns Metadata for system admin permissions
 */
export const RequireSystemAdmin = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_TENANTS,
  ]);

/**
 * Decorator to require content moderation permissions
 * @returns Metadata for content moderation permissions
 */
export const RequireContentModeration = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [
    Permission.MODERATE_CONTENT,
    Permission.APPROVE_CONTENT,
    Permission.REJECT_CONTENT,
  ]);

/**
 * Decorator to require notification management permissions
 * @returns Metadata for notification management permissions
 */
export const RequireNotificationManagement = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [Permission.SEND_NOTIFICATIONS, Permission.MANAGE_NOTIFICATIONS]);

/**
 * Decorator to require search permissions
 * @returns Metadata for search permissions
 */
export const RequireSearchPermissions = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [Permission.SEARCH_CONTENT, Permission.ADVANCED_SEARCH]);

/**
 * Decorator to require audit log access
 * @returns Metadata for audit log access
 */
export const RequireAuditAccess = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [Permission.VIEW_AUDIT_LOGS]);

/**
 * Decorator to require API key management
 * @returns Metadata for API key management
 */
export const RequireApiKeyManagement = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [Permission.MANAGE_API_KEYS]);

/**
 * Decorator to require billing management
 * @returns Metadata for billing management
 */
export const RequireBillingManagement = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [Permission.MANAGE_BILLING]);

/**
 * Decorator to require data export permissions
 * @returns Metadata for data export permissions
 */
export const RequireDataExport = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', [Permission.EXPORT_DATA]);
