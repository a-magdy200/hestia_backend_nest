/**
 * MSW (Mock Service Worker) setup for development
 * Provides comprehensive API mocking capabilities for frontend development
 * Follows strict technical guidelines and quality standards
 */

import { setupWorker } from 'msw/browser';
import { setupServer } from 'msw/node';

import { apiKeyHandlers } from './handlers/api-key.handlers';
import { auditLogHandlers } from './handlers/audit-log.handlers';
import { authHandlers } from './handlers/auth.handlers';
import { healthHandlers } from './handlers/health.handlers';
import { ingredientHandlers } from './handlers/ingredient.handlers';
import { itemHandlers } from './handlers/item.handlers';
import { notificationHandlers } from './handlers/notification.handlers';
import { profileHandlers } from './handlers/profile.handlers';
import { recipeHandlers } from './handlers/recipe.handlers';
import { shoppingListHandlers } from './handlers/shopping-list.handlers';
import { tenantHandlers } from './handlers/tenant.handlers';
import { userHandlers } from './handlers/user.handlers';

/**
 * Combined handlers for all Phase 1 features
 * Organized by domain for maintainability and clarity
 */
const handlers = [
  // Core system handlers
  ...healthHandlers,

  // Authentication and authorization
  ...authHandlers,
  ...apiKeyHandlers,

  // User management
  ...userHandlers,
  ...profileHandlers,

  // Multi-tenancy
  ...tenantHandlers,

  // Culinary domain
  ...recipeHandlers,
  ...ingredientHandlers,

  // Personal domain
  ...itemHandlers,
  ...shoppingListHandlers,

  // Communication and notifications
  ...notificationHandlers,

  // Audit and compliance
  ...auditLogHandlers,
];

/**
 * Browser worker setup for frontend development
 * Handles API mocking in browser environment
 */
export const worker = setupWorker(...handlers);

/**
 * Node.js server setup for testing
 * Handles API mocking in Node.js environment (Jest, etc.)
 */
export const server = setupServer(...handlers);

/**
 * Start MSW in development mode
 * Initializes the mock service worker for API mocking
 * @returns Promise that resolves when MSW is started
 */
export const startMSW = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      // Browser environment
      await worker.start({
        onUnhandledRequest: 'bypass', // Allow unhandled requests to pass through
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
    } else {
      // Node.js environment (testing)
      server.listen({
        onUnhandledRequest: 'bypass',
      });
    }
  } catch (error) {
    throw new Error(
      `MSW initialization failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Stop MSW and cleanup resources
 * @returns Promise that resolves when MSW is stopped
 */
export const stopMSW = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      // Browser environment
      await worker.stop();
    } else {
      // Node.js environment (testing)
      server.close();
    }
  } catch (error) {
    throw new Error(
      `MSW cleanup failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

/**
 * Reset MSW handlers to initial state
 * Useful for testing scenarios
 */
export const resetMSW = (): void => {
  if (typeof window !== 'undefined') {
    // Browser environment
    worker.resetHandlers();
  } else {
    // Node.js environment (testing)
    server.resetHandlers();
  }
};

/**
 * MSW configuration for different environments
 */
export const mswConfig = {
  development: {
    enabled: true,
    onUnhandledRequest: 'bypass' as const,
    quiet: false,
  },
  test: {
    enabled: true,
    onUnhandledRequest: 'error' as const,
    quiet: true,
  },
  production: {
    enabled: false,
    onUnhandledRequest: 'bypass' as const,
    quiet: true,
  },
};

export default {
  worker,
  server,
  startMSW,
  stopMSW,
  resetMSW,
  mswConfig,
};
