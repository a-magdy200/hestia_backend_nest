/**
 * Role-related enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all role-related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * Role status options
 * @description Defines the possible states of a role
 */
export enum RoleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
}

/**
 * Role types
 * @description Defines the different types of roles in the system
 */
export enum RoleType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
  TEMPLATE = 'template',
  INHERITED = 'inherited',
}

/**
 * Role priority levels
 * @description Defines the priority levels for role conflict resolution
 */
export enum RolePriority {
  LOWEST = 0,
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  HIGHEST = 15,
  CRITICAL = 20,
}

/**
 * Permission categories
 * @description Defines the main categories of permissions
 */
export enum PermissionCategory {
  USER_MANAGEMENT = 'user_management',
  ROLE_MANAGEMENT = 'role_management',
  RECIPE_MANAGEMENT = 'recipe_management',
  INGREDIENT_MANAGEMENT = 'ingredient_management',
  SHOPPING_LIST_MANAGEMENT = 'shopping_list_management',
  TENANT_MANAGEMENT = 'tenant_management',
  SYSTEM_ADMINISTRATION = 'system_administration',
  ANALYTICS = 'analytics',
  NOTIFICATIONS = 'notifications',
  AUDIT_LOGS = 'audit_logs',
  API_KEYS = 'api_keys',
  BILLING = 'billing',
  SETTINGS = 'settings',
}

/**
 * Permission actions
 * @description Defines the available actions for permissions
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  APPROVE = 'approve',
  REJECT = 'reject',
  PUBLISH = 'publish',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  EXPORT = 'export',
  IMPORT = 'import',
  ASSIGN = 'assign',
  REVOKE = 'revoke',
  MANAGE = 'manage',
  VIEW = 'view',
  EDIT = 'edit',
  ADMINISTER = 'administer',
}

/**
 * Role inheritance types
 * @description Defines how roles can inherit from parent roles
 */
export enum RoleInheritanceType {
  NONE = 'none',
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  HIERARCHICAL = 'hierarchical',
}

/**
 * Role scope levels
 * @description Defines the scope levels for roles
 */
export enum RoleScope {
  GLOBAL = 'global',
  TENANT = 'tenant',
  ORGANIZATION = 'organization',
  TEAM = 'team',
  PROJECT = 'project',
  USER = 'user',
}

/**
 * Role template types
 * @description Defines the available role templates
 */
export enum RoleTemplate {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
  BETA_TESTER = 'beta_tester',
  PREMIUM_USER = 'premium_user',
  CONTENT_CREATOR = 'content_creator',
  CONTENT_REVIEWER = 'content_reviewer',
  ANALYST = 'analyst',
  DEVELOPER = 'developer',
  SUPPORT = 'support',
  BILLING_ADMIN = 'billing_admin',
  SECURITY_ADMIN = 'security_admin',
}
