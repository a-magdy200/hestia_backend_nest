/**
 * Recipe entity interface
 * Represents a recipe in the system
 */
import { RecipeStatus } from '../enums/recipe-status.enum';

import { IBaseEntity } from './base-entity.interface';

export interface IRecipeEntity extends IBaseEntity {
  /** Recipe title */
  title: string;
  /** Recipe description */
  description?: string;
  /** Step-by-step instructions as JSON array */
  instructions: Record<string, unknown>[];
  /** Nutritional information as JSON object */
  nutritionalInfo?: Record<string, unknown>;
  /** Additional recipe metadata */
  metadata?: Record<string, unknown>;
  /** Recipe workflow status */
  status: RecipeStatus;
  /** Recipe version number */
  version: number;
  /** User who created the recipe */
  createdBy: string;
  /** User who last updated the recipe */
  updatedBy?: string;
}
