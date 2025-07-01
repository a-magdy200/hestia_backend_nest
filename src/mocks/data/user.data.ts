/**
 * Mock user data for MSW
 * Provides realistic user management responses for development and testing
 */

import { faker } from '@faker-js/faker';

/**
 * Mock user data
 */
export const mockUsers = Array.from({ length: 10 }, (_, index) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role: index === 0 ? 'ADMIN' : 'USER',
  emailVerified: faker.datatype.boolean(),
  isActive: faker.datatype.boolean(),
  tenantId: faker.string.uuid(),
  lastLoginAt: faker.date.recent().toISOString(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

/**
 * Mock user profile data
 */
export const mockUserProfiles = mockUsers.map(user => ({
  id: faker.string.uuid(),
  userId: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  bio: faker.lorem.paragraph(),
  avatarUrl: faker.image.avatar(),
  preferences: {
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: 'public',
      recipeVisibility: 'public',
    },
  },
  dietaryRestrictions: [
    {
      type: 'allergy',
      name: 'Peanuts',
      severity: 'high',
    },
  ],
  skillLevel: {
    cooking: 'intermediate',
    baking: 'beginner',
  },
  location: faker.location.city(),
  timezone: 'UTC',
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

/**
 * Mock user sessions data
 */
export const mockUserSessions = mockUsers.map(user => ({
  id: faker.string.uuid(),
  userId: user.id,
  sessionToken: faker.string.alphanumeric(64),
  ipAddress: faker.internet.ip(),
  userAgent: faker.internet.userAgent(),
  deviceId: faker.string.uuid(),
  deviceType: faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
  expiresAt: faker.date.future().toISOString(),
  isActive: true,
  lastActivityAt: faker.date.recent().toISOString(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

/**
 * Mock user management responses
 */
export const mockUserData = {
  getUsers: {
    data: mockUsers,
    pagination: {
      page: 1,
      limit: 10,
      total: mockUsers.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  },

  getUserById: (id: string) => {
    const user = mockUsers.find(u => u.id === id);
    return user || null;
  },

  getUserProfile: (userId: string) => {
    const profile = mockUserProfiles.find(p => p.userId === userId);
    return profile || null;
  },

  getUserSessions: (userId: string) => {
    return mockUserSessions.filter(s => s.userId === userId);
  },

  updateUserSuccess: {
    message: 'User updated successfully',
  },

  updateUserFailure: {
    error: 'User not found',
    message: 'The specified user does not exist',
  },

  deleteUserSuccess: {
    message: 'User deleted successfully',
  },

  deleteUserFailure: {
    error: 'User not found',
    message: 'The specified user does not exist',
  },

  updateProfileSuccess: {
    message: 'Profile updated successfully',
  },

  updateProfileFailure: {
    error: 'Profile not found',
    message: 'The specified profile does not exist',
  },

  uploadAvatarSuccess: {
    avatarUrl: faker.image.avatar(),
    message: 'Avatar uploaded successfully',
  },

  uploadAvatarFailure: {
    error: 'Upload failed',
    message: 'Failed to upload avatar image',
  },

  getAllProfiles: {
    data: mockUserProfiles,
    pagination: {
      page: 1,
      limit: 10,
      total: mockUserProfiles.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  },

  getProfileById: (id: string) => {
    const profile = mockUserProfiles.find(p => p.id === id);
    return profile || null;
  },
};
