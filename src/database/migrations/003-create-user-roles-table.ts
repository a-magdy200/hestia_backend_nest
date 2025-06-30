import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create User Roles Table
 *
 * This migration creates the user_roles junction table for many-to-many
 * relationship between users and roles with additional metadata.
 *
 * Features included:
 * - Many-to-many user-role relationships
 * - Role assignment metadata
 * - Assignment timestamps and audit trail
 * - Performance indexes
 * - Data integrity constraints
 */
export class CreateUserRolesTable1704067320000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique user role assignment identifier',
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
            isNullable: false,
            comment: 'Role identifier',
          },
          {
            name: 'assigned_by',
            type: 'uuid',
            isNullable: true,
            comment: 'User who assigned this role',
          },
          {
            name: 'assigned_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
            comment: 'Role assignment timestamp',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Role assignment expiry timestamp',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Role assignment active status',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional assignment metadata',
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

    // Create unique constraint for user-role combination
    await queryRunner.query(`
      ALTER TABLE user_roles 
      ADD CONSTRAINT uk_user_roles_user_role 
      UNIQUE (user_id, role_id)
    `);

    // Create indexes for performance
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_role_id',
        columnNames: ['role_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_assigned_by',
        columnNames: ['assigned_by'],
      }),
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_expires_at',
        columnNames: ['expires_at'],
      }),
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_assigned_at',
        columnNames: ['assigned_at'],
      }),
    );

    // Create composite indexes for common queries
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_user_active',
        columnNames: ['user_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_role_active',
        columnNames: ['role_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({
        name: 'idx_user_roles_active_expires',
        columnNames: ['is_active', 'expires_at'],
      }),
    );

    // Add foreign keys for data integrity
    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        name: 'fk_user_roles_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        name: 'fk_user_roles_role_id',
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        name: 'fk_user_roles_assigned_by',
        columnNames: ['assigned_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Add comments to table and columns for documentation
    await queryRunner.query(`
      COMMENT ON TABLE user_roles IS 'User-role assignments for RBAC';
      COMMENT ON COLUMN user_roles.id IS 'Unique assignment identifier (UUID)';
      COMMENT ON COLUMN user_roles.user_id IS 'User identifier (foreign key)';
      COMMENT ON COLUMN user_roles.role_id IS 'Role identifier (foreign key)';
      COMMENT ON COLUMN user_roles.assigned_by IS 'User who assigned this role';
      COMMENT ON COLUMN user_roles.expires_at IS 'Role assignment expiry timestamp';
      COMMENT ON COLUMN user_roles.metadata IS 'JSON object containing assignment metadata';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('user_roles', 'fk_user_roles_user_id');
    await queryRunner.dropForeignKey('user_roles', 'fk_user_roles_role_id');
    await queryRunner.dropForeignKey('user_roles', 'fk_user_roles_assigned_by');

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE user_roles 
      DROP CONSTRAINT uk_user_roles_user_role
    `);

    // Drop indexes
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_user_id');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_role_id');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_assigned_by');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_is_active');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_expires_at');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_assigned_at');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_user_active');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_role_active');
    await queryRunner.dropIndex('user_roles', 'idx_user_roles_active_expires');

    // Drop table
    await queryRunner.dropTable('user_roles');
  }
}
