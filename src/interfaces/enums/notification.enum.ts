/**
 * Notification-related enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all notification-related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * Notification types
 * @description Defines the types of notifications
 */
export enum NotificationType {
  SYSTEM = 'system',
  USER = 'user',
  RECIPE = 'recipe',
  INGREDIENT = 'ingredient',
  SHOPPING_LIST = 'shopping_list',
  TENANT = 'tenant',
  SECURITY = 'security',
  BILLING = 'billing',
  SUPPORT = 'support',
  MAINTENANCE = 'maintenance',
  UPDATE = 'update',
  REMINDER = 'reminder',
  ALERT = 'alert',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
}

/**
 * Notification priority levels
 * @description Defines the priority levels for notifications
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

/**
 * Notification status
 * @description Defines the status of notifications
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
}

/**
 * Notification channels
 * @description Defines the delivery channels for notifications
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
  SLACK = 'slack',
  TEAMS = 'teams',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  VOICE = 'voice',
  FAX = 'fax',
  MAIL = 'mail',
}

/**
 * Notification categories
 * @description Defines the categories for notifications
 */
export enum NotificationCategory {
  ACCOUNT = 'account',
  SECURITY = 'security',
  BILLING = 'billing',
  FEATURES = 'features',
  UPDATES = 'updates',
  MAINTENANCE = 'maintenance',
  SUPPORT = 'support',
  MARKETING = 'marketing',
  SOCIAL = 'social',
  REMINDERS = 'reminders',
  ALERTS = 'alerts',
  REPORTS = 'reports',
  ANALYTICS = 'analytics',
  INTEGRATIONS = 'integrations',
  API = 'api',
  WEBHOOKS = 'webhooks',
  BACKUPS = 'backups',
  COMPLIANCE = 'compliance',
  AUDIT = 'audit',
  PERFORMANCE = 'performance',
}

/**
 * Notification template types
 * @description Defines the template types for notifications
 */
export enum NotificationTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  FEATURE_UPDATE = 'feature_update',
  MAINTENANCE_SCHEDULED = 'maintenance_scheduled',
  MAINTENANCE_COMPLETED = 'maintenance_completed',
  SECURITY_ALERT = 'security_alert',
  BACKUP_COMPLETED = 'backup_completed',
  BACKUP_FAILED = 'backup_failed',
  INTEGRATION_ERROR = 'integration_error',
  API_LIMIT_REACHED = 'api_limit_reached',
  QUOTA_EXCEEDED = 'quota_exceeded',
  STORAGE_FULL = 'storage_full',
  PERFORMANCE_ALERT = 'performance_alert',
  COMPLIANCE_REMINDER = 'compliance_reminder',
  AUDIT_LOG = 'audit_log',
  USER_INVITATION = 'user_invitation',
  ROLE_CHANGE = 'role_change',
  PERMISSION_UPDATE = 'permission_update',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  RECIPE_SHARED = 'recipe_shared',
  INGREDIENT_ADDED = 'ingredient_added',
  SHOPPING_LIST_SHARED = 'shopping_list_shared',
  COLLABORATION_INVITE = 'collaboration_invite',
  COMMENT_ADDED = 'comment_added',
  RATING_RECEIVED = 'rating_received',
  FOLLOW_ADDED = 'follow_added',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  BADGE_EARNED = 'badge_earned',
  LEVEL_UP = 'level_up',
  CHALLENGE_COMPLETED = 'challenge_completed',
  CONTEST_WON = 'contest_won',
  GIVEAWAY_ENTRY = 'giveaway_entry',
  SURVEY_REQUEST = 'survey_request',
  FEEDBACK_REQUEST = 'feedback_request',
  BETA_INVITATION = 'beta_invitation',
  EARLY_ACCESS = 'early_access',
  CUSTOM = 'custom',
}
