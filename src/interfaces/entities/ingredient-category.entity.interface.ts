/**
 * Ingredient Category entity interface
 * Represents an ingredient category in the system
 */
import {
  IngredientCategoryType,
  IngredientCategoryStatus,
  IngredientCategoryScope,
  IngredientCategoryLevel,
} from '../enums/ingredient-category.enum';

import { IBaseEntity } from './base-entity.interface';

export interface IIngredientCategoryEntity extends IBaseEntity {
  /** Category name */
  name: string;
  /** Category type */
  type: IngredientCategoryType;
  /** Category status */
  status: IngredientCategoryStatus;
  /** Category scope */
  scope: IngredientCategoryScope;
  /** Category hierarchy level */
  level: IngredientCategoryLevel;
  /** Parent category ID */
  parentId?: string;
  /** Additional category metadata */
  metadata?: Record<string, unknown>;
}
