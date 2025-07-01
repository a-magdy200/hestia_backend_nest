/**
 * Permission enumeration
 * Defines granular permissions for role-based access control
 */
export enum Permission {
  // User Management Permissions
  /** Create new users */
  CREATE_USER = 'create_user',
  /** Read user information */
  READ_USER = 'read_user',
  /** Update user information */
  UPDATE_USER = 'update_user',
  /** Delete users */
  DELETE_USER = 'delete_user',
  /** List all users */
  LIST_USERS = 'list_users',
  /** Manage user roles */
  MANAGE_USER_ROLES = 'manage_user_roles',
  /** Suspend/activate users */
  MANAGE_USER_STATUS = 'manage_user_status',

  // Profile Management Permissions
  /** Create user profiles */
  CREATE_PROFILE = 'create_profile',
  /** Read user profiles */
  READ_PROFILE = 'read_profile',
  /** Update user profiles */
  UPDATE_PROFILE = 'update_profile',
  /** Delete user profiles */
  DELETE_PROFILE = 'delete_profile',
  /** View all profiles */
  VIEW_ALL_PROFILES = 'view_all_profiles',

  // Authentication Permissions
  /** Authenticate users */
  AUTHENTICATE = 'authenticate',
  /** Refresh tokens */
  REFRESH_TOKEN = 'refresh_token',
  /** Revoke tokens */
  REVOKE_TOKEN = 'revoke_token',
  /** Reset passwords */
  RESET_PASSWORD = 'reset_password',
  /** Change passwords */
  CHANGE_PASSWORD = 'change_password',

  // Admin Permissions
  /** Access admin panel */
  ACCESS_ADMIN_PANEL = 'access_admin_panel',
  /** Manage system settings */
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  /** View system logs */
  VIEW_SYSTEM_LOGS = 'view_system_logs',
  /** Manage tenants */
  MANAGE_TENANTS = 'manage_tenants',
  /** Access analytics */
  ACCESS_ANALYTICS = 'access_analytics',

  // Content Management Permissions
  /** Create content */
  CREATE_CONTENT = 'create_content',
  /** Read content */
  READ_CONTENT = 'read_content',
  /** Update content */
  UPDATE_CONTENT = 'update_content',
  /** Delete content */
  DELETE_CONTENT = 'delete_content',
  /** Moderate content */
  MODERATE_CONTENT = 'moderate_content',
  /** Publish content */
  PUBLISH_CONTENT = 'publish_content',

  // Recipe Management Permissions
  /** Create recipes */
  CREATE_RECIPE = 'create_recipe',
  /** Read recipes */
  READ_RECIPE = 'read_recipe',
  /** Update recipes */
  UPDATE_RECIPE = 'update_recipe',
  /** Delete recipes */
  DELETE_RECIPE = 'delete_recipe',
  /** Approve recipes */
  APPROVE_RECIPE = 'approve_recipe',
  /** Feature recipes */
  FEATURE_RECIPE = 'feature_recipe',

  // Ingredient Management Permissions
  /** Create ingredients */
  CREATE_INGREDIENT = 'create_ingredient',
  /** Read ingredients */
  READ_INGREDIENT = 'read_ingredient',
  /** Update ingredients */
  UPDATE_INGREDIENT = 'update_ingredient',
  /** Delete ingredients */
  DELETE_INGREDIENT = 'delete_ingredient',
  /** Approve ingredients */
  APPROVE_INGREDIENT = 'approve_ingredient',

  // Shopping List Permissions
  /** Create shopping lists */
  CREATE_SHOPPING_LIST = 'create_shopping_list',
  /** Read shopping lists */
  READ_SHOPPING_LIST = 'read_shopping_list',
  /** Update shopping lists */
  UPDATE_SHOPPING_LIST = 'update_shopping_list',
  /** Delete shopping lists */
  DELETE_SHOPPING_LIST = 'delete_shopping_list',
  /** Share shopping lists */
  SHARE_SHOPPING_LIST = 'share_shopping_list',
}
