/**
 * Mock authentication data for MSW
 * Provides realistic authentication responses for development and testing
 */

import { faker } from '@faker-js/faker';

/**
 * Mock user credentials for testing
 */
export const mockCredentials = {
  valid: {
    email: 'test@example.com',
    password: 'ValidPassword123!',
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'WrongPassword123!',
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
  },
};

/**
 * Mock authentication tokens
 */
export const mockTokens = {
  accessToken: faker.string.alphanumeric(64),
  refreshToken: faker.string.alphanumeric(64),
  expiresIn: 3600,
  tokenType: 'Bearer',
};

/**
 * Mock user data for authentication
 */
export const mockUser = {
  id: faker.string.uuid(),
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'USER',
  emailVerified: true,
  isActive: true,
  tenantId: faker.string.uuid(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
};

/**
 * Mock authentication responses
 */
export const mockAuthData = {
  loginSuccess: {
    user: mockUser,
    tokens: mockTokens,
    message: 'Login successful',
  },

  loginFailure: {
    error: 'Invalid credentials',
    message: 'Email or password is incorrect',
    code: 'INVALID_CREDENTIALS',
  },

  registerSuccess: {
    user: mockUser,
    tokens: mockTokens,
    message: 'Registration successful',
  },

  registerFailure: {
    error: 'Email already exists',
    message: 'An account with this email already exists',
    code: 'EMAIL_EXISTS',
  },

  refreshSuccess: {
    tokens: {
      ...mockTokens,
      accessToken: faker.string.alphanumeric(64),
    },
    message: 'Token refreshed successfully',
  },

  refreshFailure: {
    error: 'Invalid refresh token',
    message: 'Refresh token is invalid or expired',
    code: 'INVALID_REFRESH_TOKEN',
  },

  logoutSuccess: {
    message: 'Logout successful',
  },

  mfaSetup: {
    secret: faker.string.alphanumeric(32),
    qrCode: faker.image.dataUri(),
    backupCodes: Array.from({ length: 8 }, () => faker.string.alphanumeric(8)),
  },

  mfaVerify: {
    success: true,
    message: 'MFA verification successful',
  },

  mfaVerifyFailure: {
    success: false,
    error: 'Invalid MFA code',
    message: 'The provided MFA code is invalid',
  },

  passwordReset: {
    message: 'Password reset email sent',
  },

  passwordResetConfirm: {
    message: 'Password reset successful',
  },

  emailVerification: {
    message: 'Email verification successful',
  },

  resendVerification: {
    message: 'Verification email sent',
  },

  getCurrentUser: {
    user: mockUser,
    message: 'Current user retrieved successfully',
  },

  changePasswordSuccess: {
    message: 'Password changed successfully',
  },

  forgotPasswordSuccess: {
    message: 'Password reset email sent successfully',
  },

  resetPasswordSuccess: {
    message: 'Password reset successful',
  },

  verifyEmailSuccess: {
    message: 'Email verification successful',
  },

  resendVerificationSuccess: {
    message: 'Verification email sent successfully',
  },

  revokeAllTokensSuccess: {
    message: 'All tokens revoked successfully',
  },
};
