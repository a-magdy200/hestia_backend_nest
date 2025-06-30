/**
 * Shopping list related enums for the Hestia Enterprise SaaS Platform
 *
 * @description This file contains all shopping list related enums used across the application
 * @author Hestia Development Team
 * @version 1.0.0
 * @since 2024-12-28
 */

/**
 * Shopping list status options
 * @description Defines the possible states of a shopping list
 */
export enum ShoppingListStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived',
  SHARED = 'shared',
  COLLABORATIVE = 'collaborative',
}

/**
 * Shopping list item status
 * @description Defines the status of individual shopping list items
 */
export enum ShoppingListItemStatus {
  PENDING = 'pending',
  IN_CART = 'in_cart',
  PURCHASED = 'purchased',
  UNAVAILABLE = 'unavailable',
  SUBSTITUTED = 'substituted',
  REMOVED = 'removed',
  ON_HOLD = 'on_hold',
}

/**
 * Shopping list priority levels
 * @description Defines the priority levels for shopping lists
 */
export enum ShoppingListPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

/**
 * Shopping list types
 * @description Defines the types of shopping lists
 */
export enum ShoppingListType {
  GROCERY = 'grocery',
  HOUSEHOLD = 'household',
  PERSONAL = 'personal',
  WORK = 'work',
  EVENT = 'event',
  PARTY = 'party',
  HOLIDAY = 'holiday',
  TRAVEL = 'travel',
  EMERGENCY = 'emergency',
  BULK = 'bulk',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SEASONAL = 'seasonal',
  CUSTOM = 'custom',
}

/**
 * Shopping list visibility
 * @description Defines the visibility levels for shopping lists
 */
export enum ShoppingListVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
  TENANT_ONLY = 'tenant_only',
  FAMILY = 'family',
  TEAM = 'team',
  ORGANIZATION = 'organization',
}

/**
 * Shopping list sharing permissions
 * @description Defines the sharing permission levels for shopping lists
 */
export enum ShoppingListSharingPermission {
  VIEW_ONLY = 'view_only',
  EDIT = 'edit',
  MANAGE = 'manage',
  ADMIN = 'admin',
  OWNER = 'owner',
}

/**
 * Shopping list item categories
 * @description Defines the categories for shopping list items
 */
export enum ShoppingListItemCategory {
  PRODUCE = 'produce',
  DAIRY = 'dairy',
  MEAT = 'meat',
  SEAFOOD = 'seafood',
  PANTRY = 'pantry',
  FROZEN = 'frozen',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  BAKERY = 'bakery',
  DELI = 'deli',
  HOUSEHOLD = 'household',
  PERSONAL_CARE = 'personal_care',
  BABY = 'baby',
  PET = 'pet',
  PHARMACY = 'pharmacy',
  AUTOMOTIVE = 'automotive',
  GARDEN = 'garden',
  OFFICE = 'office',
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  BOOKS = 'books',
  SPORTS = 'sports',
  TOYS = 'toys',
  OTHER = 'other',
}

/**
 * Shopping list item priority
 * @description Defines the priority levels for shopping list items
 */
export enum ShoppingListItemPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  ESSENTIAL = 'essential',
}

/**
 * Shopping list item quantity types
 * @description Defines the quantity types for shopping list items
 */
export enum ShoppingListItemQuantityType {
  EXACT = 'exact',
  APPROXIMATE = 'approximate',
  MINIMUM = 'minimum',
  MAXIMUM = 'maximum',
  RANGE = 'range',
  FLEXIBLE = 'flexible',
}

/**
 * Shopping list item substitution types
 * @description Defines the substitution types for shopping list items
 */
export enum ShoppingListItemSubstitutionType {
  NONE = 'none',
  SIMILAR = 'similar',
  ALTERNATIVE = 'alternative',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  BRAND_SUBSTITUTION = 'brand_substitution',
  SIZE_SUBSTITUTION = 'size_substitution',
  QUANTITY_SUBSTITUTION = 'quantity_substitution',
}

/**
 * Shopping list reminder types
 * @description Defines the reminder types for shopping lists
 */
export enum ShoppingListReminderType {
  NONE = 'none',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  CALENDAR = 'calendar',
  WEBHOOK = 'webhook',
}

/**
 * Shopping list reminder frequency
 * @description Defines the reminder frequency options
 */
export enum ShoppingListReminderFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
  BEFORE_EXPIRY = 'before_expiry',
  ON_DUE_DATE = 'on_due_date',
}

/**
 * Shopping list budget types
 * @description Defines the budget types for shopping lists
 */
export enum ShoppingListBudgetType {
  NONE = 'none',
  FIXED = 'fixed',
  FLEXIBLE = 'flexible',
  PER_CATEGORY = 'per_category',
  PER_ITEM = 'per_item',
  PER_PERSON = 'per_person',
  PER_WEEK = 'per_week',
  PER_MONTH = 'per_month',
}

/**
 * Shopping list store types
 * @description Defines the store types for shopping lists
 */
export enum ShoppingListStoreType {
  GROCERY_STORE = 'grocery_store',
  SUPERMARKET = 'supermarket',
  HYPERMARKET = 'hypermarket',
  CONVENIENCE_STORE = 'convenience_store',
  SPECIALTY_STORE = 'specialty_store',
  FARMERS_MARKET = 'farmers_market',
  ONLINE_STORE = 'online_store',
  WHOLESALE_CLUB = 'wholesale_club',
  DISCOUNT_STORE = 'discount_store',
  ORGANIC_STORE = 'organic_store',
  HEALTH_FOOD_STORE = 'health_food_store',
  INTERNATIONAL_MARKET = 'international_market',
  LOCAL_MARKET = 'local_market',
  STREET_VENDOR = 'street_vendor',
  FOOD_TRUCK = 'food_truck',
  OTHER = 'other',
}

/**
 * Shopping list payment methods
 * @description Defines the payment methods for shopping lists
 */
export enum ShoppingListPaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  MOBILE_PAYMENT = 'mobile_payment',
  DIGITAL_WALLET = 'digital_wallet',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  GIFT_CARD = 'gift_card',
  LOYALTY_POINTS = 'loyalty_points',
  COUPON = 'coupon',
  VOUCHER = 'voucher',
  OTHER = 'other',
}

/**
 * Shopping list delivery options
 * @description Defines the delivery options for shopping lists
 */
export enum ShoppingListDeliveryOption {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
  CURBSIDE = 'curbside',
  IN_STORE = 'in_store',
  DRIVE_THROUGH = 'drive_through',
  SAME_DAY = 'same_day',
  NEXT_DAY = 'next_day',
  SCHEDULED = 'scheduled',
  EXPRESS = 'express',
  STANDARD = 'standard',
  FREE = 'free',
  PAID = 'paid',
}

/**
 * Shopping list analytics metrics
 * @description Defines the analytics metrics for shopping lists
 */
export enum ShoppingListAnalyticsMetric {
  TOTAL_ITEMS = 'total_items',
  PURCHASED_ITEMS = 'purchased_items',
  TOTAL_SPENT = 'total_spent',
  AVERAGE_ITEM_PRICE = 'average_item_price',
  COMPLETION_RATE = 'completion_rate',
  TIME_TO_COMPLETE = 'time_to_complete',
  FREQUENCY = 'frequency',
  CATEGORY_BREAKDOWN = 'category_breakdown',
  STORE_PREFERENCE = 'store_preference',
  BUDGET_UTILIZATION = 'budget_utilization',
  SAVINGS = 'savings',
  COUPON_USAGE = 'coupon_usage',
  SUBSTITUTION_RATE = 'substitution_rate',
  RETURN_RATE = 'return_rate',
  SATISFACTION_SCORE = 'satisfaction_score',
}
