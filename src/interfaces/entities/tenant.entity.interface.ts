/**
 * Tenant entity interface
 * Represents a tenant in the system
 */
import { IBaseEntity } from './base-entity.interface';

export interface ITenantEntity extends IBaseEntity {
  /** Tenant name */
  name: string;
  /** Tenant description */
  description?: string;
  /** Tenant owner user ID */
  ownerId: string;
  /** Tenant status */
  status: string;
  /** Additional tenant metadata */
  metadata?: Record<string, unknown>;
}
