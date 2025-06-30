/**
 * Role entity interface
 * Represents a role in the system
 */
import { RolePriority } from '../enums/role.enum';

import { IBaseEntity } from './base-entity.interface';

export interface IRoleEntity extends IBaseEntity {
  /** Role name (unique) */
  name: string;
  /** Human-readable role display name */
  displayName: string;
  /** Role description */
  description?: string;
  /** Parent role for hierarchy inheritance */
  parentRoleId?: string;
  /** Array of permission strings */
  permissions: string[];
  /** Indicates if this is a system-defined role */
  isSystemRole: boolean;
  /** Role active status */
  isActive: boolean;
  /** Role priority for conflict resolution */
  priority: RolePriority;
  /** Additional role metadata */
  metadata?: Record<string, unknown>;
}
