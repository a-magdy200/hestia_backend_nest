/**
 * Recipe management handlers for MSW
 * Mocks recipe management endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockRecipeData } from '../data/recipe.data';

/**
 * Request body interfaces for type safety
 */
interface CreateRecipeRequest {
  name: string;
  description?: string;
  instructions?: string[];
  ingredients?: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  cuisine?: string;
  tags?: string[];
  imageUrl?: string;
  isPublic?: boolean;
}

interface UpdateRecipeRequest {
  name?: string;
  description?: string;
  instructions?: string[];
  ingredients?: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string;
  cuisine?: string;
  tags?: string[];
  imageUrl?: string;
  isPublic?: boolean;
}

interface AddIngredientRequest {
  ingredientId: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface UpdateIngredientRequest {
  quantity?: number;
  unit?: string;
  notes?: string;
}

/**
 * Recipe management handlers
 * Provides mock responses for recipe management endpoints
 */
export const recipeHandlers = [
  /**
   * Get all recipes endpoint
   * GET /recipes
   */
  http.get('/recipes', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const cuisine = url.searchParams.get('cuisine') || '';
    const difficulty = url.searchParams.get('difficulty') || '';
    const tags = url.searchParams.get('tags') || '';

    // Mock filtering and pagination
    let filteredRecipes = mockRecipeData.getRecipes.data;

    if (search) {
      filteredRecipes = filteredRecipes.filter(
        recipe =>
          recipe.name.toLowerCase().includes(search.toLowerCase()) ||
          recipe.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (cuisine) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === cuisine);
    }

    if (difficulty) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === difficulty);
    }

    if (tags) {
      const tagArray = tags.split(',');
      filteredRecipes = filteredRecipes.filter(recipe =>
        tagArray.some(tag => recipe.tags.includes(tag)),
      );
    }

    const total = filteredRecipes.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

    return HttpResponse.json(
      {
        data: paginatedRecipes,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      { status: 200 },
    );
  }),

  /**
   * Get recipe by ID endpoint
   * GET /recipes/:id
   */
  http.get('/recipes/:id', ({ params }) => {
    const { id } = params;
    const recipe = mockRecipeData.getRecipeById(id as string);

    if (!recipe) {
      return HttpResponse.json(mockRecipeData.updateRecipeFailure, { status: 404 });
    }

    return HttpResponse.json(recipe, { status: 200 });
  }),

  /**
   * Create recipe endpoint
   * POST /recipes
   */
  http.post('/recipes', async ({ request }) => {
    try {
      const body = (await request.json()) as CreateRecipeRequest;
      const { name } = body;

      // Validate required fields
      if (!name) {
        return HttpResponse.json(
          {
            error: 'Missing required fields',
            message: 'Name is required',
          },
          { status: 400 },
        );
      }

      // Validate difficulty if provided
      if (body.difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(body.difficulty)) {
        return HttpResponse.json(
          {
            error: 'Invalid difficulty',
            message: 'Difficulty must be EASY, MEDIUM, or HARD',
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(mockRecipeData.createRecipeSuccess, { status: 201 });
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Update recipe endpoint
   * PUT /recipes/:id
   */
  http.put('/recipes/:id', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateRecipeRequest;
      const recipe = mockRecipeData.getRecipeById(id as string);

      if (!recipe) {
        return HttpResponse.json(mockRecipeData.updateRecipeFailure, { status: 404 });
      }

      // Validate difficulty if provided
      if (body.difficulty && !['EASY', 'MEDIUM', 'HARD'].includes(body.difficulty)) {
        return HttpResponse.json(
          {
            error: 'Invalid difficulty',
            message: 'Difficulty must be EASY, MEDIUM, or HARD',
          },
          { status: 400 },
        );
      }

      const updatedRecipe = { ...recipe, ...body, updatedAt: new Date().toISOString() };

      return HttpResponse.json(
        {
          ...mockRecipeData.updateRecipeSuccess,
          recipe: updatedRecipe,
        },
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Delete recipe endpoint
   * DELETE /recipes/:id
   */
  http.delete('/recipes/:id', ({ params }) => {
    const { id } = params;
    const recipe = mockRecipeData.getRecipeById(id as string);

    if (!recipe) {
      return HttpResponse.json(mockRecipeData.deleteRecipeFailure, { status: 404 });
    }

    return HttpResponse.json(mockRecipeData.deleteRecipeSuccess, { status: 200 });
  }),

  /**
   * Add ingredient to recipe endpoint
   * POST /recipes/:id/ingredients
   */
  http.post('/recipes/:id/ingredients', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as AddIngredientRequest;
      const recipe = mockRecipeData.getRecipeById(id as string);

      if (!recipe) {
        return HttpResponse.json(mockRecipeData.addIngredientFailure, { status: 404 });
      }

      // Validate required fields
      if (!body.ingredientId || !body.quantity || !body.unit) {
        return HttpResponse.json(
          {
            error: 'Missing required fields',
            message: 'Ingredient ID, quantity, and unit are required',
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(mockRecipeData.addIngredientSuccess, { status: 201 });
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Update recipe ingredient endpoint
   * PUT /recipes/:id/ingredients/:ingredientId
   */
  http.put('/recipes/:id/ingredients/:ingredientId', async ({ params, request }) => {
    try {
      const { id, ingredientId } = params;
      const body = (await request.json()) as UpdateIngredientRequest;
      const recipe = mockRecipeData.getRecipeById(id as string);

      if (!recipe) {
        return HttpResponse.json(mockRecipeData.updateIngredientFailure, { status: 404 });
      }

      const ingredient = recipe.ingredients.find(i => i.ingredientId === ingredientId);
      if (!ingredient) {
        return HttpResponse.json(mockRecipeData.updateIngredientFailure, { status: 404 });
      }

      const updatedIngredient = { ...ingredient, ...body };

      return HttpResponse.json(
        {
          ...mockRecipeData.updateIngredientSuccess,
          ingredient: updatedIngredient,
        },
        { status: 200 },
      );
    } catch {
      return HttpResponse.json(
        {
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
        },
        { status: 400 },
      );
    }
  }),

  /**
   * Remove ingredient from recipe endpoint
   * DELETE /recipes/:id/ingredients/:ingredientId
   */
  http.delete('/recipes/:id/ingredients/:ingredientId', ({ params }) => {
    const { id, ingredientId } = params;
    const recipe = mockRecipeData.getRecipeById(id as string);

    if (!recipe) {
      return HttpResponse.json(mockRecipeData.removeIngredientFailure, { status: 404 });
    }

    const ingredient = recipe.ingredients.find(i => i.ingredientId === ingredientId);
    if (!ingredient) {
      return HttpResponse.json(mockRecipeData.removeIngredientFailure, { status: 404 });
    }

    return HttpResponse.json(mockRecipeData.removeIngredientSuccess, { status: 200 });
  }),
];
