/**
 * Authentication handlers for MSW
 * Mocks authentication endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockAuthData, mockCredentials } from '../data/auth.data';

/**
 * Request body interfaces for type safety
 */
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface RefreshRequest {
  refreshToken: string;
}

interface MfaVerifyRequest {
  code: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetConfirmRequest {
  token: string;
  password: string;
}

interface EmailVerifyRequest {
  token: string;
}

interface EmailResendRequest {
  email: string;
}

/**
 * Authentication handlers
 * Provides mock responses for authentication endpoints
 */
export const authHandlers = [
  /**
   * User login endpoint
   * POST /auth/login
   */
  http.post('/auth/login', async ({ request }) => {
    try {
      const body = (await request.json()) as LoginRequest;
      const { email, password } = body;

      // Validate credentials
      if (email === mockCredentials.valid.email && password === mockCredentials.valid.password) {
        return HttpResponse.json(mockAuthData.loginSuccess, { status: 200 });
      }

      if (email === mockCredentials.admin.email && password === mockCredentials.admin.password) {
        return HttpResponse.json(
          {
            ...mockAuthData.loginSuccess,
            user: { ...mockAuthData.loginSuccess.user, role: 'ADMIN' },
          },
          { status: 200 },
        );
      }

      // Invalid credentials
      return HttpResponse.json(mockAuthData.loginFailure, { status: 401 });
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
   * User registration endpoint
   * POST /auth/register
   */
  http.post('/auth/register', async ({ request }) => {
    try {
      const body = (await request.json()) as RegisterRequest;
      const { email, password, firstName, lastName } = body;

      // Check if email already exists
      if (email === mockCredentials.valid.email) {
        return HttpResponse.json(mockAuthData.registerFailure, { status: 409 });
      }

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return HttpResponse.json(
          {
            error: 'Missing required fields',
            message: 'Email, password, firstName, and lastName are required',
          },
          { status: 400 },
        );
      }

      // Validate password strength
      if (password.length < 8) {
        return HttpResponse.json(
          {
            error: 'Weak password',
            message: 'Password must be at least 8 characters long',
          },
          { status: 400 },
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return HttpResponse.json(
          {
            error: 'Invalid email format',
            message: 'Please provide a valid email address',
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(mockAuthData.registerSuccess, { status: 201 });
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
   * Token refresh endpoint
   * POST /auth/refresh
   */
  http.post('/auth/refresh', async ({ request }) => {
    try {
      const body = (await request.json()) as RefreshRequest;
      const { refreshToken } = body;

      // Validate refresh token
      if (!refreshToken || refreshToken.length < 10) {
        return HttpResponse.json(mockAuthData.refreshFailure, { status: 401 });
      }

      return HttpResponse.json(mockAuthData.refreshSuccess, { status: 200 });
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
   * User logout endpoint
   * POST /auth/logout
   */
  http.post('/auth/logout', () => {
    return HttpResponse.json(mockAuthData.logoutSuccess, { status: 200 });
  }),

  /**
   * MFA setup endpoint
   * POST /auth/mfa/setup
   */
  http.post('/auth/mfa/setup', () => {
    return HttpResponse.json(mockAuthData.mfaSetup, { status: 200 });
  }),

  /**
   * MFA verification endpoint
   * POST /auth/mfa/verify
   */
  http.post('/auth/mfa/verify', async ({ request }) => {
    try {
      const body = (await request.json()) as MfaVerifyRequest;
      const { code } = body;

      // Validate MFA code
      if (!code || code.length !== 6) {
        return HttpResponse.json(mockAuthData.mfaVerifyFailure, { status: 400 });
      }

      // Mock validation - accept any 6-digit code
      if (/^\d{6}$/.test(code)) {
        return HttpResponse.json(mockAuthData.mfaVerify, { status: 200 });
      }

      return HttpResponse.json(mockAuthData.mfaVerifyFailure, { status: 400 });
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
   * Password reset request endpoint
   * POST /auth/password/reset
   */
  http.post('/auth/password/reset', async ({ request }) => {
    try {
      const body = (await request.json()) as PasswordResetRequest;
      const { email } = body;

      // Validate email
      if (!email) {
        return HttpResponse.json(
          {
            error: 'Email required',
            message: 'Email address is required',
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(mockAuthData.passwordReset, { status: 200 });
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
   * Password reset confirmation endpoint
   * POST /auth/password/reset/confirm
   */
  http.post('/auth/password/reset/confirm', async ({ request }) => {
    try {
      const body = (await request.json()) as PasswordResetConfirmRequest;
      const { token, password } = body;

      // Validate required fields
      if (!token || !password) {
        return HttpResponse.json(
          {
            error: 'Missing required fields',
            message: 'Token and password are required',
          },
          { status: 400 },
        );
      }

      // Validate password strength
      if (password.length < 8) {
        return HttpResponse.json(
          {
            error: 'Weak password',
            message: 'Password must be at least 8 characters long',
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(mockAuthData.passwordResetConfirm, { status: 200 });
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
   * Email verification endpoint
   * POST /auth/email/verify
   */
  http.post('/auth/email/verify', async ({ request }) => {
    try {
      const body = (await request.json()) as EmailVerifyRequest;
      const { token } = body;

      // Validate token
      if (!token) {
        return HttpResponse.json(
          {
            error: 'Token required',
            message: 'Verification token is required',
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(mockAuthData.emailVerification, { status: 200 });
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
   * Resend verification email endpoint
   * POST /auth/email/resend
   */
  http.post('/auth/email/resend', async ({ request }) => {
    try {
      const body = (await request.json()) as EmailResendRequest;
      const { email } = body;

      // Validate email
      if (!email) {
        return HttpResponse.json(
          {
            error: 'Email required',
            message: 'Email address is required',
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(mockAuthData.resendVerification, { status: 200 });
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
