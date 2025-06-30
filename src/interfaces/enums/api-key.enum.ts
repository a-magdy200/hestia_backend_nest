/**
 * API Key enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all API key-related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * API key types
 * @description Defines the different types of API keys
 */
export enum ApiKeyType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  SECRET = 'secret',
  READ_ONLY = 'read_only',
  WRITE_ONLY = 'write_only',
  ADMIN = 'admin',
  SYSTEM = 'system',
  INTEGRATION = 'integration',
  WEBHOOK = 'webhook',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  BATCH = 'batch',
  SCHEDULED = 'scheduled',
}

/**
 * API key status
 * @description Defines the status of API keys
 */
export enum ApiKeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING_ACTIVATION = 'pending_activation',
  PENDING_APPROVAL = 'pending_approval',
}

/**
 * API key permissions
 * @description Defines the permissions that can be assigned to API keys
 */
export enum ApiKeyPermission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
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
  BILLING = 'billing',
  SETTINGS = 'settings',
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  BACKUP = 'backup',
  RESTORE = 'restore',
  MAINTENANCE = 'maintenance',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
}

/**
 * API key scopes
 * @description Defines the scopes for API keys
 */
export enum ApiKeyScope {
  GLOBAL = 'global',
  TENANT = 'tenant',
  ORGANIZATION = 'organization',
  TEAM = 'team',
  PROJECT = 'project',
  USER = 'user',
  RESOURCE = 'resource',
  METHOD = 'method',
  ENDPOINT = 'endpoint',
}

/**
 * API key environments
 * @description Defines the environments where API keys can be used
 */
export enum ApiKeyEnvironment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
  SANDBOX = 'sandbox',
  DEMO = 'demo',
}

/**
 * API key usage types
 * @description Defines the types of usage for API keys
 */
export enum ApiKeyUsageType {
  UNLIMITED = 'unlimited',
  LIMITED = 'limited',
  RATE_LIMITED = 'rate_limited',
  QUOTA_BASED = 'quota_based',
  TIME_BASED = 'time_based',
  SESSION_BASED = 'session_based',
}

/**
 * API key security levels
 * @description Defines the security levels for API keys
 */
export enum ApiKeySecurityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  MAXIMUM = 'maximum',
}

/**
 * API key rotation policies
 * @description Defines the rotation policies for API keys
 */
export enum ApiKeyRotationPolicy {
  NEVER = 'never',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  ON_DEMAND = 'on_demand',
  SCHEDULED = 'scheduled',
  EVENT_BASED = 'event_based',
}

/**
 * API key validation types
 * @description Defines the validation types for API keys
 */
export enum ApiKeyValidationType {
  NONE = 'none',
  BASIC = 'basic',
  ENHANCED = 'enhanced',
  STRICT = 'strict',
  CUSTOM = 'custom',
}
