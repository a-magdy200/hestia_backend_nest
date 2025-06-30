import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create API Keys Table
 *
 * This migration creates the api_keys table to support API key management
 * for external integrations, third-party services, and secure API access.
 */
export class CreateApiKeysTable1704068700000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique API key identifier',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
            comment: 'User who owns the API key',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Tenant context for the API key',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'API key name/description',
          },
          {
            name: 'key_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Hashed API key value',
          },
          {
            name: 'key_prefix',
            type: 'varchar',
            length: '8',
            isNullable: false,
            comment: 'First 8 characters of the API key for identification',
          },
          {
            name: 'key_type',
            type: 'enum',
            enum: ['read', 'write', 'admin', 'full_access', 'limited', 'custom'],
            default: "'read'",
            isNullable: false,
            comment: 'Type of API key',
          },
          {
            name: 'permissions',
            type: 'text',
            isNullable: false,
            comment: 'Permissions granted to this API key (JSON array)',
          },
          {
            name: 'scopes',
            type: 'text',
            isNullable: false,
            comment: 'API scopes this key can access (JSON array)',
          },
          {
            name: 'rate_limit_requests',
            type: 'integer',
            default: 1000,
            isNullable: false,
            comment: 'Maximum requests per time period',
          },
          {
            name: 'rate_limit_period',
            type: 'enum',
            enum: ['minute', 'hour', 'day', 'week', 'month'],
            default: "'hour'",
            isNullable: false,
            comment: 'Rate limit time period',
          },
          {
            name: 'rate_limit_window',
            type: 'integer',
            default: 3600,
            isNullable: false,
            comment: 'Rate limit window in seconds',
          },
          {
            name: 'max_requests_per_minute',
            type: 'integer',
            default: 60,
            isNullable: false,
            comment: 'Maximum requests per minute',
          },
          {
            name: 'max_requests_per_hour',
            type: 'integer',
            default: 1000,
            isNullable: false,
            comment: 'Maximum requests per hour',
          },
          {
            name: 'max_requests_per_day',
            type: 'integer',
            default: 10000,
            isNullable: false,
            comment: 'Maximum requests per day',
          },
          {
            name: 'ip_whitelist',
            type: 'text',
            isNullable: true,
            comment: 'Allowed IP addresses (JSON array)',
          },
          {
            name: 'ip_blacklist',
            type: 'text',
            isNullable: true,
            comment: 'Blocked IP addresses (JSON array)',
          },
          {
            name: 'user_agent_whitelist',
            type: 'text',
            isNullable: true,
            comment: 'Allowed user agents (JSON array)',
          },
          {
            name: 'user_agent_blacklist',
            type: 'text',
            isNullable: true,
            comment: 'Blocked user agents (JSON array)',
          },
          {
            name: 'allowed_endpoints',
            type: 'text',
            isNullable: true,
            comment: 'Allowed API endpoints (JSON array)',
          },
          {
            name: 'blocked_endpoints',
            type: 'text',
            isNullable: true,
            comment: 'Blocked API endpoints (JSON array)',
          },
          {
            name: 'webhook_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Webhook URL for key usage notifications',
          },
          {
            name: 'webhook_secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Webhook secret for verification',
          },
          {
            name: 'last_used_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Last time the API key was used',
          },
          {
            name: 'last_used_ip',
            type: 'varchar',
            length: '45',
            isNullable: true,
            comment: 'IP address of last usage',
          },
          {
            name: 'last_used_user_agent',
            type: 'text',
            isNullable: true,
            comment: 'User agent of last usage',
          },
          {
            name: 'last_used_endpoint',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Last endpoint accessed',
          },
          {
            name: 'total_requests',
            type: 'bigint',
            default: 0,
            isNullable: false,
            comment: 'Total number of requests made with this key',
          },
          {
            name: 'successful_requests',
            type: 'bigint',
            default: 0,
            isNullable: false,
            comment: 'Number of successful requests',
          },
          {
            name: 'failed_requests',
            type: 'bigint',
            default: 0,
            isNullable: false,
            comment: 'Number of failed requests',
          },
          {
            name: 'rate_limit_hits',
            type: 'bigint',
            default: 0,
            isNullable: false,
            comment: 'Number of times rate limit was hit',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When the API key expires',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Whether the API key is active',
          },
          {
            name: 'is_revoked',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether the API key has been revoked',
          },
          {
            name: 'revoked_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When the API key was revoked',
          },
          {
            name: 'revoked_by',
            type: 'uuid',
            isNullable: true,
            comment: 'User who revoked the API key',
          },
          {
            name: 'revocation_reason',
            type: 'text',
            isNullable: true,
            comment: 'Reason for revocation',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
            comment: 'User who created the API key',
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
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Soft delete timestamp',
          },
        ],
      }),
      true,
    );

    // Unique constraint for key prefix
    await queryRunner.query(`
      ALTER TABLE api_keys 
      ADD CONSTRAINT uk_api_keys_prefix 
      UNIQUE (key_prefix)
    `);

    // Indexes
    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_key_hash',
        columnNames: ['key_hash'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_key_prefix',
        columnNames: ['key_prefix'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_key_type',
        columnNames: ['key_type'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_last_used',
        columnNames: ['last_used_at'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_expires_at',
        columnNames: ['expires_at'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_is_revoked',
        columnNames: ['is_revoked'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_created_by',
        columnNames: ['created_by'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_user_active',
        columnNames: ['user_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_tenant_active',
        columnNames: ['tenant_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_type_active',
        columnNames: ['key_type', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'api_keys',
      new TableIndex({
        name: 'idx_api_keys_active_expires',
        columnNames: ['is_active', 'expires_at'],
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        name: 'fk_api_keys_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        name: 'fk_api_keys_tenant_id',
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        name: 'fk_api_keys_created_by',
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        name: 'fk_api_keys_revoked_by',
        columnNames: ['revoked_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE api_keys IS 'API key management for external integrations and secure access';
      COMMENT ON COLUMN api_keys.id IS 'Unique API key identifier (UUID)';
      COMMENT ON COLUMN api_keys.key_hash IS 'Hashed API key value for security';
      COMMENT ON COLUMN api_keys.key_prefix IS 'First 8 characters of the API key for identification';
      COMMENT ON COLUMN api_keys.permissions IS 'Permissions granted to this API key (JSON array)';
      COMMENT ON COLUMN api_keys.scopes IS 'API scopes this key can access (JSON array)';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('api_keys', 'fk_api_keys_revoked_by');
    await queryRunner.dropForeignKey('api_keys', 'fk_api_keys_created_by');
    await queryRunner.dropForeignKey('api_keys', 'fk_api_keys_tenant_id');
    await queryRunner.dropForeignKey('api_keys', 'fk_api_keys_user_id');

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE api_keys 
      DROP CONSTRAINT uk_api_keys_prefix
    `);

    // Drop indexes
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_user_id');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_tenant_id');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_key_hash');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_key_prefix');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_key_type');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_last_used');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_expires_at');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_is_active');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_is_revoked');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_created_by');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_deleted_at');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_user_active');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_tenant_active');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_type_active');
    await queryRunner.dropIndex('api_keys', 'idx_api_keys_active_expires');

    // Drop table
    await queryRunner.dropTable('api_keys');
  }
}
