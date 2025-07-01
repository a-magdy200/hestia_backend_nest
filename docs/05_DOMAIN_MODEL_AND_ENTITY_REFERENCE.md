# Domain Model and Entity Reference

## 📋 Document Information

| **Document Type** | Domain Model and Entity Reference |
| ----------------- | --------------------------------- |
| **Version**       | 1.1.0                             |
| **Last Updated**  | December 28, 2024                 |
| **Owner**         | Backend Development Team           |
| **Status**        | Phase 1 - 90% Complete            |

---

## Table of Contents

1. [Domain Overview](#domain-overview)
2. [Core Entities](#core-entities)
3. [Authentication Entities](#authentication-entities)
4. [User Management Entities](#user-management-entities)
5. [Profile Management Entities](#profile-management-entities)
6. [Recipe Management Entities](#recipe-management-entities)
7. [Ingredient Management Entities](#ingredient-management-entities)
8. [Shopping List Entities](#shopping-list-entities)
9. [Item Management Entities](#item-management-entities)
10. [Multi-Tenant Entities](#multi-tenant-entities)
11. [Monitoring Entities](#monitoring-entities)
12. [Data Relationships](#data-relationships)
13. [Validation Rules](#validation-rules)

## Domain Overview

The Hestia Platform domain model represents a comprehensive cooking and recipe management system with user authentication, profile management, recipe creation, ingredient tracking, and shopping list functionality. The domain is designed to support both individual users and multi-tenant organizations.

### Core Domain Concepts

- **Users**: System users with authentication and authorization
- **Profiles**: Extended user information and preferences
- **Recipes**: Cooking recipes with ingredients and instructions
- **Ingredients**: Food items with nutritional and dietary information
- **Shopping Lists**: User shopping lists with items
- **Items**: Physical items and equipment management
- **Tenants**: Multi-tenant organization support

## Core Entities

### Base Entity

**Status**: ✅ **Implemented**

```typescript
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
```

## Authentication Entities

### User Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  emailVerificationExpires: Date;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  // Relationships
  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
  profile: UserProfile;

  @OneToMany(() => Recipe, recipe => recipe.user)
  recipes: Recipe[];

  @OneToMany(() => ShoppingList, shoppingList => shoppingList.user)
  shoppingLists: ShoppingList[];

  @OneToMany(() => Item, item => item.user)
  items: Item[];

  @ManyToOne(() => Tenant, tenant => tenant.users, { nullable: true })
  tenant: Tenant;

  @Column({ nullable: true })
  tenantId: string;
}
```

### User Role Enum

**Status**: ✅ **Implemented**

```typescript
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}
```

## User Management Entities

### User Methods Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('user_methods')
export class UserMethods extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  methodName: string;

  @Column({ type: 'jsonb' })
  methodData: any;

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ nullable: true })
  lastUsedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

## Profile Management Entities

### User Profile Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @Column()
  userId: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'jsonb', nullable: true })
  address: Address;

  @Column({ type: 'jsonb', nullable: true })
  preferences: UserPreferences;

  @Column({ type: 'jsonb', nullable: true })
  dietaryRestrictions: string[];

  @Column({ type: 'jsonb', nullable: true })
  allergies: string[];

  @Column({
    type: 'enum',
    enum: CookingSkillLevel,
    nullable: true,
  })
  cookingSkillLevel: CookingSkillLevel;

  @Column({ type: 'jsonb', nullable: true })
  preferredCuisines: string[];

  @Column({
    type: 'enum',
    enum: SpiceTolerance,
    nullable: true,
  })
  spiceTolerance: SpiceTolerance;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ default: false })
  isPublic: boolean;

  // Relationships
  @OneToOne(() => User, user => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

### User Profile Methods Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('user_profile_methods')
export class UserProfileMethods extends BaseEntity {
  @Column()
  profileId: string;

  @Column()
  methodName: string;

  @Column({ type: 'jsonb' })
  methodData: any;

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ nullable: true })
  lastUsedAt: Date;

  // Relationships
  @ManyToOne(() => UserProfile, profile => profile.id)
  @JoinColumn({ name: 'profileId' })
  profile: UserProfile;
}
```

### User Profile Validators Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('user_profile_validators')
export class UserProfileValidators extends BaseEntity {
  @Column()
  profileId: string;

  @Column()
  validatorName: string;

  @Column({ type: 'jsonb' })
  validatorConfig: any;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastValidationAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  validationResult: any;

  // Relationships
  @ManyToOne(() => UserProfile, profile => profile.id)
  @JoinColumn({ name: 'profileId' })
  profile: UserProfile;
}
```

### Gender Enum

**Status**: ✅ **Implemented**

```typescript
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}
```

### Cooking Skill Level Enum

**Status**: ✅ **Implemented**

```typescript
export enum CookingSkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}
```

### Spice Tolerance Enum

**Status**: ✅ **Implemented**

```typescript
export enum SpiceTolerance {
  MILD = 'mild',
  MEDIUM = 'medium',
  HOT = 'hot',
  EXTREME = 'extreme',
}
```

### Address Interface

**Status**: ✅ **Implemented**

```typescript
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  apartment?: string;
}
```

### User Preferences Interface

**Status**: ✅ **Implemented**

```typescript
export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  cookingSkillLevel: CookingSkillLevel;
  preferredCuisines: string[];
  spiceTolerance: SpiceTolerance;
  measurementUnit: 'metric' | 'imperial';
  language: string;
  timezone: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}
```

## Recipe Management Entities

### Recipe Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('recipes')
export class Recipe extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  instructions: string;

  @Column({ type: 'int' })
  prepTime: number; // in minutes

  @Column({ type: 'int' })
  cookingTime: number; // in minutes

  @Column({ type: 'int' })
  servings: number;

  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.MEDIUM,
  })
  difficulty: Difficulty;

  @Column({ nullable: true })
  cuisine: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  nutritionalInfo: NutritionalInfo;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  favoriteCount: number;

  @Column()
  userId: string;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @ManyToOne(() => User, user => user.recipes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => RecipeIngredient, recipeIngredient => recipeIngredient.recipe)
  recipeIngredients: RecipeIngredient[];

  @OneToMany(() => RecipeStep, recipeStep => recipeStep.recipe)
  recipeSteps: RecipeStep[];

  @ManyToOne(() => Tenant, tenant => tenant.recipes, { nullable: true })
  tenant: Tenant;
}
```

### Difficulty Enum

**Status**: ✅ **Implemented**

```typescript
export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}
```

### Nutritional Info Interface

**Status**: ✅ **Implemented**

```typescript
export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
}
```

### Recipe Ingredient Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('recipe_ingredients')
export class RecipeIngredient extends BaseEntity {
  @Column()
  recipeId: string;

  @Column()
  ingredientId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', nullable: true })
  order: number;

  // Relationships
  @ManyToOne(() => Recipe, recipe => recipe.recipeIngredients)
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;

  @ManyToOne(() => Ingredient, ingredient => ingredient.recipeIngredients)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
```

### Recipe Step Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('recipe_steps')
export class RecipeStep extends BaseEntity {
  @Column()
  recipeId: string;

  @Column({ type: 'int' })
  stepNumber: number;

  @Column({ type: 'text' })
  instruction: string;

  @Column({ type: 'int', nullable: true })
  duration: number; // in minutes

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  tips: string[];

  // Relationships
  @ManyToOne(() => Recipe, recipe => recipe.recipeSteps)
  @JoinColumn({ name: 'recipeId' })
  recipe: Recipe;
}
```

## Ingredient Management Entities

### Ingredient Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('ingredients')
export class Ingredient extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  categoryId: string;

  @Column({ type: 'jsonb', nullable: true })
  nutritionalInfo: NutritionalInfo;

  @Column({ type: 'jsonb', nullable: true })
  allergens: string[];

  @Column({ type: 'jsonb', nullable: true })
  dietaryTypes: string[];

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: false })
  isSeasonal: boolean;

  @Column({ type: 'jsonb', nullable: true })
  seasonalMonths: number[];

  @Column({ nullable: true })
  origin: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @ManyToOne(() => IngredientCategory, category => category.ingredients)
  @JoinColumn({ name: 'categoryId' })
  category: IngredientCategory;

  @OneToMany(() => RecipeIngredient, recipeIngredient => recipeIngredient.ingredient)
  recipeIngredients: RecipeIngredient[];

  @OneToMany(() => IngredientSubstitution, substitution => substitution.originalIngredient)
  substitutions: IngredientSubstitution[];

  @ManyToOne(() => Tenant, tenant => tenant.ingredients, { nullable: true })
  tenant: Tenant;
}
```

### Ingredient Category Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('ingredient_categories')
export class IngredientCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  parentCategoryId: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @OneToMany(() => Ingredient, ingredient => ingredient.category)
  ingredients: Ingredient[];

  @ManyToOne(() => IngredientCategory, category => category.id, { nullable: true })
  @JoinColumn({ name: 'parentCategoryId' })
  parentCategory: IngredientCategory;

  @OneToMany(() => IngredientCategory, category => category.parentCategory)
  subCategories: IngredientCategory[];

  @ManyToOne(() => Tenant, tenant => tenant.ingredientCategories, { nullable: true })
  tenant: Tenant;
}
```

### Ingredient Allergen Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('ingredient_allergens')
export class IngredientAllergen extends BaseEntity {
  @Column()
  ingredientId: string;

  @Column()
  allergenName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => Ingredient, ingredient => ingredient.id)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
```

### Ingredient Dietary Type Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('ingredient_dietary_types')
export class IngredientDietaryType extends BaseEntity {
  @Column()
  ingredientId: string;

  @Column()
  dietaryType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => Ingredient, ingredient => ingredient.id)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
```

### Ingredient Substitution Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('ingredient_substitutions')
export class IngredientSubstitution extends BaseEntity {
  @Column()
  originalIngredientId: string;

  @Column()
  substituteIngredientId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  substitutionRatio: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => Ingredient, ingredient => ingredient.substitutions)
  @JoinColumn({ name: 'originalIngredientId' })
  originalIngredient: Ingredient;

  @ManyToOne(() => Ingredient, ingredient => ingredient.id)
  @JoinColumn({ name: 'substituteIngredientId' })
  substituteIngredient: Ingredient;
}
```

## Shopping List Entities

### Shopping List Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('shopping_lists')
export class ShoppingList extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  plannedDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ nullable: true })
  store: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column()
  userId: string;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @ManyToOne(() => User, user => user.shoppingLists)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ShoppingListItem, item => item.shoppingList)
  items: ShoppingListItem[];

  @ManyToOne(() => Tenant, tenant => tenant.shoppingLists, { nullable: true })
  tenant: Tenant;
}
```

### Shopping List Item Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('shopping_list_items')
export class ShoppingListItem extends BaseEntity {
  @Column()
  shoppingListId: string;

  @Column()
  ingredientId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

  @Column({ default: false })
  isPurchased: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', nullable: true })
  priority: number;

  // Relationships
  @ManyToOne(() => ShoppingList, shoppingList => shoppingList.items)
  @JoinColumn({ name: 'shoppingListId' })
  shoppingList: ShoppingList;

  @ManyToOne(() => Ingredient, ingredient => ingredient.id)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Ingredient;
}
```

### Shopping List Analytics Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('shopping_list_analytics')
export class ShoppingListAnalytics extends BaseEntity {
  @Column()
  shoppingListId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalSpent: number;

  @Column({ type: 'int' })
  itemsPurchased: number;

  @Column({ type: 'int' })
  totalItems: number;

  @Column({ type: 'jsonb', nullable: true })
  categoryBreakdown: any;

  @Column({ type: 'jsonb', nullable: true })
  storeBreakdown: any;

  // Relationships
  @ManyToOne(() => ShoppingList, shoppingList => shoppingList.id)
  @JoinColumn({ name: 'shoppingListId' })
  shoppingList: ShoppingList;
}
```

## Item Management Entities

### Item Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('items')
export class Item extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  categoryId: string;

  @Column({
    type: 'enum',
    enum: ItemType,
    default: ItemType.EQUIPMENT,
  })
  type: ItemType;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.ACTIVE,
  })
  status: ItemStatus;

  @Column({
    type: 'enum',
    enum: ItemPriority,
    default: ItemPriority.MEDIUM,
  })
  priority: ItemPriority;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ type: 'text', nullable: true })
  warrantyInfo: string;

  @Column({ type: 'date', nullable: true })
  warrantyExpiry: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @ManyToOne(() => ItemCategory, category => category.items)
  @JoinColumn({ name: 'categoryId' })
  category: ItemCategory;

  @ManyToOne(() => User, user => user.items)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ItemMaintenance, maintenance => maintenance.item)
  maintenanceRecords: ItemMaintenance[];

  @ManyToOne(() => Tenant, tenant => tenant.items, { nullable: true })
  tenant: Tenant;
}
```

### Item Type Enum

**Status**: ✅ **Implemented**

```typescript
export enum ItemType {
  EQUIPMENT = 'equipment',
  UTENSIL = 'utensil',
  APPLIANCE = 'appliance',
  CONTAINER = 'container',
  OTHER = 'other',
}
```

### Item Status Enum

**Status**: ✅ **Implemented**

```typescript
export enum ItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
  LOST = 'lost',
}
```

### Item Priority Enum

**Status**: ✅ **Implemented**

```typescript
export enum ItemPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}
```

### Item Category Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('item_categories')
export class ItemCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  parentCategoryId: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @OneToMany(() => Item, item => item.category)
  items: Item[];

  @ManyToOne(() => ItemCategory, category => category.id, { nullable: true })
  @JoinColumn({ name: 'parentCategoryId' })
  parentCategory: ItemCategory;

  @OneToMany(() => ItemCategory, category => category.parentCategory)
  subCategories: ItemCategory[];

  @ManyToOne(() => Tenant, tenant => tenant.itemCategories, { nullable: true })
  tenant: Tenant;
}
```

### Item Maintenance Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('item_maintenance')
export class ItemMaintenance extends BaseEntity {
  @Column()
  itemId: string;

  @Column()
  maintenanceType: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  maintenanceDate: Date;

  @Column({ type: 'date', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ nullable: true })
  performedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isCompleted: boolean;

  // Relationships
  @ManyToOne(() => Item, item => item.maintenanceRecords)
  @JoinColumn({ name: 'itemId' })
  item: Item;
}
```

## Multi-Tenant Entities

### Tenant Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ unique: true })
  domain: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  branding: TenantBranding;

  @Column({ type: 'jsonb', nullable: true })
  settings: TenantSettings;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  subscriptionExpiry: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.BASIC,
  })
  subscriptionTier: SubscriptionTier;

  // Relationships
  @OneToMany(() => User, user => user.tenant)
  users: User[];

  @OneToMany(() => Recipe, recipe => recipe.tenant)
  recipes: Recipe[];

  @OneToMany(() => Ingredient, ingredient => ingredient.tenant)
  ingredients: Ingredient[];

  @OneToMany(() => IngredientCategory, category => category.tenant)
  ingredientCategories: IngredientCategory[];

  @OneToMany(() => ShoppingList, shoppingList => shoppingList.tenant)
  shoppingLists: ShoppingList[];

  @OneToMany(() => Item, item => item.tenant)
  items: Item[];

  @OneToMany(() => ItemCategory, category => category.tenant)
  itemCategories: ItemCategory[];

  @OneToMany(() => TenantSettings, settings => settings.tenant)
  tenantSettings: TenantSettings[];
}
```

### Subscription Tier Enum

**Status**: ✅ **Implemented**

```typescript
export enum SubscriptionTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}
```

### Tenant Branding Interface

**Status**: ✅ **Implemented**

```typescript
export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  customCss: string;
  customJs: string;
}
```

### Tenant Settings Interface

**Status**: ✅ **Implemented**

```typescript
export interface TenantSettings {
  features: {
    recipes: boolean;
    ingredients: boolean;
    shoppingLists: boolean;
    items: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  limits: {
    maxUsers: number;
    maxRecipes: number;
    maxIngredients: number;
    maxShoppingLists: number;
    maxItems: number;
  };
  preferences: {
    defaultLanguage: string;
    defaultTimezone: string;
    measurementUnit: 'metric' | 'imperial';
    dateFormat: string;
    timeFormat: string;
  };
}
```

### Tenant Settings Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('tenant_settings')
export class TenantSettings extends BaseEntity {
  @Column()
  tenantId: string;

  @Column()
  settingKey: string;

  @Column({ type: 'jsonb' })
  settingValue: any;

  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => Tenant, tenant => tenant.tenantSettings)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
```

### Tenant Branding Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('tenant_branding')
export class TenantBranding extends BaseEntity {
  @Column()
  tenantId: string;

  @Column({ nullable: true })
  primaryColor: string;

  @Column({ nullable: true })
  secondaryColor: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  faviconUrl: string;

  @Column({ type: 'text', nullable: true })
  customCss: string;

  @Column({ type: 'text', nullable: true })
  customJs: string;

  // Relationships
  @ManyToOne(() => Tenant, tenant => tenant.id)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
```

## Monitoring Entities

### API Request Log Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('api_request_logs')
export class ApiRequestLog extends BaseEntity {
  @Column()
  requestId: string;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'int' })
  statusCode: number;

  @Column({ type: 'int' })
  responseTime: number; // in milliseconds

  @Column({ type: 'jsonb', nullable: true })
  requestHeaders: any;

  @Column({ type: 'jsonb', nullable: true })
  responseHeaders: any;

  @Column({ type: 'jsonb', nullable: true })
  requestBody: any;

  @Column({ type: 'jsonb', nullable: true })
  responseBody: any;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Tenant, tenant => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
```

### Error Log Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('error_logs')
export class ErrorLog extends BaseEntity {
  @Column()
  errorType: string;

  @Column()
  errorMessage: string;

  @Column({ type: 'text' })
  stackTrace: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  requestId: string;

  @Column({ nullable: true })
  url: string;

  @Column({ nullable: true })
  method: string;

  @Column({ type: 'jsonb', nullable: true })
  requestData: any;

  @Column({ type: 'jsonb', nullable: true })
  context: any;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Tenant, tenant => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
```

### Performance Metric Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('performance_metrics')
export class PerformanceMetric extends BaseEntity {
  @Column()
  metricName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  metricValue: number;

  @Column()
  metricUnit: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Tenant, tenant => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
```

### Application Metric Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('application_metrics')
export class ApplicationMetric extends BaseEntity {
  @Column()
  metricName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  metricValue: number;

  @Column()
  metricUnit: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @ManyToOne(() => Tenant, tenant => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
```

### Monitoring Entity

**Status**: ✅ **Implemented**

```typescript
@Entity('monitoring')
export class Monitoring extends BaseEntity {
  @Column()
  serviceName: string;

  @Column()
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  healthCheck: any;

  @Column({ type: 'timestamp', nullable: true })
  lastCheck: Date;

  @Column({ type: 'int', nullable: true })
  responseTime: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  tenantId: string;

  // Relationships
  @ManyToOne(() => Tenant, tenant => tenant.id, { nullable: true })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
```

## Data Relationships

### Entity Relationship Diagram

**Status**: ✅ **Implemented**

```
User (1) ←→ (1) UserProfile
User (1) ←→ (N) Recipe
User (1) ←→ (N) ShoppingList
User (1) ←→ (N) Item
User (N) ←→ (1) Tenant

Recipe (1) ←→ (N) RecipeIngredient
Recipe (1) ←→ (N) RecipeStep
RecipeIngredient (N) ←→ (1) Ingredient

Ingredient (N) ←→ (1) IngredientCategory
Ingredient (1) ←→ (N) IngredientAllergen
Ingredient (1) ←→ (N) IngredientDietaryType
Ingredient (1) ←→ (N) IngredientSubstitution

ShoppingList (1) ←→ (N) ShoppingListItem
ShoppingListItem (N) ←→ (1) Ingredient

Item (N) ←→ (1) ItemCategory
Item (1) ←→ (N) ItemMaintenance

Tenant (1) ←→ (N) User
Tenant (1) ←→ (N) Recipe
Tenant (1) ←→ (N) Ingredient
Tenant (1) ←→ (N) ShoppingList
Tenant (1) ←→ (N) Item
Tenant (1) ←→ (N) TenantSettings
Tenant (1) ←→ (1) TenantBranding
```

## Validation Rules

### User Validation

**Status**: ✅ **Implemented**

```typescript
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;
}
```

### Recipe Validation

**Status**: ✅ **Implemented**

```typescript
export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  instructions: string;

  @IsNumber()
  @Min(1)
  @Max(1440)
  prepTime: number;

  @IsNumber()
  @Min(1)
  @Max(1440)
  cookingTime: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  servings: number;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
```

### Ingredient Validation

**Status**: ✅ **Implemented**

```typescript
export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsObject()
  nutritionalInfo?: NutritionalInfo;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryTypes?: string[];
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Dec 28, 2024 | Updated implementation status, added completed entities |
| 1.0.0 | Dec 20, 2024 | Initial domain model documentation |

## Support & Contact

For domain model support and questions:
- **Email**: domain-support@hestia.com
- **Documentation**: https://docs.hestia.com/domain-model
- **Status Page**: https://status.hestia.com
