/**
 * API Key mock data for MSW
 * Provides realistic API key data for development and testing
 */

import { ApiKeyType, ApiKeyStatus } from '@/interfaces/enums/api-key.enum';

/**
 * Mock API key data
 */
export const mockApiKeyData = {
  valid: {
    id: 'api-key-001',
    key: 'sk_test_51Hestia1234567890abcdefghijklmnopqrstuvwxyz',
    type: ApiKeyType.PRIVATE,
    status: ApiKeyStatus.ACTIVE,
    ownerId: 'user-001',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    permissions: ['read:users', 'write:users', 'read:recipes'],
    metadata: {
      description: 'Personal API key for development',
      lastUsed: new Date().toISOString(),
      usageCount: 150,
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T12:00:00Z'),
  },

  admin: {
    id: 'api-key-002',
    key: 'sk_admin_51Hestia1234567890abcdefghijklmnopqrstuvwxyz',
    type: ApiKeyType.ADMIN,
    status: ApiKeyStatus.ACTIVE,
    ownerId: 'user-admin-001',
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    permissions: ['*'],
    metadata: {
      description: 'Administrative API key',
      lastUsed: new Date().toISOString(),
      usageCount: 1250,
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-20T15:30:00Z'),
  },

  expired: {
    id: 'api-key-003',
    key: 'sk_expired_51Hestia1234567890abcdefghijklmnopqrstuvwxyz',
    type: ApiKeyType.PRIVATE,
    status: ApiKeyStatus.EXPIRED,
    ownerId: 'user-002',
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    permissions: ['read:users'],
    metadata: {
      description: 'Expired API key',
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      usageCount: 45,
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-10T10:00:00Z'),
  },

  revoked: {
    id: 'api-key-004',
    key: 'sk_revoked_51Hestia1234567890abcdefghijklmnopqrstuvwxyz',
    type: ApiKeyType.PRIVATE,
    status: ApiKeyStatus.REVOKED,
    ownerId: 'user-003',
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    permissions: ['read:recipes', 'write:recipes'],
    metadata: {
      description: 'Revoked API key',
      lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      usageCount: 89,
      revokedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      revokedReason: 'Security concern',
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },

  system: {
    id: 'api-key-005',
    key: 'sk_system_51Hestia1234567890abcdefghijklmnopqrstuvwxyz',
    type: ApiKeyType.SYSTEM,
    status: ApiKeyStatus.ACTIVE,
    ownerId: 'system-001',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    permissions: ['read:metrics', 'write:logs', 'read:health'],
    metadata: {
      description: 'System monitoring API key',
      lastUsed: new Date().toISOString(),
      usageCount: 5000,
      systemService: 'monitoring',
    },
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-25T08:15:00Z'),
  },
};

/**
 * Mock API key list for pagination
 */
export const mockApiKeyList = [
  mockApiKeyData.valid,
  mockApiKeyData.admin,
  mockApiKeyData.expired,
  mockApiKeyData.revoked,
  mockApiKeyData.system,
];

/**
 * Mock API key creation request
 */
export const mockApiKeyCreateRequest = {
  type: ApiKeyType.PRIVATE,
  permissions: ['read:users', 'write:users'],
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  metadata: {
    description: 'New API key for testing',
  },
};

/**
 * Mock API key update request
 */
export const mockApiKeyUpdateRequest = {
  permissions: ['read:users', 'write:users', 'read:recipes'],
  metadata: {
    description: 'Updated API key description',
  },
};

/**
 * Mock API key validation response
 */
export const mockApiKeyValidation = {
  isValid: true,
  key: mockApiKeyData.valid,
  permissions: mockApiKeyData.valid.permissions,
  ownerId: mockApiKeyData.valid.ownerId,
  type: mockApiKeyData.valid.type,
};

/**
 * Mock API key usage statistics
 */
export const mockApiKeyStats = {
  totalKeys: 5,
  activeKeys: 3,
  expiredKeys: 1,
  revokedKeys: 1,
  totalUsage: 6534,
  averageUsagePerKey: 1306.8,
  mostUsedKey: mockApiKeyData.system.id,
  leastUsedKey: mockApiKeyData.expired.id,
  usageByType: {
    [ApiKeyType.PRIVATE]: 284,
    [ApiKeyType.ADMIN]: 1250,
    [ApiKeyType.SYSTEM]: 5000,
  },
};
