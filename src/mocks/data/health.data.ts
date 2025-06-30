/**
 * Mock health data for MSW
 * Provides realistic health check responses for development and testing
 */

/**
 * Basic health check response
 */
export const mockHealthData = {
  basic: {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  },

  detailed: {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: 'development',
    services: {
      database: {
        status: 'connected',
        responseTime: 15,
        connections: {
          active: 5,
          idle: 10,
          total: 15,
        },
      },
      cache: {
        status: 'connected',
        responseTime: 2,
        memory: {
          used: '256MB',
          total: '1GB',
          percentage: 25,
        },
      },
      storage: {
        status: 'connected',
        responseTime: 45,
        space: {
          used: '2.5GB',
          total: '10GB',
          percentage: 25,
        },
      },
    },
    metrics: {
      requestsPerSecond: 125,
      averageResponseTime: 150,
      errorRate: 0.02,
      activeConnections: 45,
    },
  },

  readiness: {
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'ready',
      cache: 'ready',
      storage: 'ready',
      externalServices: 'ready',
    },
  },

  liveness: {
    status: 'alive',
    timestamp: new Date().toISOString(),
    memory: {
      used: '512MB',
      total: '2GB',
      percentage: 25,
    },
    cpu: {
      usage: 15,
      cores: 4,
    },
  },
};
