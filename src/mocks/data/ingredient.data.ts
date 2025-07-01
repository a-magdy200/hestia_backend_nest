/**
 * Mock ingredient data for MSW
 * Provides realistic ingredient management responses for development and testing
 */

import { faker } from '@faker-js/faker';

/**
 * Mock ingredient interface
 */
interface MockIngredient {
  id: string;
  name: string;
  description: string;
  category:
    | 'Vegetables'
    | 'Fruits'
    | 'Meat'
    | 'Dairy'
    | 'Grains'
    | 'Spices'
    | 'Herbs'
    | 'Nuts'
    | 'Seafood';
  unit: 'g' | 'kg' | 'ml' | 'l' | 'tbsp' | 'tsp' | 'cup' | 'piece' | 'slice' | 'clove';
  allergens: string[];
  dietaryTypes: string[];
  nutritionalInfo: Record<string, number>;
  substitutions: {
    ingredient: string;
    ratio: number;
    notes: string;
  }[];
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generate basic ingredient properties
 * @returns Basic ingredient properties
 */
const generateBasicProperties = () => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.lorem.sentence(),
  category: faker.helpers.arrayElement([
    'Vegetables',
    'Fruits',
    'Meat',
    'Dairy',
    'Grains',
    'Spices',
    'Herbs',
    'Nuts',
    'Seafood',
  ]),
  unit: faker.helpers.arrayElement([
    'g',
    'kg',
    'ml',
    'l',
    'tbsp',
    'tsp',
    'cup',
    'piece',
    'slice',
    'clove',
  ]),
});

/**
 * Generate nutritional information
 * @returns Nutritional information object
 */
const generateNutritionalInfo = () => ({
  calories: faker.number.int({ min: 10, max: 500 }),
  protein: faker.number.float({ min: 0, max: 30, fractionDigits: 1 }),
  carbohydrates: faker.number.float({ min: 0, max: 100, fractionDigits: 1 }),
  fat: faker.number.float({ min: 0, max: 50, fractionDigits: 1 }),
  fiber: faker.number.float({ min: 0, max: 20, fractionDigits: 1 }),
  sugar: faker.number.float({ min: 0, max: 50, fractionDigits: 1 }),
});

/**
 * Generate a single mock ingredient
 * @returns A mock ingredient object
 */
const generateMockIngredient = (): MockIngredient => {
  const basicProps = generateBasicProperties();
  const nutritionalInfo = generateNutritionalInfo();

  return {
    ...basicProps,
    allergens: faker.helpers.arrayElements(
      ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'],
      { min: 0, max: 3 },
    ),
    dietaryTypes: faker.helpers.arrayElements(
      ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Organic', 'Non-GMO'],
      { min: 0, max: 4 },
    ),
    nutritionalInfo,
    substitutions: faker.datatype.boolean()
      ? [
          {
            ingredient: faker.commerce.productName(),
            ratio: faker.number.float({ min: 0.5, max: 2, fractionDigits: 1 }),
            notes: faker.lorem.sentence(),
          },
        ]
      : [],
    imageUrl: faker.image.url(),
    isActive: true,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
};

/**
 * Mock ingredient data
 */
export const mockIngredients: MockIngredient[] = Array.from({ length: 50 }, generateMockIngredient);

/**
 * Mock ingredient categories data
 */
export const mockIngredientCategories = [
  { id: faker.string.uuid(), name: 'Vegetables', description: 'Fresh and frozen vegetables' },
  { id: faker.string.uuid(), name: 'Fruits', description: 'Fresh and dried fruits' },
  { id: faker.string.uuid(), name: 'Meat', description: 'Various types of meat and poultry' },
  { id: faker.string.uuid(), name: 'Dairy', description: 'Milk, cheese, and dairy products' },
  { id: faker.string.uuid(), name: 'Grains', description: 'Rice, pasta, bread, and cereals' },
  { id: faker.string.uuid(), name: 'Spices', description: 'Herbs and spices for seasoning' },
  { id: faker.string.uuid(), name: 'Herbs', description: 'Fresh and dried herbs' },
  { id: faker.string.uuid(), name: 'Nuts', description: 'Various types of nuts and seeds' },
  { id: faker.string.uuid(), name: 'Seafood', description: 'Fish and shellfish' },
];

/**
 * Mock ingredient allergens data
 */
export const mockIngredientAllergens = [
  { id: faker.string.uuid(), name: 'Peanuts', description: 'Peanut allergy' },
  { id: faker.string.uuid(), name: 'Tree Nuts', description: 'Tree nut allergy' },
  { id: faker.string.uuid(), name: 'Milk', description: 'Lactose intolerance' },
  { id: faker.string.uuid(), name: 'Eggs', description: 'Egg allergy' },
  { id: faker.string.uuid(), name: 'Soy', description: 'Soy allergy' },
  { id: faker.string.uuid(), name: 'Wheat', description: 'Gluten intolerance' },
  { id: faker.string.uuid(), name: 'Fish', description: 'Fish allergy' },
  { id: faker.string.uuid(), name: 'Shellfish', description: 'Shellfish allergy' },
];

/**
 * Mock ingredient dietary types data
 */
export const mockIngredientDietaryTypes = [
  { id: faker.string.uuid(), name: 'Vegetarian', description: 'Suitable for vegetarians' },
  { id: faker.string.uuid(), name: 'Vegan', description: 'Suitable for vegans' },
  { id: faker.string.uuid(), name: 'Gluten-Free', description: 'No gluten content' },
  { id: faker.string.uuid(), name: 'Dairy-Free', description: 'No dairy content' },
  { id: faker.string.uuid(), name: 'Organic', description: 'Organically grown' },
  { id: faker.string.uuid(), name: 'Non-GMO', description: 'Non-genetically modified' },
];

/**
 * Mock ingredient management responses
 */
export const mockIngredientData = {
  getIngredients: {
    data: mockIngredients,
    pagination: {
      page: 1,
      limit: 10,
      total: mockIngredients.length,
      totalPages: Math.ceil(mockIngredients.length / 10),
      hasNext: mockIngredients.length > 10,
      hasPrev: false,
    },
  },

  getIngredientById: (id: string) => {
    const ingredient = mockIngredients.find(i => i.id === id);
    return ingredient || null;
  },

  getIngredientByName: (name: string) => {
    const ingredient = mockIngredients.find(i => i.name.toLowerCase() === name.toLowerCase());
    return ingredient || null;
  },

  getIngredientCategories: () => {
    return mockIngredientCategories;
  },

  getIngredientAllergens: () => {
    return mockIngredientAllergens;
  },

  getIngredientDietaryTypes: () => {
    return mockIngredientDietaryTypes;
  },

  createIngredientSuccess: {
    message: 'Ingredient created successfully',
  },

  createIngredientFailure: {
    error: 'Ingredient creation failed',
    message: 'Failed to create ingredient',
  },

  updateIngredientSuccess: {
    message: 'Ingredient updated successfully',
  },

  updateIngredientFailure: {
    error: 'Ingredient not found',
    message: 'The specified ingredient does not exist',
  },

  deleteIngredientSuccess: {
    message: 'Ingredient deleted successfully',
  },

  deleteIngredientFailure: {
    error: 'Ingredient not found',
    message: 'The specified ingredient does not exist',
  },

  searchIngredientsSuccess: {
    message: 'Ingredients found',
  },

  searchIngredientsFailure: {
    error: 'Search failed',
    message: 'Failed to search ingredients',
  },
};
