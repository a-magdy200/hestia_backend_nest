import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Audit Logs Table
 *
 * This migration creates the audit_logs table to support comprehensive audit trail
 * and activity tracking for security, compliance, and debugging purposes.
 */
export class CreateAuditLogsTable1704068640000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique audit log identifier',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
            comment: 'User who performed the action',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Tenant context for the action',
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Session identifier',
          },
          {
            name: 'request_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Request identifier for tracing',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Action performed (CREATE, READ, UPDATE, DELETE, LOGIN, etc.)',
          },
          {
            name: 'resource_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Type of resource affected (user, recipe, ingredient, etc.)',
          },
          {
            name: 'resource_id',
            type: 'uuid',
            isNullable: true,
            comment: 'ID of the resource affected',
          },
          {
            name: 'resource_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Name or description of the resource',
          },
          {
            name: 'event_type',
            type: 'enum',
            enum: [
              'authentication',
              'authorization',
              'data_access',
              'data_modification',
              'system_config',
              'user_management',
              'security',
              'performance',
              'error',
              'warning',
              'info',
              'debug',
              'audit',
              'compliance',
            ],
            isNullable: false,
            comment: 'Type of audit event',
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['debug', 'info', 'warning', 'error', 'critical'],
            default: "'info'",
            isNullable: false,
            comment: 'Severity level of the event',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['success', 'failure', 'partial', 'pending', 'cancelled'],
            default: "'success'",
            isNullable: false,
            comment: 'Status of the action',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
            comment: 'Human-readable description of the action',
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional details about the action (JSON object)',
          },
          {
            name: 'old_values',
            type: 'jsonb',
            isNullable: true,
            comment: 'Previous values before the action (JSON object)',
          },
          {
            name: 'new_values',
            type: 'jsonb',
            isNullable: true,
            comment: 'New values after the action (JSON object)',
          },
          {
            name: 'changes',
            type: 'jsonb',
            isNullable: true,
            comment: 'Summary of changes made (JSON object)',
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
            comment: 'IP address of the client',
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
            comment: 'User agent string',
          },
          {
            name: 'user_agent_parsed',
            type: 'jsonb',
            isNullable: true,
            comment: 'Parsed user agent information (JSON object)',
          },
          {
            name: 'geolocation',
            type: 'jsonb',
            isNullable: true,
            comment: 'Geolocation data (JSON object)',
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'API endpoint accessed',
          },
          {
            name: 'http_method',
            type: 'varchar',
            length: '10',
            isNullable: true,
            comment: 'HTTP method used',
          },
          {
            name: 'http_status_code',
            type: 'integer',
            isNullable: true,
            comment: 'HTTP status code returned',
          },
          {
            name: 'request_headers',
            type: 'jsonb',
            isNullable: true,
            comment: 'Request headers (JSON object)',
          },
          {
            name: 'response_headers',
            type: 'jsonb',
            isNullable: true,
            comment: 'Response headers (JSON object)',
          },
          {
            name: 'request_body',
            type: 'jsonb',
            isNullable: true,
            comment: 'Request body (JSON object)',
          },
          {
            name: 'response_body',
            type: 'jsonb',
            isNullable: true,
            comment: 'Response body (JSON object)',
          },
          {
            name: 'request_size_bytes',
            type: 'integer',
            isNullable: true,
            comment: 'Size of request in bytes',
          },
          {
            name: 'response_size_bytes',
            type: 'integer',
            isNullable: true,
            comment: 'Size of response in bytes',
          },
          {
            name: 'processing_time_ms',
            type: 'integer',
            isNullable: true,
            comment: 'Time taken to process the request in milliseconds',
          },
          {
            name: 'database_queries_count',
            type: 'integer',
            isNullable: true,
            comment: 'Number of database queries executed',
          },
          {
            name: 'database_queries_time_ms',
            type: 'integer',
            isNullable: true,
            comment: 'Total time spent on database queries in milliseconds',
          },
          {
            name: 'memory_usage_mb',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Memory usage in MB',
          },
          {
            name: 'cpu_usage_percent',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: 'CPU usage percentage',
          },
          {
            name: 'error_code',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Error code if action failed',
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
            comment: 'Error message if action failed',
          },
          {
            name: 'error_stack_trace',
            type: 'text',
            isNullable: true,
            comment: 'Error stack trace if action failed',
          },
          {
            name: 'related_logs',
            type: 'text',
            isNullable: true,
            comment: 'Related log entries (JSON array)',
          },
          {
            name: 'tags',
            type: 'text',
            isNullable: true,
            comment: 'Tags for categorization (JSON array)',
          },
          {
            name: 'is_sensitive',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether this log contains sensitive information',
          },
          {
            name: 'is_encrypted',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether sensitive data is encrypted',
          },
          {
            name: 'retention_days',
            type: 'integer',
            default: 365,
            isNullable: false,
            comment: 'Number of days to retain this log',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When this log entry expires',
          },
          {
            name: 'is_archived',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether this log is archived',
          },
          {
            name: 'archived_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When this log was archived',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Record creation timestamp',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Record last update timestamp',
          },
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_action',
        columnNames: ['action'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_resource_type',
        columnNames: ['resource_type'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_resource_id',
        columnNames: ['resource_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_event_type',
        columnNames: ['event_type'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_severity',
        columnNames: ['severity'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_ip_address',
        columnNames: ['ip_address'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_http_status',
        columnNames: ['http_status_code'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_session_id',
        columnNames: ['session_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_request_id',
        columnNames: ['request_id'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_expires_at',
        columnNames: ['expires_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_is_archived',
        columnNames: ['is_archived'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_user_created',
        columnNames: ['user_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_tenant_created',
        columnNames: ['tenant_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_resource_created',
        columnNames: ['resource_type', 'resource_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_action_created',
        columnNames: ['action', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_severity_created',
        columnNames: ['severity', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_status_created',
        columnNames: ['status', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'idx_audit_logs_ip_created',
        columnNames: ['ip_address', 'created_at'],
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        name: 'fk_audit_logs_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        name: 'fk_audit_logs_tenant_id',
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail and activity tracking';
      COMMENT ON COLUMN audit_logs.id IS 'Unique audit log identifier (UUID)';
      COMMENT ON COLUMN audit_logs.action IS 'Action performed (CREATE, READ, UPDATE, DELETE, etc.)';
      COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected';
      COMMENT ON COLUMN audit_logs.severity IS 'Severity level of the event';
      COMMENT ON COLUMN audit_logs.details IS 'Additional details about the action (JSON object)';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('audit_logs', 'fk_audit_logs_tenant_id');
    await queryRunner.dropForeignKey('audit_logs', 'fk_audit_logs_user_id');

    // Drop indexes
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_user_id');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_tenant_id');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_action');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_resource_type');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_resource_id');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_event_type');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_severity');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_status');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_created_at');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_ip_address');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_http_status');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_session_id');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_request_id');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_expires_at');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_is_archived');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_user_created');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_tenant_created');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_resource_created');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_action_created');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_severity_created');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_status_created');
    await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_ip_created');

    // Drop table
    await queryRunner.dropTable('audit_logs');
  }
}
