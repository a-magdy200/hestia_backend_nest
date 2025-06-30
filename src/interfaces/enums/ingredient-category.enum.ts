/**
 * Ingredient Category enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all ingredient category-related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * Ingredient category types
 * @description Defines the main categories for ingredients
 */
export enum IngredientCategoryType {
  VEGETABLES = 'vegetables',
  FRUITS = 'fruits',
  MEAT = 'meat',
  FISH = 'fish',
  DAIRY = 'dairy',
  GRAINS = 'grains',
  LEGUMES = 'legumes',
  NUTS = 'nuts',
  SEEDS = 'seeds',
  HERBS = 'herbs',
  SPICES = 'spices',
  CONDIMENTS = 'condiments',
  OILS = 'oils',
  SWEETENERS = 'sweeteners',
  BEVERAGES = 'beverages',
  ALCOHOL = 'alcohol',
  SUPPLEMENTS = 'supplements',
  PROCESSED = 'processed',
  FROZEN = 'frozen',
  CANNED = 'canned',
  DRIED = 'dried',
  FRESH = 'fresh',
  ORGANIC = 'organic',
  CONVENTIONAL = 'conventional',
}

/**
 * Ingredient category status
 * @description Defines the status of ingredient categories
 */
export enum IngredientCategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
  ARCHIVED = 'archived',
}

/**
 * Ingredient category scope
 * @description Defines the scope of ingredient categories
 */
export enum IngredientCategoryScope {
  GLOBAL = 'global',
  REGIONAL = 'regional',
  LOCAL = 'local',
  CUSTOM = 'custom',
}

/**
 * Ingredient category hierarchy levels
 * @description Defines the hierarchy levels for ingredient categories
 */
export enum IngredientCategoryLevel {
  ROOT = 0,
  PRIMARY = 1,
  SECONDARY = 2,
  TERTIARY = 3,
  QUATERNARY = 4,
}

/**
 * Ingredient category display types
 * @description Defines how ingredient categories should be displayed
 */
export enum IngredientCategoryDisplayType {
  LIST = 'list',
  GRID = 'grid',
  TREE = 'tree',
  HIERARCHY = 'hierarchy',
  TAGS = 'tags',
}

/**
 * Ingredient category sort orders
 * @description Defines the sort order options for ingredient categories
 */
export enum IngredientCategorySortOrder {
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  CREATED_ASC = 'created_asc',
  CREATED_DESC = 'created_desc',
  UPDATED_ASC = 'updated_asc',
  UPDATED_DESC = 'updated_desc',
  POPULARITY_ASC = 'popularity_asc',
  POPULARITY_DESC = 'popularity_desc',
  USAGE_COUNT_ASC = 'usage_count_asc',
  USAGE_COUNT_DESC = 'usage_count_desc',
}
