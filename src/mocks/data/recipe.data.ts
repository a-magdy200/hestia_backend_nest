/**
 * Mock recipe data for MSW
 * Provides realistic recipe management responses for development and testing
 */

import { faker } from '@faker-js/faker';

/**
 * Mock recipe interface
 */
interface MockRecipe {
  id: string;
  userId: string;
  name: string;
  description: string;
  instructions: string[];
  ingredients: {
    ingredientId: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cuisine: 'Italian' | 'Mexican' | 'Asian' | 'American' | 'Mediterranean' | 'Indian';
  tags: string[];
  imageUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mock recipe data
 */
export const mockRecipes: MockRecipe[] = Array.from({ length: 20 }, () => {
  const recipe = {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    name: `${faker.commerce.productName()} Recipe`,
    description: faker.lorem.paragraph(),
    instructions: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () =>
      faker.lorem.sentence(),
    ),
    ingredients: Array.from({ length: faker.number.int({ min: 3, max: 10 }) }, () => {
      const ingredient = {
        ingredientId: faker.string.uuid(),
        quantity: faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 }),
        unit: faker.helpers.arrayElement(['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'piece']),
      };

      if (faker.datatype.boolean()) {
        return { ...ingredient, notes: faker.lorem.sentence() };
      }

      return ingredient;
    }),
    servings: faker.number.int({ min: 1, max: 12 }),
    prepTime: faker.number.int({ min: 5, max: 60 }),
    cookTime: faker.number.int({ min: 10, max: 180 }),
    difficulty: faker.helpers.arrayElement(['EASY', 'MEDIUM', 'HARD']),
    cuisine: faker.helpers.arrayElement([
      'Italian',
      'Mexican',
      'Asian',
      'American',
      'Mediterranean',
      'Indian',
    ]),
    tags: faker.helpers.arrayElements(
      [
        'vegetarian',
        'gluten-free',
        'quick',
        'healthy',
        'spicy',
        'sweet',
        'dinner',
        'breakfast',
        'dessert',
      ],
      { min: 1, max: 4 },
    ),
    isPublic: faker.datatype.boolean(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };

  if (faker.datatype.boolean()) {
    return { ...recipe, imageUrl: faker.image.url() };
  }

  return recipe;
});

/**
 * Mock recipe management responses
 */
export const mockRecipeData = {
  getRecipes: {
    data: mockRecipes,
    pagination: {
      page: 1,
      limit: 10,
      total: mockRecipes.length,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    },
  },

  getRecipeById: (id: string) => {
    const recipe = mockRecipes.find(r => r.id === id);
    return recipe || null;
  },

  createRecipeSuccess: {
    message: 'Recipe created successfully',
  },

  createRecipeFailure: {
    error: 'Recipe creation failed',
    message: 'Failed to create recipe',
  },

  updateRecipeSuccess: {
    message: 'Recipe updated successfully',
  },

  updateRecipeFailure: {
    error: 'Recipe not found',
    message: 'The specified recipe does not exist',
  },

  deleteRecipeSuccess: {
    message: 'Recipe deleted successfully',
  },

  deleteRecipeFailure: {
    error: 'Recipe not found',
    message: 'The specified recipe does not exist',
  },

  addIngredientSuccess: {
    message: 'Ingredient added to recipe successfully',
  },

  addIngredientFailure: {
    error: 'Add ingredient failed',
    message: 'Failed to add ingredient to recipe',
  },

  updateIngredientSuccess: {
    message: 'Recipe ingredient updated successfully',
  },

  updateIngredientFailure: {
    error: 'Ingredient not found',
    message: 'The specified ingredient does not exist in this recipe',
  },

  removeIngredientSuccess: {
    message: 'Ingredient removed from recipe successfully',
  },

  removeIngredientFailure: {
    error: 'Ingredient not found',
    message: 'The specified ingredient does not exist in this recipe',
  },
};
