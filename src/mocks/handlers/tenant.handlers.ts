/**
 * Tenant management handlers for MSW
 * Mocks tenant management endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockTenantData } from '../data/tenant.data';

/**
 * Request body interfaces for type safety
 */
interface CreateTenantRequest {
  name: string;
  subdomain: string;
  customDomain?: string;
  branding?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
}

interface UpdateTenantRequest {
  name?: string;
  subdomain?: string;
  customDomain?: string;
  branding?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  isActive?: boolean;
}

interface UpdateSettingsRequest {
  notifications?: Record<string, unknown>;
  security?: Record<string, unknown>;
  features?: Record<string, unknown>;
}

interface UpdateBrandingRequest {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  companyName?: string;
  tagline?: string;
  website?: string;
  contactEmail?: string;
}

/**
 * Tenant management handlers
 * Provides mock responses for tenant management endpoints
 */
export const tenantHandlers = [
  /**
   * Get all tenants endpoint
   * GET /tenants
   */
  http.get('/tenants', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const isActive = url.searchParams.get('isActive');

    // Mock filtering and pagination
    let filteredTenants = mockTenantData.getTenants.data;

    if (search) {
      filteredTenants = filteredTenants.filter(
        tenant =>
          tenant.name.toLowerCase().includes(search.toLowerCase()) ||
          tenant.subdomain.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredTenants = filteredTenants.filter(tenant => tenant.isActive === activeFilter);
    }

    const total = filteredTenants.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTenants = filteredTenants.slice(startIndex, endIndex);

    return HttpResponse.json(
      {
        data: paginatedTenants,
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
   * Get tenant by ID endpoint
   * GET /tenants/:id
   */
  http.get('/tenants/:id', ({ params }) => {
    const { id } = params;
    const tenant = mockTenantData.getTenantById(id as string);

    if (!tenant) {
      return HttpResponse.json(mockTenantData.updateTenantFailure, { status: 404 });
    }

    return HttpResponse.json(tenant, { status: 200 });
  }),

  /**
   * Get tenant by subdomain endpoint
   * GET /tenants/subdomain/:subdomain
   */
  http.get('/tenants/subdomain/:subdomain', ({ params }) => {
    const { subdomain } = params;
    const tenant = mockTenantData.getTenantBySubdomain(subdomain as string);

    if (!tenant) {
      return HttpResponse.json(
        {
          error: 'Tenant not found',
          message: 'The specified subdomain does not exist',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(tenant, { status: 200 });
  }),

  /**
   * Create tenant endpoint
   * POST /tenants
   */
  http.post('/tenants', async ({ request }) => {
    try {
      const body = (await request.json()) as CreateTenantRequest;
      const { name, subdomain } = body;

      // Validate required fields
      if (!name || !subdomain) {
        return HttpResponse.json(
          {
            error: 'Missing required fields',
            message: 'Name and subdomain are required',
          },
          { status: 400 },
        );
      }

      // Validate subdomain format
      const subdomainRegex = /^[a-z0-9-]+$/;
      if (!subdomainRegex.test(subdomain)) {
        return HttpResponse.json(
          {
            error: 'Invalid subdomain format',
            message: 'Subdomain must contain only lowercase letters, numbers, and hyphens',
          },
          { status: 400 },
        );
      }

      // Check if subdomain already exists
      const existingTenant = mockTenantData.getTenantBySubdomain(subdomain);
      if (existingTenant) {
        return HttpResponse.json(
          {
            error: 'Subdomain already exists',
            message: 'A tenant with this subdomain already exists',
          },
          { status: 409 },
        );
      }

      return HttpResponse.json(mockTenantData.createTenantSuccess, { status: 201 });
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
   * Update tenant endpoint
   * PUT /tenants/:id
   */
  http.put('/tenants/:id', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateTenantRequest;
      const tenant = mockTenantData.getTenantById(id as string);

      if (!tenant) {
        return HttpResponse.json(mockTenantData.updateTenantFailure, { status: 404 });
      }

      // Validate subdomain format if provided
      if (body.subdomain) {
        const subdomainRegex = /^[a-z0-9-]+$/;
        if (!subdomainRegex.test(body.subdomain)) {
          return HttpResponse.json(
            {
              error: 'Invalid subdomain format',
              message: 'Subdomain must contain only lowercase letters, numbers, and hyphens',
            },
            { status: 400 },
          );
        }
      }

      const updatedTenant = { ...tenant, ...body, updatedAt: new Date().toISOString() };

      return HttpResponse.json(
        {
          ...mockTenantData.updateTenantSuccess,
          tenant: updatedTenant,
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
   * Delete tenant endpoint
   * DELETE /tenants/:id
   */
  http.delete('/tenants/:id', ({ params }) => {
    const { id } = params;
    const tenant = mockTenantData.getTenantById(id as string);

    if (!tenant) {
      return HttpResponse.json(mockTenantData.deleteTenantFailure, { status: 404 });
    }

    return HttpResponse.json(mockTenantData.deleteTenantSuccess, { status: 200 });
  }),

  /**
   * Get tenant settings endpoint
   * GET /tenants/:id/settings
   */
  http.get('/tenants/:id/settings', ({ params }) => {
    const { id } = params;
    const settings = mockTenantData.getTenantSettings(id as string);

    if (!settings) {
      return HttpResponse.json(mockTenantData.updateSettingsFailure, { status: 404 });
    }

    return HttpResponse.json(settings, { status: 200 });
  }),

  /**
   * Update tenant settings endpoint
   * PUT /tenants/:id/settings
   */
  http.put('/tenants/:id/settings', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateSettingsRequest;
      const settings = mockTenantData.getTenantSettings(id as string);

      if (!settings) {
        return HttpResponse.json(mockTenantData.updateSettingsFailure, { status: 404 });
      }

      const updatedSettings = {
        ...settings,
        settings: { ...settings.settings, ...body },
        updatedAt: new Date().toISOString(),
      };

      return HttpResponse.json(
        {
          ...mockTenantData.updateSettingsSuccess,
          settings: updatedSettings,
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
   * Get tenant branding endpoint
   * GET /tenants/:id/branding
   */
  http.get('/tenants/:id/branding', ({ params }) => {
    const { id } = params;
    const branding = mockTenantData.getTenantBranding(id as string);

    if (!branding) {
      return HttpResponse.json(mockTenantData.updateBrandingFailure, { status: 404 });
    }

    return HttpResponse.json(branding, { status: 200 });
  }),

  /**
   * Update tenant branding endpoint
   * PUT /tenants/:id/branding
   */
  http.put('/tenants/:id/branding', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateBrandingRequest;
      const branding = mockTenantData.getTenantBranding(id as string);

      if (!branding) {
        return HttpResponse.json(mockTenantData.updateBrandingFailure, { status: 404 });
      }

      const updatedBranding = { ...branding, ...body, updatedAt: new Date().toISOString() };

      return HttpResponse.json(
        {
          ...mockTenantData.updateBrandingSuccess,
          branding: updatedBranding,
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
];
