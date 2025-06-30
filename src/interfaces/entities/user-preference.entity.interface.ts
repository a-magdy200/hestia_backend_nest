/**
 * User Preference entity interface
 * Represents a user preference in the system
 */
import { IBaseEntity } from './base-entity.interface';

export interface IUserPreferenceEntity extends IBaseEntity {
  /** User ID */
  userId: string;
  /** Preference key */
  key: string;
  /** Preference value */
  value: string;
  /** Additional preference metadata */
  metadata?: Record<string, unknown>;
}
