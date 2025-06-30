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
 * User role types
 * @description Defines the available user roles in the system
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  GUEST = 'guest',
  BETA_TESTER = 'beta_tester',
  PREMIUM_USER = 'premium_user',
}

/**
 * User verification status
 * @description Defines the verification status for different user attributes
 */
export enum UserVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  EXPIRED = 'expired',
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
 * User profile visibility
 * @description Defines the visibility levels for user profile information
 */
export enum UserProfileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS_ONLY = 'friends_only',
  TENANT_ONLY = 'tenant_only',
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
