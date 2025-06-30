/**
 * Tenant User entity interface
 * Represents a user-tenant mapping in the system
 */
import { IBaseEntity } from './base-entity.interface';

export interface ITenantUserEntity extends IBaseEntity {
  /** User ID */
  userId: string;
  /** Tenant ID */
  tenantId: string;
  /** Role ID */
  roleId: string;
  /** Additional mapping metadata */
  metadata?: Record<string, unknown>;
}
