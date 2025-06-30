/**
 * Ingredient-related enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all ingredient-related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * Ingredient approval status
 * @description Defines the approval status for ingredients
 */
export enum IngredientApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
  NEEDS_REVISION = 'needs_revision',
}

/**
 * Ingredient allergen types
 * @description Defines the common allergen types
 */
export enum IngredientAllergen {
  MILK = 'milk',
  EGGS = 'eggs',
  FISH = 'fish',
  SHELLFISH = 'shellfish',
  TREE_NUTS = 'tree_nuts',
  PEANUTS = 'peanuts',
  WHEAT = 'wheat',
  SOYBEANS = 'soybeans',
  SESAME = 'sesame',
  SULFITES = 'sulfites',
  CELERY = 'celery',
  MUSTARD = 'mustard',
  LUPIN = 'lupin',
  MOLLUSCS = 'molluscs',
  GLUTEN = 'gluten',
  LACTOSE = 'lactose',
  HISTAMINE = 'histamine',
  NICKEL = 'nickel',
  SALICYLATES = 'salicylates',
  AMINES = 'amines',
  GLUTAMATE = 'glutamate',
  BENZOATES = 'benzoates',
  SORBATES = 'sorbates',
  NITRATES = 'nitrates',
  NITRITES = 'nitrites',
}

/**
 * Ingredient dietary types
 * @description Defines the dietary classifications for ingredients
 */
export enum IngredientDietaryType {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  NUT_FREE = 'nut_free',
  EGG_FREE = 'egg_free',
  SOY_FREE = 'soy_free',
  KETO = 'keto',
  PALEO = 'paleo',
  LOW_CARB = 'low_carb',
  LOW_FAT = 'low_fat',
  LOW_SODIUM = 'low_sodium',
  SUGAR_FREE = 'sugar_free',
  HALAL = 'halal',
  KOSHER = 'kosher',
  PESCATARIAN = 'pescatarian',
  FLEXITARIAN = 'flexitarian',
  ORGANIC = 'organic',
  NON_GMO = 'non_gmo',
  FAIR_TRADE = 'fair_trade',
  SUSTAINABLE = 'sustainable',
  LOCAL = 'local',
  SEASONAL = 'seasonal',
  WILD_CAUGHT = 'wild_caught',
  FARM_RAISED = 'farm_raised',
  GRASS_FED = 'grass_fed',
  FREE_RANGE = 'free_range',
  CAGE_FREE = 'cage_free',
  PASTURE_RAISED = 'pasture_raised',
}

/**
 * Ingredient categories
 * @description Defines the main ingredient categories
 */
export enum IngredientCategory {
  VEGETABLES = 'vegetables',
  FRUITS = 'fruits',
  GRAINS = 'grains',
  PROTEINS = 'proteins',
  DAIRY = 'dairy',
  EGGS = 'eggs',
  SEAFOOD = 'seafood',
  MEAT = 'meat',
  POULTRY = 'poultry',
  LEGUMES = 'legumes',
  NUTS = 'nuts',
  SEEDS = 'seeds',
  HERBS = 'herbs',
  SPICES = 'spices',
  CONDIMENTS = 'condiments',
  OILS = 'oils',
  VINEGARS = 'vinegars',
  SWEETENERS = 'sweeteners',
  FLOURS = 'flours',
  BAKING_INGREDIENTS = 'baking_ingredients',
  BEVERAGES = 'beverages',
  ALCOHOL = 'alcohol',
  SUPPLEMENTS = 'supplements',
  PROCESSED_FOODS = 'processed_foods',
  FROZEN_FOODS = 'frozen_foods',
  CANNED_FOODS = 'canned_foods',
  DRIED_FOODS = 'dried_foods',
  FERMENTED_FOODS = 'fermented_foods',
  PRESERVED_FOODS = 'preserved_foods',
}

/**
 * Ingredient unit types
 * @description Defines the measurement units for ingredients
 */
export enum IngredientUnit {
  // Weight units
  GRAM = 'gram',
  KILOGRAM = 'kilogram',
  OUNCE = 'ounce',
  POUND = 'pound',

  // Volume units
  MILLILITER = 'milliliter',
  LITER = 'liter',
  TEASPOON = 'teaspoon',
  TABLESPOON = 'tablespoon',
  CUP = 'cup',
  PINT = 'pint',
  QUART = 'quart',
  GALLON = 'gallon',

  // Count units
  PIECE = 'piece',
  SLICE = 'slice',
  CLOVE = 'clove',
  BUNCH = 'bunch',
  HEAD = 'head',
  STALK = 'stalk',
  SPRIG = 'sprig',
  LEAF = 'leaf',
  BULB = 'bulb',
  ROOT = 'root',

  // Custom units
  PINCH = 'pinch',
  DASH = 'dash',
  DROP = 'drop',
  CAN = 'can',
  JAR = 'jar',
  BOTTLE = 'bottle',
  PACKAGE = 'package',
  BAG = 'bag',
  BOX = 'box',
  CONTAINER = 'container',
}

/**
 * Ingredient season types
 * @description Defines the seasonal availability of ingredients
 */
export enum IngredientSeason {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
  ALL_YEAR = 'all_year',
  EARLY_SPRING = 'early_spring',
  LATE_SPRING = 'late_spring',
  EARLY_SUMMER = 'early_summer',
  LATE_SUMMER = 'late_summer',
  EARLY_AUTUMN = 'early_autumn',
  LATE_AUTUMN = 'late_autumn',
  EARLY_WINTER = 'early_winter',
  LATE_WINTER = 'late_winter',
}

/**
 * Ingredient origin regions
 * @description Defines the geographic origin regions for ingredients
 */
export enum IngredientOrigin {
  NORTH_AMERICA = 'north_america',
  SOUTH_AMERICA = 'south_america',
  EUROPE = 'europe',
  ASIA = 'asia',
  AFRICA = 'africa',
  AUSTRALIA = 'australia',
  OCEANIA = 'oceania',
  MEDITERRANEAN = 'mediterranean',
  MIDDLE_EAST = 'middle_east',
  CARIBBEAN = 'caribbean',
  CENTRAL_AMERICA = 'central_america',
  LOCAL = 'local',
  UNKNOWN = 'unknown',
}

/**
 * Ingredient storage conditions
 * @description Defines the storage conditions for ingredients
 */
export enum IngredientStorageCondition {
  ROOM_TEMPERATURE = 'room_temperature',
  REFRIGERATED = 'refrigerated',
  FROZEN = 'frozen',
  DRY = 'dry',
  DARK = 'dark',
  HUMID = 'humid',
  VENTILATED = 'ventilated',
  SEALED = 'sealed',
  VACUUM_SEALED = 'vacuum_sealed',
  CANNED = 'canned',
  JARRED = 'jarred',
  BOTTLED = 'bottled',
  BAGGED = 'bagged',
  BOXED = 'boxed',
}

/**
 * Ingredient certification types
 * @description Defines the certification types for ingredients
 */
export enum IngredientCertification {
  ORGANIC = 'organic',
  NON_GMO = 'non_gmo',
  FAIR_TRADE = 'fair_trade',
  RAINFOREST_ALLIANCE = 'rainforest_alliance',
  UTZ_CERTIFIED = 'utz_certified',
  B_CORP = 'b_corp',
  CARBON_NEUTRAL = 'carbon_neutral',
  SUSTAINABLE_FISHING = 'sustainable_fishing',
  ANIMAL_WELFARE = 'animal_welfare',
  KOSHER = 'kosher',
  HALAL = 'halal',
  VEGAN_SOCIETY = 'vegan_society',
  VEGETARIAN_SOCIETY = 'vegetarian_society',
  GLUTEN_FREE_CERTIFIED = 'gluten_free_certified',
  DAIRY_FREE_CERTIFIED = 'dairy_free_certified',
  NUT_FREE_CERTIFIED = 'nut_free_certified',
  ALLERGEN_FREE_CERTIFIED = 'allergen_free_certified',
}

/**
 * Ingredient sustainability levels
 * @description Defines the sustainability levels for ingredients
 */
export enum IngredientSustainabilityLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
  EXCELLENT = 'excellent',
}

/**
 * Ingredient cost levels
 * @description Defines the cost levels for ingredients
 */
export enum IngredientCostLevel {
  BUDGET = 'budget',
  AFFORDABLE = 'affordable',
  MODERATE = 'moderate',
  EXPENSIVE = 'expensive',
  LUXURY = 'luxury',
  PREMIUM = 'premium',
}

/**
 * Ingredient availability status
 * @description Defines the availability status of ingredients
 */
export enum IngredientAvailability {
  AVAILABLE = 'available',
  LIMITED = 'limited',
  OUT_OF_STOCK = 'out_of_stock',
  SEASONAL = 'seasonal',
  DISCONTINUED = 'discontinued',
  BACKORDER = 'backorder',
  PRE_ORDER = 'pre_order',
}
