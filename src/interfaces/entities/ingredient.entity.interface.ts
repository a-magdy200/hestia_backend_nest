/**
 * Ingredient entity interface
 * Represents an ingredient in the system
 */
import { IngredientApprovalStatus } from '../enums/ingredient-approval-status.enum';

import { IBaseEntity } from './base-entity.interface';

export interface IIngredientEntity extends IBaseEntity {
  /** Ingredient name */
  name: string;
  /** Ingredient description */
  description?: string;
  /** Ingredient category identifier */
  categoryId?: string;
  /** Scientific name of the ingredient */
  scientificName?: string;
  /** Array of common names and aliases */
  commonNames?: string[];
  /** Comprehensive nutritional information */
  nutritionalInfo?: Record<string, unknown>;
  /** Array of allergen identifiers */
  allergens?: string[];
  /** Array of dietary classifications */
  dietaryTypes?: string[];
  /** Seasonal availability information */
  seasonality?: Record<string, unknown>;
  /** Geographic origin of the ingredient */
  origin?: string;
  /** Storage and handling instructions */
  storageInstructions?: string;
  /** Shelf life information */
  shelfLife?: string;
  /** Array of substitution options */
  substitutions?: string[];
  /** Array of certifications */
  certifications?: string[];
  /** Sustainability rating (0.00-1.00) */
  sustainabilityScore?: number;
  /** Average cost per unit */
  costPerUnit?: number;
  /** Standard unit of measure */
  unitOfMeasure?: string;
  /** Indicates if this is a global ingredient */
  isGlobal: boolean;
  /** Indicates if this is a custom ingredient */
  isCustom: boolean;
  /** User who created this ingredient (for custom ingredients) */
  createdBy?: string;
  /** Approval status for custom ingredients */
  isApproved: boolean;
  /** Approval status for custom ingredients */
  approvalStatus: IngredientApprovalStatus;
  /** Number of times this ingredient is used in recipes */
  usageCount: number;
  /** Popularity score based on usage and ratings */
  popularityScore: number;
  /** Additional ingredient metadata */
  metadata?: Record<string, unknown>;
}
