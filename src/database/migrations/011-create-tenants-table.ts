import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration: Create Tenants Table
 *
 * This migration creates the tenants table for multi-tenant architecture, including
 * domain, branding, config, limits, security, backup, and audit fields.
 */
export class CreateTenantsTable1704067800000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique tenant identifier',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
            comment: 'Tenant name',
          },
          {
            name: 'domain',
            type: 'varchar',
            length: '200',
            isNullable: false,
            isUnique: true,
            comment: 'Tenant domain',
          },
          {
            name: 'subdomain',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Tenant subdomain',
          },
          {
            name: 'features',
            type: 'jsonb',
            isNullable: true,
            comment: 'Enabled features for the tenant',
          },
          {
            name: 'limits',
            type: 'jsonb',
            isNullable: true,
            comment: 'Tenant-specific limits',
          },
          {
            name: 'branding',
            type: 'jsonb',
            isNullable: true,
            comment: 'Branding configuration (logo, colors, etc.)',
          },
          {
            name: 'security',
            type: 'jsonb',
            isNullable: true,
            comment: 'Security configuration',
          },
          {
            name: 'backup',
            type: 'jsonb',
            isNullable: true,
            comment: 'Backup configuration',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Tenant active status',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional tenant metadata',
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
    // Indexes
    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'idx_tenants_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'idx_tenants_domain',
        columnNames: ['domain'],
      }),
    );
    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'idx_tenants_is_active',
        columnNames: ['is_active'],
      }),
    );
    await queryRunner.createIndex(
      'tenants',
      new TableIndex({
        name: 'idx_tenants_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE tenants IS 'Multi-tenant architecture table';
      COMMENT ON COLUMN tenants.id IS 'Unique tenant identifier (UUID)';
      COMMENT ON COLUMN tenants.domain IS 'Tenant domain (unique)';
      COMMENT ON COLUMN tenants.branding IS 'Branding configuration (logo, colors, etc.)';
    `);
  }
  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('tenants', 'idx_tenants_name');
    await queryRunner.dropIndex('tenants', 'idx_tenants_domain');
    await queryRunner.dropIndex('tenants', 'idx_tenants_is_active');
    await queryRunner.dropIndex('tenants', 'idx_tenants_deleted_at');
    await queryRunner.dropTable('tenants');
  }
}
