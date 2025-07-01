/**
 * Ingredient management handlers for MSW
 * Mocks ingredient management endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockIngredientData } from '../data/ingredient.data';

/**
 * Request body interfaces for type safety
 */
interface CreateIngredientRequest {
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  nutritionalInfo?: Record<string, number>;
  allergens?: string[];
  dietaryTypes?: string[];
  substitutions?: {
    ingredient: string;
    ratio: number;
    notes: string;
  }[];
}

interface UpdateIngredientRequest {
  name?: string;
  description?: string;
  category?: string;
  unit?: string;
  nutritionalInfo?: Record<string, number>;
  allergens?: string[];
  dietaryTypes?: string[];
  substitutions?: {
    ingredient: string;
    ratio: number;
    notes: string;
  }[];
}

/**
 * Ingredient management handlers
 * Provides mock responses for ingredient management endpoints
 */
export const ingredientHandlers = [
  /**
   * Get all ingredients endpoint
   * GET /ingredients
   */
  http.get('/ingredients', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const allergens = url.searchParams.get('allergens') || '';

    // Mock filtering and pagination
    let filteredIngredients = mockIngredientData.getIngredients.data;

    if (search) {
      filteredIngredients = filteredIngredients.filter(
        ingredient =>
          ingredient.name.toLowerCase().includes(search.toLowerCase()) ||
          ingredient.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category) {
      filteredIngredients = filteredIngredients.filter(
        ingredient => ingredient.category === category,
      );
    }

    if (allergens) {
      const allergenArray = allergens.split(',');
      filteredIngredients = filteredIngredients.filter(ingredient =>
        allergenArray.some(allergen => ingredient.allergens.includes(allergen)),
      );
    }

    const total = filteredIngredients.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIngredients = filteredIngredients.slice(startIndex, endIndex);

    return HttpResponse.json(
      {
        data: paginatedIngredients,
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
   * Get ingredient by ID endpoint
   * GET /ingredients/:id
   */
  http.get('/ingredients/:id', ({ params }) => {
    const { id } = params;
    const ingredient = mockIngredientData.getIngredientById(id as string);

    if (!ingredient) {
      return HttpResponse.json(mockIngredientData.updateIngredientFailure, { status: 404 });
    }

    return HttpResponse.json(ingredient, { status: 200 });
  }),

  /**
   * Create ingredient endpoint
   * POST /ingredients
   */
  http.post('/ingredients', async ({ request }) => {
    try {
      const body = (await request.json()) as CreateIngredientRequest;
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

      return HttpResponse.json(mockIngredientData.createIngredientSuccess, { status: 201 });
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
   * Update ingredient endpoint
   * PUT /ingredients/:id
   */
  http.put('/ingredients/:id', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateIngredientRequest;
      const ingredient = mockIngredientData.getIngredientById(id as string);

      if (!ingredient) {
        return HttpResponse.json(mockIngredientData.updateIngredientFailure, { status: 404 });
      }

      const updatedIngredient = { ...ingredient, ...body, updatedAt: new Date().toISOString() };

      return HttpResponse.json(
        {
          ...mockIngredientData.updateIngredientSuccess,
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
   * Delete ingredient endpoint
   * DELETE /ingredients/:id
   */
  http.delete('/ingredients/:id', ({ params }) => {
    const { id } = params;
    const ingredient = mockIngredientData.getIngredientById(id as string);

    if (!ingredient) {
      return HttpResponse.json(mockIngredientData.deleteIngredientFailure, { status: 404 });
    }

    return HttpResponse.json(mockIngredientData.deleteIngredientSuccess, { status: 200 });
  }),

  /**
   * Get ingredient categories endpoint
   * GET /ingredients/categories
   */
  http.get('/ingredients/categories', () => {
    return HttpResponse.json(mockIngredientData.getIngredientCategories(), { status: 200 });
  }),

  /**
   * Get ingredient allergens endpoint
   * GET /ingredients/allergens
   */
  http.get('/ingredients/allergens', () => {
    return HttpResponse.json(mockIngredientData.getIngredientAllergens(), { status: 200 });
  }),

  /**
   * Get ingredient dietary types endpoint
   * GET /ingredients/dietary-types
   */
  http.get('/ingredients/dietary-types', () => {
    return HttpResponse.json(mockIngredientData.getIngredientDietaryTypes(), { status: 200 });
  }),
];
