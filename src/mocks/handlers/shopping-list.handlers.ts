/**
 * Shopping list management handlers for MSW
 * Mocks shopping list management endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockShoppingListData } from '../data/shopping-list.data';

/**
 * Request body interfaces for type safety
 */
interface CreateShoppingListRequest {
  name: string;
  description?: string;
}

interface UpdateShoppingListRequest {
  name?: string;
  description?: string;
  status?: string;
}

interface AddItemRequest {
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
}

interface UpdateItemRequest {
  name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  status?: string;
}

/**
 * Shopping list management handlers
 * Provides mock responses for shopping list management endpoints
 */
export const shoppingListHandlers = [
  /**
   * Get all shopping lists endpoint
   * GET /shopping-lists
   */
  http.get('/shopping-lists', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';

    // Mock filtering and pagination
    let filteredLists = mockShoppingListData.getShoppingLists.data;

    if (search) {
      filteredLists = filteredLists.filter(
        list =>
          list.name.toLowerCase().includes(search.toLowerCase()) ||
          list.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    const total = filteredLists.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLists = filteredLists.slice(startIndex, endIndex);

    return HttpResponse.json(
      {
        data: paginatedLists,
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
   * Get shopping list by ID endpoint
   * GET /shopping-lists/:id
   */
  http.get('/shopping-lists/:id', ({ params }) => {
    const { id } = params;
    const list = mockShoppingListData.getShoppingListById(id as string);

    if (!list) {
      return HttpResponse.json(mockShoppingListData.updateShoppingListFailure, { status: 404 });
    }

    return HttpResponse.json(list, { status: 200 });
  }),

  /**
   * Create shopping list endpoint
   * POST /shopping-lists
   */
  http.post('/shopping-lists', async ({ request }) => {
    try {
      const body = (await request.json()) as CreateShoppingListRequest;
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

      return HttpResponse.json(mockShoppingListData.createShoppingListSuccess, { status: 201 });
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
   * Update shopping list endpoint
   * PUT /shopping-lists/:id
   */
  http.put('/shopping-lists/:id', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateShoppingListRequest;
      const list = mockShoppingListData.getShoppingListById(id as string);

      if (!list) {
        return HttpResponse.json(mockShoppingListData.updateShoppingListFailure, { status: 404 });
      }

      const updatedList = { ...list, ...body, updatedAt: new Date().toISOString() };

      return HttpResponse.json(
        {
          ...mockShoppingListData.updateShoppingListSuccess,
          shoppingList: updatedList,
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
   * Delete shopping list endpoint
   * DELETE /shopping-lists/:id
   */
  http.delete('/shopping-lists/:id', ({ params }) => {
    const { id } = params;
    const list = mockShoppingListData.getShoppingListById(id as string);

    if (!list) {
      return HttpResponse.json(mockShoppingListData.deleteShoppingListFailure, { status: 404 });
    }

    return HttpResponse.json(mockShoppingListData.deleteShoppingListSuccess, { status: 200 });
  }),

  /**
   * Get shopping list items endpoint
   * GET /shopping-lists/:id/items
   */
  http.get('/shopping-lists/:id/items', ({ params }) => {
    const { id } = params;
    const items = mockShoppingListData.getShoppingListItems(id as string);

    return HttpResponse.json(items, { status: 200 });
  }),

  /**
   * Add item to shopping list endpoint
   * POST /shopping-lists/:id/items
   */
  http.post('/shopping-lists/:id/items', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as AddItemRequest;
      const list = mockShoppingListData.getShoppingListById(id as string);

      if (!list) {
        return HttpResponse.json(mockShoppingListData.addItemFailure, { status: 404 });
      }

      if (!body.name || !body.quantity) {
        return HttpResponse.json(
          {
            error: 'Missing required fields',
            message: 'Name and quantity are required',
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(mockShoppingListData.addItemSuccess, { status: 201 });
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
   * Update shopping list item endpoint
   * PUT /shopping-lists/:id/items/:itemId
   */
  http.put('/shopping-lists/:id/items/:itemId', async ({ params, request }) => {
    try {
      const { id, itemId } = params;
      const body = (await request.json()) as UpdateItemRequest;
      const items = mockShoppingListData.getShoppingListItems(id as string);
      const item = items.find(i => i.id === itemId);

      if (!item) {
        return HttpResponse.json(mockShoppingListData.updateItemFailure, { status: 404 });
      }

      const updatedItem = { ...item, ...body, updatedAt: new Date().toISOString() };

      return HttpResponse.json(
        {
          ...mockShoppingListData.updateItemSuccess,
          item: updatedItem,
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
   * Delete shopping list item endpoint
   * DELETE /shopping-lists/:id/items/:itemId
   */
  http.delete('/shopping-lists/:id/items/:itemId', ({ params }) => {
    const { id, itemId } = params;
    const items = mockShoppingListData.getShoppingListItems(id as string);
    const item = items.find(i => i.id === itemId);

    if (!item) {
      return HttpResponse.json(mockShoppingListData.deleteItemFailure, { status: 404 });
    }

    return HttpResponse.json(mockShoppingListData.deleteItemSuccess, { status: 200 });
  }),
];
