/**
 * Item management handlers for MSW
 * Mocks item management endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockItemData } from '../data/item.data';

/**
 * Request body interfaces for type safety
 */
interface CreateItemRequest {
  name: string;
  description?: string;
  categoryId?: string;
  type?: string;
  status?: string;
  priority?: string;
  sku?: string;
  barcode?: string;
}

interface UpdateItemRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  type?: string;
  status?: string;
  priority?: string;
  sku?: string;
  barcode?: string;
}

/**
 * Item management handlers
 * Provides mock responses for item management endpoints
 */
export const itemHandlers = [
  /**
   * Get all items endpoint
   * GET /items
   */
  http.get('/items', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const status = url.searchParams.get('status') || '';

    // Mock filtering and pagination
    let filteredItems = mockItemData.getItems.data;

    if (search) {
      filteredItems = filteredItems.filter(
        item =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (type) {
      filteredItems = filteredItems.filter(item => item.type === type);
    }

    if (status) {
      filteredItems = filteredItems.filter(item => item.status === status);
    }

    const total = filteredItems.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return HttpResponse.json(
      {
        data: paginatedItems,
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
   * Get item by ID endpoint
   * GET /items/:id
   */
  http.get('/items/:id', ({ params }) => {
    const { id } = params;
    const item = mockItemData.getItemById(id as string);

    if (!item) {
      return HttpResponse.json(mockItemData.updateItemFailure, { status: 404 });
    }

    return HttpResponse.json(item, { status: 200 });
  }),

  /**
   * Create item endpoint
   * POST /items
   */
  http.post('/items', async ({ request }) => {
    try {
      const body = (await request.json()) as CreateItemRequest;
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

      return HttpResponse.json(mockItemData.createItemSuccess, { status: 201 });
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
   * Update item endpoint
   * PUT /items/:id
   */
  http.put('/items/:id', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateItemRequest;
      const item = mockItemData.getItemById(id as string);

      if (!item) {
        return HttpResponse.json(mockItemData.updateItemFailure, { status: 404 });
      }

      const updatedItem = { ...item, ...body, updatedAt: new Date().toISOString() };

      return HttpResponse.json(
        {
          ...mockItemData.updateItemSuccess,
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
   * Delete item endpoint
   * DELETE /items/:id
   */
  http.delete('/items/:id', ({ params }) => {
    const { id } = params;
    const item = mockItemData.getItemById(id as string);

    if (!item) {
      return HttpResponse.json(mockItemData.deleteItemFailure, { status: 404 });
    }

    return HttpResponse.json(mockItemData.deleteItemSuccess, { status: 200 });
  }),
];
