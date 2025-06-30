import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Roles Table
 *
 * This migration creates the roles table for role-based access control (RBAC)
 * with hierarchical roles and granular permissions.
 *
 * Features included:
 * - Role hierarchy and inheritance
 * - Granular permission system
 * - Role templates for common scenarios
 * - Audit fields and metadata
 * - Performance indexes
 * - Data integrity constraints
 */
export class CreateRolesTable1704067260000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique role identifier',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
            comment: 'Role name (unique)',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '150',
            isNullable: false,
            comment: 'Human-readable role display name',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Role description',
          },
          {
            name: 'parent_role_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Parent role for hierarchy inheritance',
          },
          {
            name: 'permissions',
            type: 'jsonb',
            isNullable: false,
            default: "'[]'",
            comment: 'Array of permission strings',
          },
          {
            name: 'is_system_role',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Indicates if this is a system-defined role',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Role active status',
          },
          {
            name: 'priority',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Role priority for conflict resolution',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional role metadata',
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

    // Create indexes for performance
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_parent_role_id',
        columnNames: ['parent_role_id'],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_is_system_role',
        columnNames: ['is_system_role'],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_priority',
        columnNames: ['priority'],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Create composite indexes for common queries
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_active_system',
        columnNames: ['is_active', 'is_system_role'],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_parent_active',
        columnNames: ['parent_role_id', 'is_active'],
      }),
    );

    // Add foreign key for role hierarchy
    await queryRunner.createForeignKey(
      'roles',
      new TableForeignKey({
        name: 'fk_roles_parent_role',
        columnNames: ['parent_role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Add comments to table and columns for documentation
    await queryRunner.query(`
      COMMENT ON TABLE roles IS 'Role-based access control (RBAC) roles';
      COMMENT ON COLUMN roles.id IS 'Unique role identifier (UUID)';
      COMMENT ON COLUMN roles.name IS 'Role name (unique, required)';
      COMMENT ON COLUMN roles.permissions IS 'JSON array of permission strings';
      COMMENT ON COLUMN roles.parent_role_id IS 'Parent role for inheritance hierarchy';
      COMMENT ON COLUMN roles.is_system_role IS 'Indicates system-defined vs custom roles';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey('roles', 'fk_roles_parent_role');

    // Drop indexes
    await queryRunner.dropIndex('roles', 'idx_roles_name');
    await queryRunner.dropIndex('roles', 'idx_roles_parent_role_id');
    await queryRunner.dropIndex('roles', 'idx_roles_is_active');
    await queryRunner.dropIndex('roles', 'idx_roles_is_system_role');
    await queryRunner.dropIndex('roles', 'idx_roles_priority');
    await queryRunner.dropIndex('roles', 'idx_roles_deleted_at');
    await queryRunner.dropIndex('roles', 'idx_roles_active_system');
    await queryRunner.dropIndex('roles', 'idx_roles_parent_active');

    // Drop table
    await queryRunner.dropTable('roles');
  }
}
