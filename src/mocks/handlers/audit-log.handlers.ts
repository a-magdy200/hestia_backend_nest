/**
 * Audit Log handlers for MSW
 * Mocks audit log endpoints for development and testing
 */

import { http, HttpResponse } from 'msw';

import { mockAuditLogList } from '../data/audit-log.data';

/**
 * Request body interfaces for type safety
 */
interface CreateAuditLogRequest {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  severity: string;
  source: string;
  metadata?: Record<string, unknown>;
}

interface FilterAuditLogRequest {
  userId?: string;
  action?: string;
  resourceType?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Audit Log handlers
 * Provides mock responses for audit log endpoints
 */
export const auditLogHandlers = [
  /**
   * Get all audit logs endpoint
   * GET /audit-logs
   */
  http.get('/audit-logs', ({ request }) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const userId = url.searchParams.get('userId');
      const action = url.searchParams.get('action');
      const resourceType = url.searchParams.get('resourceType');
      const severity = url.searchParams.get('severity');
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      // Filter audit logs based on query parameters
      let filteredLogs = mockAuditLogList;

      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      if (action) {
        filteredLogs = filteredLogs.filter(log => log.action === action);
      }

      if (resourceType) {
        filteredLogs = filteredLogs.filter(log => log.resourceType === resourceType);
      }

      if (severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === severity);
      }

      if (startDate) {
        const start = new Date(startDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) <= end);
      }

      // Sort by creation date (newest first)
      filteredLogs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

      return HttpResponse.json(
        {
          data: paginatedLogs,
          pagination: {
            page,
            limit,
            total: filteredLogs.length,
            totalPages: Math.ceil(filteredLogs.length / limit),
            hasNext: endIndex < filteredLogs.length,
            hasPrev: page > 1,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve audit logs',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Get audit log by ID endpoint
   * GET /audit-logs/:id
   */
  http.get('/audit-logs/:id', ({ params }) => {
    try {
      const { id } = params;
      const auditLog = mockAuditLogList.find(log => log.id === id);

      if (!auditLog) {
        return HttpResponse.json(
          {
            error: 'Audit log not found',
            message: `Audit log with ID ${id} does not exist`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 },
        );
      }

      return HttpResponse.json(
        {
          data: auditLog,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve audit log',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Create audit log endpoint
   * POST /audit-logs
   */
  http.post('/audit-logs', async ({ request }) => {
    try {
      const body = (await request.json()) as CreateAuditLogRequest;
      const { userId, action, resourceType, resourceId, severity, source, metadata } = body;

      // Validate required fields
      if (!userId || !action || !resourceType || !resourceId || !severity || !source) {
        return HttpResponse.json(
          {
            error: 'Validation error',
            message: 'userId, action, resourceType, resourceId, severity, and source are required',
            timestamp: new Date().toISOString(),
          },
          { status: 400 },
        );
      }

      // Create new audit log
      const newAuditLog = {
        id: `audit-${Date.now()}`,
        userId,
        action,
        resourceType,
        resourceId,
        severity,
        status: 'processed',
        source,
        outcome: 'success',
        metadata: metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return HttpResponse.json(
        {
          data: newAuditLog,
          message: 'Audit log created successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to create audit log',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Get audit logs by user endpoint
   * GET /audit-logs/user/:userId
   */
  http.get('/audit-logs/user/:userId', ({ params, request }) => {
    try {
      const { userId } = params;
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);
      const action = url.searchParams.get('action');
      const severity = url.searchParams.get('severity');

      // Filter audit logs by user
      let userLogs = mockAuditLogList.filter(log => log.userId === userId);

      if (action) {
        userLogs = userLogs.filter(log => log.action === action);
      }

      if (severity) {
        userLogs = userLogs.filter(log => log.severity === severity);
      }

      // Sort by creation date (newest first)
      userLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = userLogs.slice(startIndex, endIndex);

      return HttpResponse.json(
        {
          data: paginatedLogs,
          pagination: {
            page,
            limit,
            total: userLogs.length,
            totalPages: Math.ceil(userLogs.length / limit),
            hasNext: endIndex < userLogs.length,
            hasPrev: page > 1,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
            userId,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve user audit logs',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Get audit logs by resource endpoint
   * GET /audit-logs/resource/:resourceType/:resourceId
   */
  http.get('/audit-logs/resource/:resourceType/:resourceId', ({ params, request }) => {
    try {
      const { resourceType, resourceId } = params;
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '10', 10);

      // Filter audit logs by resource
      const resourceLogs = mockAuditLogList.filter(
        log => log.resourceType === resourceType && log.resourceId === resourceId,
      );

      // Sort by creation date (newest first)
      resourceLogs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = resourceLogs.slice(startIndex, endIndex);

      return HttpResponse.json(
        {
          data: paginatedLogs,
          pagination: {
            page,
            limit,
            total: resourceLogs.length,
            totalPages: Math.ceil(resourceLogs.length / limit),
            hasNext: endIndex < resourceLogs.length,
            hasPrev: page > 1,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
            resourceType,
            resourceId,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve resource audit logs',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Get audit log statistics endpoint
   * GET /audit-logs/stats
   */
  http.get('/audit-logs/stats', ({ request }) => {
    try {
      const url = new URL(request.url);
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      // Filter logs by date range if provided
      let filteredLogs = mockAuditLogList;

      if (startDate) {
        const start = new Date(startDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) <= end);
      }

      // Calculate statistics
      const stats = {
        totalLogs: filteredLogs.length,
        logsByAction: {} as Record<string, number>,
        logsBySeverity: {} as Record<string, number>,
        logsByOutcome: {} as Record<string, number>,
        logsBySource: {} as Record<string, number>,
        averageLogsPerDay: Math.round(filteredLogs.length / 30), // Assuming 30 days
        mostActiveUser: 'user-001', // Mock value
        mostCommonAction: 'login', // Mock value
        mostCommonResourceType: 'user', // Mock value
      };

      // Calculate breakdowns
      filteredLogs.forEach(log => {
        stats.logsByAction[log.action] = (stats.logsByAction[log.action] || 0) + 1;
        stats.logsBySeverity[log.severity] = (stats.logsBySeverity[log.severity] || 0) + 1;
        stats.logsByOutcome[log.outcome] = (stats.logsByOutcome[log.outcome] || 0) + 1;
        stats.logsBySource[log.source] = (stats.logsBySource[log.source] || 0) + 1;
      });

      return HttpResponse.json(
        {
          data: stats,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve audit log statistics',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Export audit logs endpoint
   * POST /audit-logs/export
   */
  http.post('/audit-logs/export', async ({ request }) => {
    try {
      const body = (await request.json()) as FilterAuditLogRequest;
      const { userId, action, resourceType, severity, startDate, endDate } = body;

      // Filter audit logs based on request
      let filteredLogs = mockAuditLogList;

      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      if (action) {
        filteredLogs = filteredLogs.filter(log => log.action === action);
      }

      if (resourceType) {
        filteredLogs = filteredLogs.filter(log => log.resourceType === resourceType);
      }

      if (severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === severity);
      }

      if (startDate) {
        const start = new Date(startDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) <= end);
      }

      // Sort by creation date (newest first)
      filteredLogs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return HttpResponse.json(
        {
          data: {
            exportId: `export-${Date.now()}`,
            recordCount: filteredLogs.length,
            format: 'json',
            downloadUrl: `/exports/audit-logs-${Date.now()}.json`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          },
          message: 'Audit logs export created successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to export audit logs',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Get audit log retention policy endpoint
   * GET /audit-logs/retention
   */
  http.get('/audit-logs/retention', () => {
    try {
      const retentionPolicy = {
        defaultRetention: 365, // days
        retentionBySeverity: {
          low: 90,
          medium: 180,
          high: 365,
          critical: 1825, // 5 years
        },
        retentionByAction: {
          login: 90,
          logout: 90,
          create: 365,
          update: 365,
          delete: 1825,
          security_alert: 1825,
        },
        autoCleanup: true,
        cleanupSchedule: 'daily',
        lastCleanup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextCleanup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      return HttpResponse.json(
        {
          data: retentionPolicy,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to retrieve retention policy',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),

  /**
   * Get audit log compliance report endpoint
   * GET /audit-logs/compliance
   */
  http.get('/audit-logs/compliance', ({ request }) => {
    try {
      const url = new URL(request.url);
      const standard = url.searchParams.get('standard') || 'gdpr';
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      // Filter logs by date range if provided
      let filteredLogs = mockAuditLogList;

      if (startDate) {
        const start = new Date(startDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) >= start);
      }

      if (endDate) {
        const end = new Date(endDate);
        filteredLogs = filteredLogs.filter(log => new Date(log.createdAt) <= end);
      }

      const complianceReport = {
        standard,
        period: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: endDate || new Date().toISOString(),
        },
        summary: {
          totalLogs: filteredLogs.length,
          compliantLogs: filteredLogs.length,
          nonCompliantLogs: 0,
          complianceRate: 100,
        },
        requirements: {
          dataAccessLogging: {
            status: 'compliant',
            count: filteredLogs.filter(
              log => log.action.includes('read') || log.action.includes('access'),
            ).length,
          },
          dataModificationLogging: {
            status: 'compliant',
            count: filteredLogs.filter(
              log =>
                log.action.includes('create') ||
                log.action.includes('update') ||
                log.action.includes('delete'),
            ).length,
          },
          securityEventLogging: {
            status: 'compliant',
            count: filteredLogs.filter(
              log => log.severity === 'high' || log.severity === 'critical',
            ).length,
          },
          userActivityLogging: {
            status: 'compliant',
            count: filteredLogs.filter(
              log => log.action.includes('login') || log.action.includes('logout'),
            ).length,
          },
        },
        recommendations: [
          'Continue monitoring audit logs for security events',
          'Regularly review retention policies',
          'Implement automated compliance reporting',
        ],
      };

      return HttpResponse.json(
        {
          data: complianceReport,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req-${Date.now()}`,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return HttpResponse.json(
        {
          error: 'Internal server error',
          message: 'Failed to generate compliance report',
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  }),
];
