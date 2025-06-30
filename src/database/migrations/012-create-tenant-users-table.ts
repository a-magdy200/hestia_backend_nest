import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Tenant Users Table
 *
 * This migration creates the tenant_users table for mapping users to tenants,
 * including roles, status, and audit fields.
 */
export class CreateTenantUsersTable1704067860000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenant_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique tenant user mapping identifier',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Tenant identifier',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: 'User identifier',
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Role identifier in the tenant context',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'pending', 'suspended'],
            default: "'active'",
            isNullable: false,
            comment: 'Tenant user status',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional mapping metadata',
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
      ALTER TABLE tenant_users 
      ADD CONSTRAINT uk_tenant_users_tenant_user 
      UNIQUE (tenant_id, user_id)
    `);
    // Indexes
    await queryRunner.createIndex(
      'tenant_users',
      new TableIndex({
        name: 'idx_tenant_users_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );
    await queryRunner.createIndex(
      'tenant_users',
      new TableIndex({
        name: 'idx_tenant_users_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'tenant_users',
      new TableIndex({
        name: 'idx_tenant_users_role_id',
        columnNames: ['role_id'],
      }),
    );
    await queryRunner.createIndex(
      'tenant_users',
      new TableIndex({
        name: 'idx_tenant_users_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'tenant_users',
      new TableIndex({
        name: 'idx_tenant_users_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    // Composite
    await queryRunner.createIndex(
      'tenant_users',
      new TableIndex({
        name: 'idx_tenant_users_tenant_status',
        columnNames: ['tenant_id', 'status'],
      }),
    );
    // FKs
    await queryRunner.createForeignKey(
      'tenant_users',
      new TableForeignKey({
        name: 'fk_tenant_users_tenant_id',
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'tenant_users',
      new TableForeignKey({
        name: 'fk_tenant_users_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'tenant_users',
      new TableForeignKey({
        name: 'fk_tenant_users_role_id',
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE tenant_users IS 'Mapping of users to tenants';
      COMMENT ON COLUMN tenant_users.id IS 'Unique tenant user mapping identifier (UUID)';
    `);
  }
  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('tenant_users', 'fk_tenant_users_tenant_id');
    await queryRunner.dropForeignKey('tenant_users', 'fk_tenant_users_user_id');
    await queryRunner.dropForeignKey('tenant_users', 'fk_tenant_users_role_id');
    await queryRunner.query(`
      ALTER TABLE tenant_users 
      DROP CONSTRAINT uk_tenant_users_tenant_user
    `);
    await queryRunner.dropIndex('tenant_users', 'idx_tenant_users_tenant_id');
    await queryRunner.dropIndex('tenant_users', 'idx_tenant_users_user_id');
    await queryRunner.dropIndex('tenant_users', 'idx_tenant_users_role_id');
    await queryRunner.dropIndex('tenant_users', 'idx_tenant_users_status');
    await queryRunner.dropIndex('tenant_users', 'idx_tenant_users_deleted_at');
    await queryRunner.dropIndex('tenant_users', 'idx_tenant_users_tenant_status');
    await queryRunner.dropTable('tenant_users');
  }
}
