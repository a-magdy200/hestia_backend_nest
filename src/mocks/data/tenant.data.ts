/**
 * Mock tenant data for MSW
 * Provides realistic tenant management responses for development and testing
 */

import { faker } from '@faker-js/faker';

/**
 * Mock tenant data
 */
export const mockTenants = Array.from({ length: 5 }, (_, index) => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  subdomain: faker.internet.domainWord(),
  customDomain: index === 0 ? faker.internet.domainName() : null,
  branding: {
    logo: faker.image.url(),
    primaryColor: faker.color.rgb(),
    secondaryColor: faker.color.rgb(),
    companyName: faker.company.name(),
    tagline: faker.company.catchPhrase(),
  },
  configuration: {
    features: {
      recipes: true,
      ingredients: true,
      shoppingLists: true,
      analytics: index < 2,
      collaboration: index < 3,
    },
    settings: {
      allowPublicRecipes: true,
      requireEmailVerification: true,
      maxUsers: index === 0 ? 1000 : 100,
      maxRecipes: index === 0 ? 10000 : 1000,
    },
  },
  features: {
    recipes: true,
    ingredients: true,
    shoppingLists: true,
    analytics: index < 2,
    collaboration: index < 3,
    advancedReporting: index === 0,
    apiAccess: index === 0,
  },
  quotas: {
    users: {
      limit: index === 0 ? 1000 : 100,
      used: faker.number.int({ min: 1, max: 50 }),
    },
    recipes: {
      limit: index === 0 ? 10000 : 1000,
      used: faker.number.int({ min: 10, max: 500 }),
    },
    storage: {
      limit: index === 0 ? 100 : 10, // GB
      used: faker.number.float({ min: 0.1, max: 5, fractionDigits: 1 }),
    },
  },
  isActive: true,
  trialEndsAt: index === 0 ? null : faker.date.future().toISOString(),
  subscriptionEndsAt: index === 0 ? faker.date.future().toISOString() : null,
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

/**
 * Mock tenant settings data
 */
export const mockTenantSettings = mockTenants.map(tenant => ({
  id: faker.string.uuid(),
  tenantId: tenant.id,
  settings: {
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    security: {
      mfaRequired: true,
      sessionTimeout: 3600,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    },
    features: {
      allowPublicRecipes: true,
      requireEmailVerification: true,
      allowCollaboration: true,
    },
  },
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

/**
 * Mock tenant branding data
 */
export const mockTenantBranding = mockTenants.map(tenant => ({
  id: faker.string.uuid(),
  tenantId: tenant.id,
  logo: faker.image.url(),
  favicon: faker.image.url(),
  primaryColor: faker.color.rgb(),
  secondaryColor: faker.color.rgb(),
  accentColor: faker.color.rgb(),
  companyName: faker.company.name(),
  tagline: faker.company.catchPhrase(),
  website: faker.internet.url(),
  contactEmail: faker.internet.email(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
}));

/**
 * Mock tenant management responses
 */
export const mockTenantData = {
  getTenants: {
    data: mockTenants,
    pagination: {
      page: 1,
      limit: 10,
      total: mockTenants.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  },

  getTenantById: (id: string) => {
    const tenant = mockTenants.find(t => t.id === id);
    return tenant || null;
  },

  getTenantBySubdomain: (subdomain: string) => {
    const tenant = mockTenants.find(t => t.subdomain === subdomain);
    return tenant || null;
  },

  getTenantSettings: (tenantId: string) => {
    const settings = mockTenantSettings.find(s => s.tenantId === tenantId);
    return settings || null;
  },

  getTenantBranding: (tenantId: string) => {
    const branding = mockTenantBranding.find(b => b.tenantId === tenantId);
    return branding || null;
  },

  createTenantSuccess: {
    message: 'Tenant created successfully',
  },

  createTenantFailure: {
    error: 'Tenant creation failed',
    message: 'Failed to create tenant',
  },

  updateTenantSuccess: {
    message: 'Tenant updated successfully',
  },

  updateTenantFailure: {
    error: 'Tenant not found',
    message: 'The specified tenant does not exist',
  },

  deleteTenantSuccess: {
    message: 'Tenant deleted successfully',
  },

  deleteTenantFailure: {
    error: 'Tenant not found',
    message: 'The specified tenant does not exist',
  },

  updateSettingsSuccess: {
    message: 'Tenant settings updated successfully',
  },

  updateSettingsFailure: {
    error: 'Settings not found',
    message: 'The specified settings do not exist',
  },

  updateBrandingSuccess: {
    message: 'Tenant branding updated successfully',
  },

  updateBrandingFailure: {
    error: 'Branding not found',
    message: 'The specified branding does not exist',
  },
};
