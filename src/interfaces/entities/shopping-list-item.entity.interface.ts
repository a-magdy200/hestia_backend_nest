/**
 * Shopping List Item entity interface
 * Represents an item in a shopping list
 */
import { IBaseEntity } from './base-entity.interface';

export interface IShoppingListItemEntity extends IBaseEntity {
  /** Shopping list ID */
  shoppingListId: string;
  /** Item name */
  name: string;
  /** Quantity of the item */
  quantity: number;
  /** Unit of measure */
  unit: string;
  /** Checked status */
  isChecked: boolean;
  /** Additional item metadata */
  metadata?: Record<string, unknown>;
}
