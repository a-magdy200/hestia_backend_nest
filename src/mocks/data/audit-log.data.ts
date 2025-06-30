/**
 * Audit Log mock data for MSW
 * Provides realistic audit log data for development and testing
 */

import {
  AuditAction,
  AuditResourceType,
  AuditSeverity,
  AuditStatus,
  AuditSource,
  AuditOutcome,
} from '@/interfaces/enums/audit.enum';

/**
 * Mock audit log data
 */
export const mockAuditLogData = {
  userLogin: {
    id: 'audit-001',
    userId: 'user-001',
    action: AuditAction.LOGIN,
    resourceType: AuditResourceType.USER,
    resourceId: 'user-001',
    severity: AuditSeverity.LOW,
    status: AuditStatus.PROCESSED,
    source: AuditSource.WEB_UI,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'session-123456',
      loginMethod: 'email_password',
    },
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  },

  userLogout: {
    id: 'audit-002',
    userId: 'user-001',
    action: AuditAction.LOGOUT,
    resourceType: AuditResourceType.USER,
    resourceId: 'user-001',
    severity: AuditSeverity.LOW,
    status: AuditStatus.PROCESSED,
    source: AuditSource.WEB_UI,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      ipAddress: '192.168.1.100',
      sessionId: 'session-123456',
      logoutReason: 'user_initiated',
    },
    createdAt: new Date('2024-01-15T12:45:00Z'),
    updatedAt: new Date('2024-01-15T12:45:00Z'),
  },

  recipeCreated: {
    id: 'audit-003',
    userId: 'user-002',
    action: AuditAction.CREATE,
    resourceType: AuditResourceType.RECIPE,
    resourceId: 'recipe-001',
    severity: AuditSeverity.LOW,
    status: AuditStatus.PROCESSED,
    source: AuditSource.API,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      recipeTitle: 'Chicken Pasta',
      recipeCategory: 'Main Course',
      ingredientsCount: 8,
      preparationTime: 30,
    },
    createdAt: new Date('2024-01-15T14:20:00Z'),
    updatedAt: new Date('2024-01-15T14:20:00Z'),
  },

  recipeUpdated: {
    id: 'audit-004',
    userId: 'user-002',
    action: AuditAction.UPDATE,
    resourceType: AuditResourceType.RECIPE,
    resourceId: 'recipe-001',
    severity: AuditSeverity.LOW,
    status: AuditStatus.PROCESSED,
    source: AuditSource.API,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      recipeTitle: 'Chicken Pasta',
      changes: ['ingredients', 'cooking_time'],
      previousVersion: 1,
      newVersion: 2,
    },
    createdAt: new Date('2024-01-15T16:10:00Z'),
    updatedAt: new Date('2024-01-15T16:10:00Z'),
  },

  failedLogin: {
    id: 'audit-005',
    userId: 'unknown',
    action: AuditAction.LOGIN_FAILED,
    resourceType: AuditResourceType.USER,
    resourceId: 'unknown',
    severity: AuditSeverity.MEDIUM,
    status: AuditStatus.FAILED,
    source: AuditSource.WEB_UI,
    outcome: AuditOutcome.FAILURE,
    metadata: {
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      attemptedEmail: 'invalid@example.com',
      failureReason: 'invalid_credentials',
      failedAttempts: 3,
    },
    createdAt: new Date('2024-01-15T18:30:00Z'),
    updatedAt: new Date('2024-01-15T18:30:00Z'),
  },

  userDeleted: {
    id: 'audit-006',
    userId: 'admin-001',
    action: AuditAction.DELETE,
    resourceType: AuditResourceType.USER,
    resourceId: 'user-003',
    severity: AuditSeverity.HIGH,
    status: AuditStatus.PROCESSED,
    source: AuditSource.API,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      deletedUserEmail: 'deleted@example.com',
      deletionReason: 'account_termination',
      dataRetention: '30_days',
      backupCreated: true,
    },
    createdAt: new Date('2024-01-15T20:15:00Z'),
    updatedAt: new Date('2024-01-15T20:15:00Z'),
  },

  systemMaintenance: {
    id: 'audit-007',
    userId: 'system-001',
    action: AuditAction.SYSTEM_MAINTENANCE,
    resourceType: AuditResourceType.SYSTEM,
    resourceId: 'system-maintenance-001',
    severity: AuditSeverity.MEDIUM,
    status: AuditStatus.PROCESSED,
    source: AuditSource.SYSTEM,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      maintenanceType: 'database_backup',
      duration: '15_minutes',
      affectedServices: ['database', 'cache'],
      backupSize: '2.5GB',
    },
    createdAt: new Date('2024-01-16T02:00:00Z'),
    updatedAt: new Date('2024-01-16T02:15:00Z'),
  },

  securityAlert: {
    id: 'audit-008',
    userId: 'system-001',
    action: AuditAction.SECURITY_ALERT,
    resourceType: AuditResourceType.SECURITY,
    resourceId: 'security-alert-001',
    severity: AuditSeverity.CRITICAL,
    status: AuditStatus.PENDING,
    source: AuditSource.SYSTEM,
    outcome: AuditOutcome.PARTIAL,
    metadata: {
      alertType: 'suspicious_activity',
      ipAddress: '203.0.113.1',
      threatLevel: 'high',
      affectedUsers: ['user-004', 'user-005'],
      recommendedAction: 'block_ip',
    },
    createdAt: new Date('2024-01-16T04:30:00Z'),
    updatedAt: new Date('2024-01-16T04:30:00Z'),
  },

  apiKeyCreated: {
    id: 'audit-009',
    userId: 'user-001',
    action: AuditAction.API_KEY_CREATE,
    resourceType: AuditResourceType.API_KEY,
    resourceId: 'api-key-001',
    severity: AuditSeverity.LOW,
    status: AuditStatus.PROCESSED,
    source: AuditSource.API,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      keyType: 'private',
      permissions: ['read:users', 'write:users'],
      expiresAt: '2024-02-15T10:30:00Z',
      description: 'Personal API key',
    },
    createdAt: new Date('2024-01-16T10:00:00Z'),
    updatedAt: new Date('2024-01-16T10:00:00Z'),
  },

  dataExport: {
    id: 'audit-010',
    userId: 'user-002',
    action: AuditAction.EXPORT_DATA,
    resourceType: AuditResourceType.REPORT,
    resourceId: 'export-001',
    severity: AuditSeverity.LOW,
    status: AuditStatus.PROCESSED,
    source: AuditSource.WEB_UI,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      exportType: 'user_data',
      format: 'json',
      recordCount: 150,
      fileSize: '2.1MB',
      downloadUrl: '/exports/user-data-001.json',
    },
    createdAt: new Date('2024-01-16T14:45:00Z'),
    updatedAt: new Date('2024-01-16T14:45:00Z'),
  },
};

/**
 * Mock audit log list for pagination
 */
export const mockAuditLogList = [
  mockAuditLogData.userLogin,
  mockAuditLogData.userLogout,
  mockAuditLogData.recipeCreated,
  mockAuditLogData.recipeUpdated,
  mockAuditLogData.failedLogin,
  mockAuditLogData.userDeleted,
  mockAuditLogData.systemMaintenance,
  mockAuditLogData.securityAlert,
  mockAuditLogData.apiKeyCreated,
  mockAuditLogData.dataExport,
];

/**
 * Mock audit log creation request
 */
export const mockAuditLogCreateRequest = {
  userId: 'user-001',
  action: AuditAction.READ,
  resourceType: AuditResourceType.RECIPE,
  resourceId: 'recipe-001',
  severity: AuditSeverity.LOW,
  source: AuditSource.WEB_UI,
  metadata: {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
};

/**
 * Mock audit log filter request
 */
export const mockAuditLogFilterRequest = {
  userId: 'user-001',
  action: AuditAction.LOGIN,
  resourceType: AuditResourceType.USER,
  severity: AuditSeverity.LOW,
  startDate: new Date('2024-01-01T00:00:00Z'),
  endDate: new Date('2024-01-31T23:59:59Z'),
  page: 1,
  limit: 10,
};

/**
 * Mock audit log statistics
 */
export const mockAuditLogStats = {
  totalLogs: 10,
  logsByAction: {
    [AuditAction.LOGIN]: 1,
    [AuditAction.LOGOUT]: 1,
    [AuditAction.CREATE]: 1,
    [AuditAction.UPDATE]: 1,
    [AuditAction.DELETE]: 1,
    [AuditAction.LOGIN_FAILED]: 1,
    [AuditAction.SYSTEM_MAINTENANCE]: 1,
    [AuditAction.SECURITY_ALERT]: 1,
    [AuditAction.API_KEY_CREATE]: 1,
    [AuditAction.EXPORT_DATA]: 1,
  },
  logsBySeverity: {
    [AuditSeverity.LOW]: 6,
    [AuditSeverity.MEDIUM]: 2,
    [AuditSeverity.HIGH]: 1,
    [AuditSeverity.CRITICAL]: 1,
  },
  logsByOutcome: {
    [AuditOutcome.SUCCESS]: 8,
    [AuditOutcome.FAILURE]: 1,
    [AuditOutcome.PARTIAL]: 1,
  },
  logsBySource: {
    [AuditSource.WEB_UI]: 4,
    [AuditSource.API]: 4,
    [AuditSource.SYSTEM]: 2,
  },
  averageLogsPerDay: 10,
  mostActiveUser: 'user-001',
  mostCommonAction: AuditAction.LOGIN,
  mostCommonResourceType: AuditResourceType.USER,
};
