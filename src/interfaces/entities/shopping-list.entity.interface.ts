/**
 * Shopping List entity interface
 * Represents a shopping list in the system
 */
import { IBaseEntity } from './base-entity.interface';

export interface IShoppingListEntity extends IBaseEntity {
  /** Shopping list name */
  name: string;
  /** Shopping list description */
  description?: string;
  /** User who created the shopping list */
  createdBy: string;
  /** Tenant ID for multi-tenancy */
  tenantId: string;
  /** List of item IDs in the shopping list */
  itemIds: string[];
  /** Additional shopping list metadata */
  metadata?: Record<string, unknown>;
}
