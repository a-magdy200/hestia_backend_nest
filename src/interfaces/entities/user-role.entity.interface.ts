/**
 * User Role entity interface
 * Represents a user-role mapping in the system
 */
import { IBaseEntity } from './base-entity.interface';

export interface IUserRoleEntity extends IBaseEntity {
  /** User ID */
  userId: string;
  /** Role ID */
  roleId: string;
  /** Tenant ID for multi-tenancy */
  tenantId: string;
  /** Additional mapping metadata */
  metadata?: Record<string, unknown>;
}
