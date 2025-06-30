/**
 * Tenant-related enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all tenant-related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * Tenant status options
 * @description Defines the possible states of a tenant
 */
export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_ACTIVATION = 'pending_activation',
  TRIAL = 'trial',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  DELETED = 'deleted',
}

/**
 * Tenant plan types
 * @description Defines the available subscription plans for tenants
 */
export enum TenantPlanType {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
  TRIAL = 'trial',
  BETA = 'beta',
}

/**
 * Tenant billing cycles
 * @description Defines the billing cycle options for tenants
 */
export enum TenantBillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  BIENNIALLY = 'biennially',
  CUSTOM = 'custom',
}

/**
 * Tenant payment methods
 * @description Defines the accepted payment methods
 */
export enum TenantPaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  INVOICE = 'invoice',
  CHECK = 'check',
  WIRE_TRANSFER = 'wire_transfer',
}

/**
 * Tenant industry types
 * @description Defines the industry classifications for tenants
 */
export enum TenantIndustry {
  RESTAURANT = 'restaurant',
  CATERING = 'catering',
  FOOD_SERVICE = 'food_service',
  HOSPITALITY = 'hospitality',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  RETAIL = 'retail',
  MANUFACTURING = 'manufacturing',
  TECHNOLOGY = 'technology',
  FINANCE = 'finance',
  CONSULTING = 'consulting',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government',
  MEDIA = 'media',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  FITNESS = 'fitness',
  WELLNESS = 'wellness',
  NUTRITION = 'nutrition',
  DIETETICS = 'dietetics',
  CULINARY_SCHOOL = 'culinary_school',
  FOOD_BLOG = 'food_blog',
  FOOD_MEDIA = 'food_media',
  FOOD_DELIVERY = 'food_delivery',
  MEAL_PREP = 'meal_prep',
  PERSONAL_CHEF = 'personal_chef',
  FOOD_TRUCK = 'food_truck',
  POPUP_RESTAURANT = 'popup_restaurant',
  GHOST_KITCHEN = 'ghost_kitchen',
  OTHER = 'other',
}

/**
 * Tenant size categories
 * @description Defines the size categories for tenants
 */
export enum TenantSize {
  MICRO = 'micro', // 1-10 employees
  SMALL = 'small', // 11-50 employees
  MEDIUM = 'medium', // 51-250 employees
  LARGE = 'large', // 251-1000 employees
  ENTERPRISE = 'enterprise', // 1000+ employees
}

/**
 * Tenant region types
 * @description Defines the geographic regions for tenants
 */
export enum TenantRegion {
  NORTH_AMERICA = 'north_america',
  SOUTH_AMERICA = 'south_america',
  EUROPE = 'europe',
  ASIA = 'asia',
  AFRICA = 'africa',
  AUSTRALIA = 'australia',
  OCEANIA = 'oceania',
  MIDDLE_EAST = 'middle_east',
  CARIBBEAN = 'caribbean',
  CENTRAL_AMERICA = 'central_america',
  GLOBAL = 'global',
}

/**
 * Tenant timezone options
 * @description Defines the available timezone options for tenants
 */
export enum TenantTimezone {
  UTC = 'UTC',
  EST = 'America/New_York',
  CST = 'America/Chicago',
  MST = 'America/Denver',
  PST = 'America/Los_Angeles',
  GMT = 'Europe/London',
  CET = 'Europe/Paris',
  EET = 'Europe/Athens',
  JST = 'Asia/Tokyo',
  CST_CHINA = 'Asia/Shanghai',
  IST = 'Asia/Kolkata',
  AEDT = 'Australia/Sydney',
  NZDT = 'Pacific/Auckland',
}

/**
 * Tenant feature flags
 * @description Defines the feature flags available for tenants
 */
export enum TenantFeatureFlag {
  ADVANCED_ANALYTICS = 'advanced_analytics',
  CUSTOM_BRANDING = 'custom_branding',
  API_ACCESS = 'api_access',
  WHITE_LABEL = 'white_label',
  MULTI_LANGUAGE = 'multi_language',
  ADVANCED_PERMISSIONS = 'advanced_permissions',
  AUDIT_LOGS = 'audit_logs',
  SSO_INTEGRATION = 'sso_integration',
  CUSTOM_INTEGRATIONS = 'custom_integrations',
  PRIORITY_SUPPORT = 'priority_support',
  DEDICATED_ACCOUNT_MANAGER = 'dedicated_account_manager',
  CUSTOM_TRAINING = 'custom_training',
  ON_PREMISE_DEPLOYMENT = 'on_premise_deployment',
  DATA_EXPORT = 'data_export',
  BACKUP_RESTORE = 'backup_restore',
  DISASTER_RECOVERY = 'disaster_recovery',
  HIGH_AVAILABILITY = 'high_availability',
  LOAD_BALANCING = 'load_balancing',
  AUTO_SCALING = 'auto_scaling',
  CDN_INTEGRATION = 'cdn_integration',
  CUSTOM_DOMAIN = 'custom_domain',
  SSL_CERTIFICATE = 'ssl_certificate',
  FIREWALL_PROTECTION = 'firewall_protection',
  DDoS_PROTECTION = 'ddos_protection',
  VULNERABILITY_SCANNING = 'vulnerability_scanning',
  PENETRATION_TESTING = 'penetration_testing',
  COMPLIANCE_REPORTING = 'compliance_reporting',
  GDPR_COMPLIANCE = 'gdpr_compliance',
  HIPAA_COMPLIANCE = 'hipaa_compliance',
  SOC2_COMPLIANCE = 'soc2_compliance',
  ISO27001_COMPLIANCE = 'iso27001_compliance',
  PCI_DSS_COMPLIANCE = 'pci_dss_compliance',
}

/**
 * Tenant notification preferences
 * @description Defines the notification preference levels for tenants
 */
export enum TenantNotificationPreference {
  ALL = 'all',
  IMPORTANT_ONLY = 'important_only',
  NONE = 'none',
  EMAIL_ONLY = 'email_only',
  SMS_ONLY = 'sms_only',
  PUSH_ONLY = 'push_only',
  WEBHOOK_ONLY = 'webhook_only',
}

/**
 * Tenant data retention policies
 * @description Defines the data retention policy options for tenants
 */
export enum TenantDataRetentionPolicy {
  STANDARD = 'standard', // 7 years
  EXTENDED = 'extended', // 10 years
  PERMANENT = 'permanent',
  CUSTOM = 'custom',
  MINIMAL = 'minimal', // 1 year
  SHORT_TERM = 'short_term', // 3 years
  MEDIUM_TERM = 'medium_term', // 5 years
  LONG_TERM = 'long_term', // 15 years
}

/**
 * Tenant backup frequency options
 * @description Defines the backup frequency options for tenants
 */
export enum TenantBackupFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ON_DEMAND = 'on_demand',
  CONTINUOUS = 'continuous',
  REAL_TIME = 'real_time',
}

/**
 * Tenant support levels
 * @description Defines the support level options for tenants
 */
export enum TenantSupportLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
  DEDICATED = 'dedicated',
  WHITE_GLOVE = 'white_glove',
}
