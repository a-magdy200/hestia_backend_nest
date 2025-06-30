/**
 * Audit-related enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all audit-related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * Audit action types
 * @description Defines the types of actions that can be audited
 */
export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  PHONE_VERIFICATION = 'phone_verification',
  MFA_ENABLE = 'mfa_enable',
  MFA_DISABLE = 'mfa_disable',
  MFA_VERIFY = 'mfa_verify',
  ROLE_ASSIGN = 'role_assign',
  ROLE_REVOKE = 'role_revoke',
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
  ACCOUNT_LOCK = 'account_lock',
  ACCOUNT_UNLOCK = 'account_unlock',
  ACCOUNT_SUSPEND = 'account_suspend',
  ACCOUNT_ACTIVATE = 'account_activate',
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  FILE_DELETE = 'file_delete',
  EXPORT_DATA = 'export_data',
  IMPORT_DATA = 'import_data',
  BACKUP_CREATE = 'backup_create',
  BACKUP_RESTORE = 'backup_restore',
  CONFIGURATION_CHANGE = 'configuration_change',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SECURITY_ALERT = 'security_alert',
  COMPLIANCE_CHECK = 'compliance_check',
  API_KEY_CREATE = 'api_key_create',
  API_KEY_REVOKE = 'api_key_revoke',
  API_KEY_UPDATE = 'api_key_update',
  BILLING_CHANGE = 'billing_change',
  SUBSCRIPTION_CHANGE = 'subscription_change',
  PAYMENT_PROCESS = 'payment_process',
  REFUND_PROCESS = 'refund_process',
  NOTIFICATION_SEND = 'notification_send',
  NOTIFICATION_READ = 'notification_read',
  NOTIFICATION_DELETE = 'notification_delete',
  SEARCH_PERFORM = 'search_perform',
  ANALYTICS_VIEW = 'analytics_view',
  REPORT_GENERATE = 'report_generate',
  REPORT_EXPORT = 'report_export',
  TENANT_CREATE = 'tenant_create',
  TENANT_UPDATE = 'tenant_update',
  TENANT_DELETE = 'tenant_delete',
  TENANT_SUSPEND = 'tenant_suspend',
  TENANT_ACTIVATE = 'tenant_activate',
}

/**
 * Audit resource types
 * @description Defines the types of resources that can be audited
 */
export enum AuditResourceType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  RECIPE = 'recipe',
  INGREDIENT = 'ingredient',
  INGREDIENT_CATEGORY = 'ingredient_category',
  SHOPPING_LIST = 'shopping_list',
  SHOPPING_LIST_ITEM = 'shopping_list_item',
  TENANT = 'tenant',
  TENANT_USER = 'tenant_user',
  TENANT_SETTING = 'tenant_setting',
  TENANT_BRANDING = 'tenant_branding',
  USER_PROFILE = 'user_profile',
  USER_PREFERENCE = 'user_preference',
  NOTIFICATION = 'notification',
  AUDIT_LOG = 'audit_log',
  API_KEY = 'api_key',
  FILE = 'file',
  CONFIGURATION = 'configuration',
  SYSTEM = 'system',
  SESSION = 'session',
  TOKEN = 'token',
  BILLING = 'billing',
  SUBSCRIPTION = 'subscription',
  PAYMENT = 'payment',
  REPORT = 'report',
  ANALYTICS = 'analytics',
  SEARCH = 'search',
  BACKUP = 'backup',
  MAINTENANCE = 'maintenance',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
}

/**
 * Audit severity levels
 * @description Defines the severity levels for audit events
 */
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

/**
 * Audit status
 * @description Defines the status of audit events
 */
export enum AuditStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  FAILED = 'failed',
  IGNORED = 'ignored',
  ESCALATED = 'escalated',
}

/**
 * Audit source types
 * @description Defines the source of audit events
 */
export enum AuditSource {
  WEB_UI = 'web_ui',
  MOBILE_APP = 'mobile_app',
  API = 'api',
  CLI = 'cli',
  SYSTEM = 'system',
  SCHEDULER = 'scheduler',
  WEBHOOK = 'webhook',
  INTEGRATION = 'integration',
  BATCH_PROCESS = 'batch_process',
  MANUAL = 'manual',
}

/**
 * Audit outcome types
 * @description Defines the outcome of audit events
 */
export enum AuditOutcome {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
  SKIPPED = 'skipped',
}

/**
 * Audit retention periods
 * @description Defines the retention periods for audit logs
 */
export enum AuditRetentionPeriod {
  ONE_MONTH = 30,
  THREE_MONTHS = 90,
  SIX_MONTHS = 180,
  ONE_YEAR = 365,
  TWO_YEARS = 730,
  FIVE_YEARS = 1825,
  SEVEN_YEARS = 2555,
  TEN_YEARS = 3650,
  PERMANENT = -1,
}

/**
 * Audit compliance standards
 * @description Defines the compliance standards for audit logs
 */
export enum AuditComplianceStandard {
  GDPR = 'gdpr',
  HIPAA = 'hipaa',
  SOX = 'sox',
  PCI_DSS = 'pci_dss',
  ISO_27001 = 'iso_27001',
  SOC_2 = 'soc_2',
  FERPA = 'ferpa',
  GLBA = 'glba',
  CCPA = 'ccpa',
  PIPEDA = 'pipeda',
}
