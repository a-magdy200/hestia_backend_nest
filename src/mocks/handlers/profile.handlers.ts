/**
 * Profile management handlers for MSW
 * Mocks profile management endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockUserData } from '../data/user.data';

/**
 * Request body interfaces for type safety
 */
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  preferences?: Record<string, string | number | boolean>;
  dietaryRestrictions?: Array<{
    type: string;
    description: string;
  }>;
  skillLevel?: {
    cooking: string;
    baking: string;
    mealPlanning: string;
  };
}

interface UpdatePreferencesRequest {
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    profileVisibility: string;
    recipeVisibility: string;
    activityVisibility: string;
  };
}

/**
 * Profile management handlers
 * Provides mock responses for profile management endpoints
 */
export const profileHandlers = [
  /**
   * Get current user profile endpoint
   * GET /profile
   */
  http.get('/profile', () => {
    // Mock authenticated user profile
    const profile = mockUserData.getUserProfile('current-user-id');

    if (!profile) {
      return HttpResponse.json(
        {
          error: 'Profile not found',
          message: 'User profile does not exist',
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(profile, { status: 200 });
  }),

  /**
   * Update current user profile endpoint
   * PUT /profile
   */
  http.put('/profile', async ({ request }) => {
    try {
      const body = (await request.json()) as UpdateProfileRequest;

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

      // Mock profile update
      const updatedProfile = {
        ...mockUserData.getUserProfile('current-user-id'),
        ...body,
        updatedAt: new Date().toISOString(),
      };

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
   * Update current user preferences endpoint
   * PUT /profile/preferences
   */
  http.put('/profile/preferences', async ({ request }) => {
    try {
      const body = (await request.json()) as UpdatePreferencesRequest;

      // Mock preferences update
      const currentProfile = mockUserData.getUserProfile('current-user-id');
      const updatedPreferences = { ...currentProfile?.preferences, ...body };

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
   * Upload current user avatar endpoint
   * POST /profile/avatar
   */
  http.post('/profile/avatar', () => {
    return HttpResponse.json(mockUserData.uploadAvatarSuccess, { status: 200 });
  }),

  /**
   * Get current user sessions endpoint
   * GET /profile/sessions
   */
  http.get('/profile/sessions', () => {
    const sessions = mockUserData.getUserSessions('current-user-id');
    return HttpResponse.json(sessions, { status: 200 });
  }),

  /**
   * Revoke current user session endpoint
   * DELETE /profile/sessions/:sessionId
   */
  http.delete('/profile/sessions/:sessionId', ({ params }) => {
    const { sessionId } = params;
    const sessions = mockUserData.getUserSessions('current-user-id');
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
