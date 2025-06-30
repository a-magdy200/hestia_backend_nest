/**
 * Tenant payment enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains tenant payment-related enums
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

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
