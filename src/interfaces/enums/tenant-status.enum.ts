/**
 * Tenant status enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains tenant status-related enums
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
