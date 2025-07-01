/**
 * User-related enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all user-related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * User gender options
 * @description Defines the available gender options for user profiles
 */
export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

/**
 * User account status options
 * @description Defines the possible states of a user account
 */
export enum UserAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DELETED = 'deleted',
}

/**
 * User role enumeration
 * Defines the different roles a user can have in the system
 */
export enum UserRole {
  /** Super administrator with full system access */
  SUPER_ADMIN = 'super_admin',
  /** Administrator with tenant-level access */
  ADMIN = 'admin',
  /** Regular user with standard access */
  USER = 'user',
  /** Moderator with content management access */
  MODERATOR = 'moderator',
  /** Guest user with limited access */
  GUEST = 'guest',
  BETA_TESTER = 'beta_tester',
  PREMIUM_USER = 'premium_user',
}

/**
 * System permissions enumeration
 * Defines all available permissions in the system for RBAC
 */
export enum Permission {
  // User management permissions
  READ_USERS = 'read_users',
  CREATE_USERS = 'create_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',
  MANAGE_USER_ROLES = 'manage_user_roles',
  SUSPEND_USERS = 'suspend_users',
  UNLOCK_USERS = 'unlock_users',

  // Profile management permissions
  READ_PROFILES = 'read_profiles',
  UPDATE_PROFILES = 'update_profiles',
  DELETE_PROFILES = 'delete_profiles',
  READ_OWN_PROFILE = 'read_own_profile',
  UPDATE_OWN_PROFILE = 'update_own_profile',

  // Recipe management permissions
  READ_RECIPES = 'read_recipes',
  CREATE_RECIPES = 'create_recipes',
  UPDATE_RECIPES = 'update_recipes',
  DELETE_RECIPES = 'delete_recipes',
  PUBLISH_RECIPES = 'publish_recipes',
  APPROVE_RECIPES = 'approve_recipes',
  READ_OWN_RECIPES = 'read_own_recipes',
  CREATE_OWN_RECIPES = 'create_own_recipes',
  UPDATE_OWN_RECIPES = 'update_own_recipes',
  DELETE_OWN_RECIPES = 'delete_own_recipes',

  // Ingredient management permissions
  READ_INGREDIENTS = 'read_ingredients',
  CREATE_INGREDIENTS = 'create_ingredients',
  UPDATE_INGREDIENTS = 'update_ingredients',
  DELETE_INGREDIENTS = 'delete_ingredients',
  APPROVE_INGREDIENTS = 'approve_ingredients',

  // Shopping list permissions
  READ_SHOPPING_LISTS = 'read_shopping_lists',
  CREATE_SHOPPING_LISTS = 'create_shopping_lists',
  UPDATE_SHOPPING_LISTS = 'update_shopping_lists',
  DELETE_SHOPPING_LISTS = 'delete_shopping_lists',
  READ_OWN_SHOPPING_LISTS = 'read_own_shopping_lists',
  CREATE_OWN_SHOPPING_LISTS = 'create_own_shopping_lists',
  UPDATE_OWN_SHOPPING_LISTS = 'update_own_shopping_lists',
  DELETE_OWN_SHOPPING_LISTS = 'delete_own_shopping_lists',

  // System administration permissions
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_TENANTS = 'manage_tenants',
  MANAGE_BILLING = 'manage_billing',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_API_KEYS = 'manage_api_keys',

  // Content moderation permissions
  MODERATE_CONTENT = 'moderate_content',
  APPROVE_CONTENT = 'approve_content',
  REJECT_CONTENT = 'reject_content',
  FLAG_CONTENT = 'flag_content',

  // Notification permissions
  SEND_NOTIFICATIONS = 'send_notifications',
  MANAGE_NOTIFICATIONS = 'manage_notifications',
  READ_NOTIFICATIONS = 'read_notifications',

  // Search and discovery permissions
  SEARCH_CONTENT = 'search_content',
  ADVANCED_SEARCH = 'advanced_search',
  EXPORT_DATA = 'export_data',
}

/**
 * User status enumeration
 * Defines the different states a user account can be in
 */
export enum UserStatus {
  /** User account is active and can access the system */
  ACTIVE = 'active',
  /** User account is inactive and cannot access the system */
  INACTIVE = 'inactive',
  /** User account is suspended temporarily */
  SUSPENDED = 'suspended',
  /** User account is pending email verification */
  PENDING_VERIFICATION = 'pending_verification',
  /** User account is locked due to security reasons */
  LOCKED = 'locked',
}

/**
 * User verification status enumeration
 * Defines the verification states for user accounts
 */
export enum UserVerificationStatus {
  /** User has not verified their email */
  UNVERIFIED = 'unverified',
  /** User has verified their email */
  VERIFIED = 'verified',
  /** User verification is pending */
  PENDING = 'pending',
  /** User verification has failed */
  FAILED = 'failed',
}

/**
 * User MFA methods
 * @description Defines the available multi-factor authentication methods
 */
export enum UserMFAMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  AUTHENTICATOR_APP = 'authenticator_app',
  HARDWARE_KEY = 'hardware_key',
}

/**
 * User login status
 * @description Defines the possible login attempt outcomes
 */
export enum UserLoginStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  LOCKED = 'locked',
  MFA_REQUIRED = 'mfa_required',
  PASSWORD_EXPIRED = 'password_expired',
  ACCOUNT_SUSPENDED = 'account_suspended',
}

/**
 * User profile visibility enumeration
 * Defines the visibility levels for user profiles
 */
export enum UserProfileVisibility {
  /** Profile is visible to everyone */
  PUBLIC = 'public',
  /** Profile is visible to authenticated users only */
  AUTHENTICATED = 'authenticated',
  /** Profile is visible to friends/connections only */
  FRIENDS = 'friends',
  /** Profile is private and not visible */
  PRIVATE = 'private',
}

/**
 * User notification preferences
 * @description Defines the notification preference levels
 */
export enum UserNotificationPreference {
  ALL = 'all',
  IMPORTANT_ONLY = 'important_only',
  NONE = 'none',
  EMAIL_ONLY = 'email_only',
  SMS_ONLY = 'sms_only',
  PUSH_ONLY = 'push_only',
}

/**
 * User activity status
 * @description Defines the current activity status of a user
 */
export enum UserActivityStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  DO_NOT_DISTURB = 'do_not_disturb',
  INVISIBLE = 'invisible',
}

/**
 * User session status
 * @description Defines the status of user sessions
 */
export enum UserSessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPICIOUS = 'suspicious',
}

/**
 * User password strength levels
 * @description Defines the strength levels for user passwords
 */
export enum UserPasswordStrength {
  WEAK = 'weak',
  MEDIUM = 'medium',
  STRONG = 'strong',
  VERY_STRONG = 'very_strong',
}

/**
 * User account type
 * @description Defines the type of user account
 */
export enum UserAccountType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
  TRIAL = 'trial',
  FREEMIUM = 'freemium',
}
