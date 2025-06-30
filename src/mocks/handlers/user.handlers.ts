/**
 * User management handlers for MSW
 * Mocks user management endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockUserData } from '../data/user.data';

/**
 * Request body interfaces for type safety
 */
interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  preferences?: Record<string, unknown>;
}

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  preferences?: Record<string, unknown>;
}

interface UpdatePreferencesRequest {
  language?: string;
  timezone?: string;
  notifications?: Record<string, unknown>;
  privacy?: Record<string, unknown>;
}

/**
 * User management handlers
 * Provides mock responses for user management endpoints
 */
export const userHandlers = [
  /**
   * Get all users endpoint
   * GET /users
   */
  http.get('/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';

    // Mock filtering and pagination
    let filteredUsers = mockUserData.getUsers.data;

    if (search) {
      filteredUsers = filteredUsers.filter(
        user =>
          user.firstName.toLowerCase().includes(search.toLowerCase()) ||
          user.lastName.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json(
      {
        data: paginatedUsers,
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
   * Get user by ID endpoint
   * GET /users/:id
   */
  http.get('/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUserData.getUserById(id as string);

    if (!user) {
      return HttpResponse.json(mockUserData.updateUserFailure, { status: 404 });
    }

    return HttpResponse.json(user, { status: 200 });
  }),

  /**
   * Update user endpoint
   * PUT /users/:id
   */
  http.put('/users/:id', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateUserRequest;
      const user = mockUserData.getUserById(id as string);

      if (!user) {
        return HttpResponse.json(mockUserData.updateUserFailure, { status: 404 });
      }

      // Validate email format if provided
      if (body.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
          return HttpResponse.json(
            {
              error: 'Invalid email format',
              message: 'Please provide a valid email address',
            },
            { status: 400 },
          );
        }
      }

      // Validate role if provided
      if (body.role && !['USER', 'ADMIN'].includes(body.role)) {
        return HttpResponse.json(
          {
            error: 'Invalid role',
            message: 'Role must be either USER or ADMIN',
          },
          { status: 400 },
        );
      }

      const updatedUser = { ...user, ...body, updatedAt: new Date().toISOString() };

      return HttpResponse.json(
        {
          ...mockUserData.updateUserSuccess,
          user: updatedUser,
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
   * Delete user endpoint
   * DELETE /users/:id
   */
  http.delete('/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUserData.getUserById(id as string);

    if (!user) {
      return HttpResponse.json(mockUserData.deleteUserFailure, { status: 404 });
    }

    return HttpResponse.json(mockUserData.deleteUserSuccess, { status: 200 });
  }),

  /**
   * Get user profile endpoint
   * GET /users/:id/profile
   */
  http.get('/users/:id/profile', ({ params }) => {
    const { id } = params;
    const profile = mockUserData.getUserProfile(id as string);

    if (!profile) {
      return HttpResponse.json(mockUserData.updateProfileFailure, { status: 404 });
    }

    return HttpResponse.json(profile, { status: 200 });
  }),

  /**
   * Update user profile endpoint
   * PUT /users/:id/profile
   */
  http.put('/users/:id/profile', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdateProfileRequest;
      const profile = mockUserData.getUserProfile(id as string);

      if (!profile) {
        return HttpResponse.json(mockUserData.updateProfileFailure, { status: 404 });
      }

      // Validate required fields
      if (body.firstName && !body.firstName.trim()) {
        return HttpResponse.json(
          {
            error: 'Invalid first name',
            message: 'First name cannot be empty',
          },
          { status: 400 },
        );
      }

      if (body.lastName && !body.lastName.trim()) {
        return HttpResponse.json(
          {
            error: 'Invalid last name',
            message: 'Last name cannot be empty',
          },
          { status: 400 },
        );
      }

      const updatedProfile = { ...profile, ...body, updatedAt: new Date().toISOString() };

      return HttpResponse.json(
        {
          ...mockUserData.updateProfileSuccess,
          profile: updatedProfile,
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
   * Update user preferences endpoint
   * PUT /users/:id/preferences
   */
  http.put('/users/:id/preferences', async ({ params, request }) => {
    try {
      const { id } = params;
      const body = (await request.json()) as UpdatePreferencesRequest;
      const profile = mockUserData.getUserProfile(id as string);

      if (!profile) {
        return HttpResponse.json(mockUserData.updateProfileFailure, { status: 404 });
      }

      const updatedPreferences = { ...profile.preferences, ...body };

      return HttpResponse.json(
        {
          ...mockUserData.updateProfileSuccess,
          preferences: updatedPreferences,
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
   * Upload user avatar endpoint
   * POST /users/:id/avatar
   */
  http.post('/users/:id/avatar', ({ params }) => {
    const { id } = params;
    const profile = mockUserData.getUserProfile(id as string);

    if (!profile) {
      return HttpResponse.json(mockUserData.updateProfileFailure, { status: 404 });
    }

    return HttpResponse.json(mockUserData.uploadAvatarSuccess, { status: 200 });
  }),

  /**
   * Get user sessions endpoint
   * GET /users/:id/sessions
   */
  http.get('/users/:id/sessions', ({ params }) => {
    const { id } = params;
    const sessions = mockUserData.getUserSessions(id as string);

    return HttpResponse.json(sessions, { status: 200 });
  }),

  /**
   * Revoke user session endpoint
   * DELETE /users/:id/sessions/:sessionId
   */
  http.delete('/users/:id/sessions/:sessionId', ({ params }) => {
    const { id, sessionId } = params;
    const sessions = mockUserData.getUserSessions(id as string);
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
      return HttpResponse.json(
        {
          error: 'Session not found',
          message: 'The specified session does not exist',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(
      {
        message: 'Session revoked successfully',
      },
      { status: 200 },
    );
  }),
];
