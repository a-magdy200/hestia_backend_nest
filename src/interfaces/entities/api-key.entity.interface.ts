/**
 * API Key entity interface
 * Represents an API key in the system
 */
import { ApiKeyType, ApiKeyStatus } from '../enums/api-key.enum';

import { IBaseEntity } from './base-entity.interface';

export interface IApiKeyEntity extends IBaseEntity {
  /** API key value (hashed) */
  key: string;
  /** API key type */
  type: ApiKeyType;
  /** API key status */
  status: ApiKeyStatus;
  /** User or system that owns the key */
  ownerId: string;
  /** Expiry date for the API key */
  expiresAt?: Date;
  /** List of permissions assigned to the key */
  permissions: string[];
  /** Additional API key metadata */
  metadata?: Record<string, unknown>;
}
