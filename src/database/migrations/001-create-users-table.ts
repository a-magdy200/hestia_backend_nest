import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Migration: Create Users Table
 *
 * This migration creates the comprehensive users table with all necessary fields
 * for user authentication, authorization, and profile management.
 *
 * Features included:
 * - User authentication (email, password, MFA)
 * - Profile management (name, avatar, preferences)
 * - Account status and verification
 * - Audit fields (created, updated, deleted)
 * - Performance indexes
 * - Data integrity constraints
 */
export class CreateUsersTable1704067200000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique user identifier',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
            comment: 'User email address (unique)',
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Bcrypt hashed password',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'User first name',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'User last name',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '150',
            isNullable: true,
            comment: 'User display name',
          },
          {
            name: 'avatar_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'User avatar image URL',
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: 'User phone number',
          },
          {
            name: 'date_of_birth',
            type: 'date',
            isNullable: true,
            comment: 'User date of birth',
          },
          {
            name: 'gender',
            type: 'enum',
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
            isNullable: true,
            comment: 'User gender preference',
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '50',
            default: "'UTC'",
            isNullable: false,
            comment: 'User timezone',
          },
          {
            name: 'locale',
            type: 'varchar',
            length: '10',
            default: "'en'",
            isNullable: false,
            comment: 'User locale preference',
          },
          {
            name: 'is_email_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Email verification status',
          },
          {
            name: 'email_verified_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Email verification timestamp',
          },
          {
            name: 'is_phone_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Phone verification status',
          },
          {
            name: 'phone_verified_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Phone verification timestamp',
          },
          {
            name: 'is_mfa_enabled',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Multi-factor authentication status',
          },
          {
            name: 'mfa_secret',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'TOTP secret for MFA',
          },
          {
            name: 'mfa_backup_codes',
            type: 'text',
            isNullable: true,
            comment: 'JSON array of backup codes',
          },
          {
            name: 'account_status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended', 'pending_verification', 'deleted'],
            default: "'pending_verification'",
            isNullable: false,
            comment: 'User account status',
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Last login timestamp',
          },
          {
            name: 'last_login_ip',
            type: 'varchar',
            length: '45',
            isNullable: true,
            comment: 'Last login IP address',
          },
          {
            name: 'failed_login_attempts',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of failed login attempts',
          },
          {
            name: 'account_locked_until',
            type: 'timestamp',
            isNullable: true,
            comment: 'Account lockout expiry',
          },
          {
            name: 'password_changed_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Password last changed timestamp',
          },
          {
            name: 'password_expires_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Password expiry timestamp',
          },
          {
            name: 'preferences',
            type: 'jsonb',
            isNullable: true,
            comment: 'User preferences and settings',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional user metadata',
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
      'users',
      new TableIndex({
        name: 'idx_users_email',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_account_status',
        columnNames: ['account_status'],
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
        name: 'idx_users_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Create composite indexes for common queries
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_status_created',
        columnNames: ['account_status', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'idx_users_email_verified',
        columnNames: ['email', 'is_email_verified'],
      }),
    );

    // Add comments to table and columns for documentation
    await queryRunner.query(`
      COMMENT ON TABLE users IS 'User accounts and authentication data';
      COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
      COMMENT ON COLUMN users.email IS 'User email address (unique, required)';
      COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password (cost factor 12)';
      COMMENT ON COLUMN users.preferences IS 'JSON object containing user preferences';
      COMMENT ON COLUMN users.metadata IS 'JSON object containing additional user data';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('users', 'idx_users_email');
    await queryRunner.dropIndex('users', 'idx_users_account_status');
    await queryRunner.dropIndex('users', 'idx_users_created_at');
    await queryRunner.dropIndex('users', 'idx_users_deleted_at');
    await queryRunner.dropIndex('users', 'idx_users_status_created');
    await queryRunner.dropIndex('users', 'idx_users_email_verified');

    // Drop table
    await queryRunner.dropTable('users');
  }
}
