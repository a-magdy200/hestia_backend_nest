/**
 * API Key handlers for MSW
 * Mocks API key endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockApiKeyList, mockApiKeyStats } from '../data/api-key.data';

/**
 * Request body interfaces for type safety
 */
interface CreateApiKeyRequest {
  type: string;
  permissions: string[];
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

interface UpdateApiKeyRequest {
  permissions?: string[];
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

interface ValidateApiKeyRequest {
  key: string;
}

/**
 * API Key handlers
 * Provides mock responses for API key endpoints
 */
export const apiKeyHandlers = [
  /**
   * Get all API keys endpoint
   * GET /api-keys
   */
  http.get('/api-keys', ({ request }) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const type = url.searchParams.get('type');
      const status = url.searchParams.get('status');
      const ownerId = url.searchParams.get('ownerId');

      // Filter API keys based on query parameters
      let filteredKeys = mockApiKeyList;

      if (type) {
        filteredKeys = filteredKeys.filter(key => key.type === type);
      }

      if (status) {
        filteredKeys = filteredKeys.filter(key => key.status === status);
      }

      if (ownerId) {
        filteredKeys = filteredKeys.filter(key => key.ownerId === ownerId);
      }

      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedKeys = filteredKeys.slice(startIndex, endIndex);

      return HttpResponse.json(
        {
          data: paginatedKeys,
          pagination: {
            page,
            limit,
            total: filteredKeys.length,
            totalPages: Math.ceil(filteredKeys.length / limit),
            hasNext: endIndex < filteredKeys.length,
            hasPrev: page > 1,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve API keys',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Get API key by ID endpoint
   * GET /api-keys/:id
   */
  http.get('/api-keys/:id', ({ params }) => {
    try {
      const { id } = params;
      const apiKey = mockApiKeyList.find(key => key.id === id);

      if (!apiKey) {
        return HttpResponse.json(
          {
            error: 'API key not found',
            message: `API key with ID ${id} does not exist`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 },
        );
      }

      return HttpResponse.json(
        {
          data: apiKey,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve API key',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Create API key endpoint
   * POST /api-keys
   */
  http.post('/api-keys', async ({ request }) => {
    try {
      const body = (await request.json()) as CreateApiKeyRequest;
      const { type, permissions, expiresAt, metadata } = body;

      // Validate required fields
      if (!type || !permissions || permissions.length === 0) {
        return HttpResponse.json(
          {
            error: 'Validation error',
            message: 'Type and permissions are required',
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        );
      }

      // Validate permissions format
      const validPermissions = [
        'read:users',
        'write:users',
        'read:recipes',
        'write:recipes',
        'admin',
        '*',
      ];
      const invalidPermissions = permissions.filter(perm => !validPermissions.includes(perm));

      if (invalidPermissions.length > 0) {
        return HttpResponse.json(
          {
            error: 'Validation error',
            message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        );
      }

      // Create new API key
      const newApiKey = {
        id: `api-key-${Date.now()}`,
        key: `sk_${type}_${Date.now()}${Math.random().toString(36).substring(2, 15)}`,
        type,
        status: 'active',
        ownerId: 'user-001', // Mock user ID
        expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        permissions,
        metadata: metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return HttpResponse.json(
        {
          data: newApiKey,
          message: 'API key created successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to create API key',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Update API key endpoint
   * PUT /api-keys/:id
   */
  http.put('/api-keys/:id', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateApiKeyRequest;
      const { permissions, expiresAt, metadata } = body;

      const apiKey = mockApiKeyList.find(key => key.id === id);

      if (!apiKey) {
        return HttpResponse.json(
          {
            error: 'API key not found',
            message: `API key with ID ${id} does not exist`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 },
        );
      }

      // Check if API key is active
      if (apiKey.status !== 'active') {
        return HttpResponse.json(
          {
            error: 'API key not active',
            message: 'Cannot update inactive API key',
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        );
      }

      // Update API key
      const updatedApiKey = {
        ...apiKey,
        permissions: permissions || apiKey.permissions,
        expiresAt: expiresAt || apiKey.expiresAt,
        metadata: { ...apiKey.metadata, ...metadata },
        updatedAt: new Date(),
      };

      return HttpResponse.json(
        {
          data: updatedApiKey,
          message: 'API key updated successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to update API key',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Delete API key endpoint
   * DELETE /api-keys/:id
   */
  http.delete('/api-keys/:id', ({ params }) => {
    try {
      const { id } = params;
      const apiKey = mockApiKeyList.find(key => key.id === id);

      if (!apiKey) {
        return HttpResponse.json(
          {
            error: 'API key not found',
            message: `API key with ID ${id} does not exist`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 },
        );
      }

      return HttpResponse.json(
        {
          message: 'API key deleted successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to delete API key',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Revoke API key endpoint
   * POST /api-keys/:id/revoke
   */
  http.post('/api-keys/:id/revoke', ({ params }) => {
    try {
      const { id } = params;
      const apiKey = mockApiKeyList.find(key => key.id === id);

      if (!apiKey) {
        return HttpResponse.json(
          {
            error: 'API key not found',
            message: `API key with ID ${id} does not exist`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 },
        );
      }

      if (apiKey.status === 'revoked') {
        return HttpResponse.json(
          {
            error: 'API key already revoked',
            message: 'API key is already in revoked status',
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        );
      }

      const revokedApiKey = {
        ...apiKey,
        status: 'revoked',
        updatedAt: new Date(),
        metadata: {
          ...apiKey.metadata,
          revokedAt: new Date().toISOString(),
          revokedReason: 'User requested revocation',
        },
      };

      return HttpResponse.json(
        {
          data: revokedApiKey,
          message: 'API key revoked successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to revoke API key',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Validate API key endpoint
   * POST /api-keys/validate
   */
  http.post('/api-keys/validate', async ({ request }) => {
    try {
      const body = (await request.json()) as ValidateApiKeyRequest;
      const { key } = body;

      if (!key) {
        return HttpResponse.json(
          {
            error: 'Validation error',
            message: 'API key is required',
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        );
      }

      // Find API key by key value
      const apiKey = mockApiKeyList.find(k => k.key === key);

      if (!apiKey) {
        return HttpResponse.json(
          {
            error: 'Invalid API key',
            message: 'API key not found or invalid',
            timestamp: new Date().toISOString(),
          },
          { status: 401 },
        );
      }

      // Check if API key is active
      if (apiKey.status !== 'active') {
        return HttpResponse.json(
          {
            error: 'API key not active',
            message: `API key is ${apiKey.status}`,
            timestamp: new Date().toISOString(),
          },
          { status: 401 },
        );
      }

      // Check if API key is expired
      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        return HttpResponse.json(
          {
            error: 'API key expired',
            message: 'API key has expired',
            timestamp: new Date().toISOString(),
          },
          { status: 401 },
        );
      }

      return HttpResponse.json(
        {
          data: {
            isValid: true,
            key: {
              id: apiKey.id,
              type: apiKey.type,
              permissions: apiKey.permissions,
              ownerId: apiKey.ownerId,
              expiresAt: apiKey.expiresAt,
            },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to validate API key',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Get API key statistics endpoint
   * GET /api-keys/stats
   */
  http.get('/api-keys/stats', () => {
    try {
      return HttpResponse.json(
        {
          data: mockApiKeyStats,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve API key statistics',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Get API keys by owner endpoint
   * GET /api-keys/owner/:ownerId
   */
  http.get('/api-keys/owner/:ownerId', ({ params }) => {
    try {
      const { ownerId } = params;
      const ownerKeys = mockApiKeyList.filter(key => key.ownerId === ownerId);

      return HttpResponse.json(
        {
          data: ownerKeys,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
            ownerId,
            count: ownerKeys.length,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve owner API keys',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),
];
