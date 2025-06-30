/**
 * Recipe-related enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all recipe-related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * Recipe status options
 * @description Defines the workflow status of recipes
 */
export enum RecipeStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  REJECTED = 'rejected',
  PENDING_APPROVAL = 'pending_approval',
}

/**
 * Recipe difficulty levels
 * @description Defines the difficulty levels for recipes
 */
export enum RecipeDifficulty {
  BEGINNER = 'beginner',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
  MASTER = 'master',
}

/**
 * Recipe cuisine types
 * @description Defines the available cuisine types
 */
export enum RecipeCuisine {
  AMERICAN = 'american',
  ITALIAN = 'italian',
  FRENCH = 'french',
  CHINESE = 'chinese',
  JAPANESE = 'japanese',
  INDIAN = 'indian',
  MEXICAN = 'mexican',
  THAI = 'thai',
  MEDITERRANEAN = 'mediterranean',
  GREEK = 'greek',
  SPANISH = 'spanish',
  GERMAN = 'german',
  BRITISH = 'british',
  AFRICAN = 'african',
  CARIBBEAN = 'caribbean',
  MIDDLE_EASTERN = 'middle_eastern',
  LATIN_AMERICAN = 'latin_american',
  ASIAN = 'asian',
  EUROPEAN = 'european',
  FUSION = 'fusion',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  OTHER = 'other',
}

/**
 * Recipe meal types
 * @description Defines the meal types for recipes
 */
export enum RecipeMealType {
  BREAKFAST = 'breakfast',
  BRUNCH = 'brunch',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  DESSERT = 'dessert',
  SNACK = 'snack',
  APPETIZER = 'appetizer',
  SOUP = 'soup',
  SALAD = 'salad',
  MAIN_COURSE = 'main_course',
  SIDE_DISH = 'side_dish',
  BEVERAGE = 'beverage',
  COCKTAIL = 'cocktail',
  BREAD = 'bread',
  PASTA = 'pasta',
  SEAFOOD = 'seafood',
  MEAT = 'meat',
  POULTRY = 'poultry',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
}

/**
 * Recipe dietary restrictions
 * @description Defines dietary restrictions and preferences
 */
export enum RecipeDietaryRestriction {
  NONE = 'none',
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
}

/**
 * Recipe cooking methods
 * @description Defines the cooking methods used in recipes
 */
export enum RecipeCookingMethod {
  BAKING = 'baking',
  BOILING = 'boiling',
  BROILING = 'broiling',
  FRYING = 'frying',
  GRILLING = 'grilling',
  ROASTING = 'roasting',
  SAUTEING = 'sauteing',
  STEAMING = 'steaming',
  STEWING = 'stewing',
  SMOKING = 'smoking',
  BRAISING = 'braising',
  POACHING = 'poaching',
  SEARING = 'searing',
  BLANCHING = 'blanching',
  DEEP_FRYING = 'deep_frying',
  PAN_FRYING = 'pan_frying',
  STIR_FRYING = 'stir_frying',
  SLOW_COOKING = 'slow_cooking',
  PRESSURE_COOKING = 'pressure_cooking',
  AIR_FRYING = 'air_frying',
  SOUS_VIDE = 'sous_vide',
  FERMENTING = 'fermenting',
  PICKLING = 'pickling',
  CURING = 'curing',
  DEHYDRATING = 'dehydrating',
  FREEZING = 'freezing',
  CANNING = 'canning',
  PRESERVING = 'preserving',
}

/**
 * Recipe season types
 * @description Defines the seasonal availability of recipes
 */
export enum RecipeSeason {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
  ALL_YEAR = 'all_year',
  HOLIDAY = 'holiday',
  SPECIAL_OCCASION = 'special_occasion',
}

/**
 * Recipe rating scale
 * @description Defines the rating scale for recipes
 */
export enum RecipeRating {
  ONE_STAR = 1,
  TWO_STARS = 2,
  THREE_STARS = 3,
  FOUR_STARS = 4,
  FIVE_STARS = 5,
}

/**
 * Recipe visibility levels
 * @description Defines the visibility levels for recipes
 */
export enum RecipeVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  TENANT_ONLY = 'tenant_only',
  FRIENDS_ONLY = 'friends_only',
  UNLISTED = 'unlisted',
}

/**
 * Recipe approval status
 * @description Defines the approval status for recipes
 */
export enum RecipeApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review',
  NEEDS_REVISION = 'needs_revision',
}

/**
 * Recipe source types
 * @description Defines the source types for recipes
 */
export enum RecipeSourceType {
  ORIGINAL = 'original',
  ADAPTED = 'adapted',
  TRADITIONAL = 'traditional',
  FAMILY_RECIPE = 'family_recipe',
  CHEF_RECIPE = 'chef_recipe',
  RESTAURANT = 'restaurant',
  COOKBOOK = 'cookbook',
  MAGAZINE = 'magazine',
  BLOG = 'blog',
  SOCIAL_MEDIA = 'social_media',
  VIDEO = 'video',
  PODCAST = 'podcast',
  WORKSHOP = 'workshop',
  CLASS = 'class',
  OTHER = 'other',
}

/**
 * Recipe cost levels
 * @description Defines the cost levels for recipes
 */
export enum RecipeCostLevel {
  BUDGET = 'budget',
  AFFORDABLE = 'affordable',
  MODERATE = 'moderate',
  EXPENSIVE = 'expensive',
  LUXURY = 'luxury',
}

/**
 * Recipe time categories
 * @description Defines the time categories for recipes
 */
export enum RecipeTimeCategory {
  QUICK = 'quick', // Under 15 minutes
  FAST = 'fast', // 15-30 minutes
  MODERATE = 'moderate', // 30-60 minutes
  SLOW = 'slow', // 1-2 hours
  VERY_SLOW = 'very_slow', // Over 2 hours
  OVERNIGHT = 'overnight',
  MULTI_DAY = 'multi_day',
}
