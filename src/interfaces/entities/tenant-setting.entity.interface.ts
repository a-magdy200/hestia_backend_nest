/**
 * Tenant Setting entity interface
 * Represents a tenant setting in the system
 */
import { IBaseEntity } from './base-entity.interface';

export interface ITenantSettingEntity extends IBaseEntity {
  /** Tenant ID */
  tenantId: string;
  /** Setting key */
  key: string;
  /** Setting value */
  value: string;
  /** Additional setting metadata */
  metadata?: Record<string, unknown>;
}
