import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration to create users table
 * Creates the users table with all necessary columns, indexes, and constraints
 */
export class CreateUsersTable027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['user', 'admin', 'super_admin'],
            default: "'user'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending_verification', 'active', 'inactive', 'suspended', 'locked'],
            default: "'pending_verification'",
            isNullable: false,
          },
          {
            name: 'email_verification_status',
            type: 'enum',
            enum: ['unverified', 'verified', 'pending'],
            default: "'unverified'",
            isNullable: false,
          },
          {
            name: 'email_verified_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'password_changed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'locked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'lock_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'failed_login_attempts',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'last_failed_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'is_deleted',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_tenant_id_email',
        columnNames: ['tenant_id', 'email'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_role',
        columnNames: ['role'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email_verification_status',
        columnNames: ['email_verification_status'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_is_deleted',
        columnNames: ['is_deleted'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_last_login_at',
        columnNames: ['last_login_at'],
      }),
    );

    // Create foreign key to tenants table (if it exists)
    try {
      await queryRunner.createForeignKey(
        'users',
        new TableForeignKey({
          name: 'fk_users_tenant_id',
          columnNames: ['tenant_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'tenants',
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    } catch (error) {
      // Tenants table might not exist yet, skip foreign key creation
      console.log('Tenants table not found, skipping foreign key creation');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    try {
      await queryRunner.dropForeignKey('users', 'fk_users_tenant_id');
    } catch (error) {
      // Foreign key might not exist
    }

    // Drop indexes
    await queryRunner.dropIndex('users', 'idx_users_email');
    await queryRunner.dropIndex('users', 'idx_users_tenant_id_email');
    await queryRunner.dropIndex('users', 'idx_users_status');
    await queryRunner.dropIndex('users', 'idx_users_role');
    await queryRunner.dropIndex('users', 'idx_users_email_verification_status');
    await queryRunner.dropIndex('users', 'idx_users_is_active');
    await queryRunner.dropIndex('users', 'idx_users_is_deleted');
    await queryRunner.dropIndex('users', 'idx_users_created_at');
    await queryRunner.dropIndex('users', 'idx_users_last_login_at');

    // Drop table
    await queryRunner.dropTable('users');
  }
} 