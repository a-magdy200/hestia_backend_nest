import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Tenant Settings Table
 *
 * This migration creates the tenant_settings table for per-tenant configuration,
 * including settings, value, type, and audit fields.
 */
export class CreateTenantSettingsTable1704067920000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenant_settings',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique tenant setting identifier',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Tenant identifier',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Setting key',
          },
          {
            name: 'value',
            type: 'jsonb',
            isNullable: true,
            comment: 'Setting value (JSON)',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Setting type (string, number, boolean, etc.)',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Setting active status',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional setting metadata',
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
    // Unique constraint
    await queryRunner.query(`
      ALTER TABLE tenant_settings 
      ADD CONSTRAINT uk_tenant_settings_tenant_key 
      UNIQUE (tenant_id, key)
    `);
    // Indexes
    await queryRunner.createIndex(
      'tenant_settings',
      new TableIndex({
        name: 'idx_tenant_settings_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
    await queryRunner.createIndex(
      'tenant_settings',
      new TableIndex({
        name: 'idx_tenant_settings_key',
        columnNames: ['key'],
      }),
    );
    await queryRunner.createIndex(
      'tenant_settings',
      new TableIndex({
        name: 'idx_tenant_settings_is_active',
        columnNames: ['is_active'],
      }),
    );
    await queryRunner.createIndex(
      'tenant_settings',
      new TableIndex({
        name: 'idx_tenant_settings_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    // Composite
    await queryRunner.createIndex(
      'tenant_settings',
      new TableIndex({
        name: 'idx_tenant_settings_tenant_active',
        columnNames: ['tenant_id', 'is_active'],
      }),
    );
    // FK
    await queryRunner.createForeignKey(
      'tenant_settings',
      new TableForeignKey({
        name: 'fk_tenant_settings_tenant_id',
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE tenant_settings IS 'Per-tenant configuration table';
      COMMENT ON COLUMN tenant_settings.id IS 'Unique tenant setting identifier (UUID)';
      COMMENT ON COLUMN tenant_settings.key IS 'Setting key (unique per tenant)';
    `);
  }
  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('tenant_settings', 'fk_tenant_settings_tenant_id');
    await queryRunner.query(`
      ALTER TABLE tenant_settings 
      DROP CONSTRAINT uk_tenant_settings_tenant_key
    `);
    await queryRunner.dropIndex('tenant_settings', 'idx_tenant_settings_tenant_id');
    await queryRunner.dropIndex('tenant_settings', 'idx_tenant_settings_key');
    await queryRunner.dropIndex('tenant_settings', 'idx_tenant_settings_is_active');
    await queryRunner.dropIndex('tenant_settings', 'idx_tenant_settings_deleted_at');
    await queryRunner.dropIndex('tenant_settings', 'idx_tenant_settings_tenant_active');
    await queryRunner.dropTable('tenant_settings');
  }
}
