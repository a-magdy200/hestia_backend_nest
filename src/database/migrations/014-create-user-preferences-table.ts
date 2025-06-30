import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create User Preferences Table
 *
 * This migration creates the user_preferences table to replace the JSON preferences
 * column in users table, with proper relational structure.
 */
export class CreateUserPreferencesTable1704067980000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_preferences',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique user preference identifier',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: 'User identifier',
          },
          {
            name: 'preference_key',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Preference key',
          },
          {
            name: 'preference_value',
            type: 'text',
            isNullable: true,
            comment: 'Preference value',
          },
          {
            name: 'preference_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Preference type (string, number, boolean, etc.)',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Preference active status',
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

    // Unique constraint for user preference key combination
    await queryRunner.query(`
      ALTER TABLE user_preferences 
      ADD CONSTRAINT uk_user_preferences_user_key 
      UNIQUE (user_id, preference_key)
    `);

    // Indexes
    await queryRunner.createIndex(
      'user_preferences',
      new TableIndex({
        name: 'idx_user_preferences_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_preferences',
      new TableIndex({
        name: 'idx_user_preferences_key',
        columnNames: ['preference_key'],
      }),
    );

    await queryRunner.createIndex(
      'user_preferences',
      new TableIndex({
        name: 'idx_user_preferences_type',
        columnNames: ['preference_type'],
      }),
    );

    await queryRunner.createIndex(
      'user_preferences',
      new TableIndex({
        name: 'idx_user_preferences_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'user_preferences',
      new TableIndex({
        name: 'idx_user_preferences_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'user_preferences',
      new TableIndex({
        name: 'idx_user_preferences_user_active',
        columnNames: ['user_id', 'is_active'],
      }),
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'user_preferences',
      new TableForeignKey({
        name: 'fk_user_preferences_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE user_preferences IS 'User preferences and settings';
      COMMENT ON COLUMN user_preferences.id IS 'Unique user preference identifier (UUID)';
      COMMENT ON COLUMN user_preferences.preference_key IS 'Preference key (unique per user)';
      COMMENT ON COLUMN user_preferences.preference_value IS 'Preference value as text';
      COMMENT ON COLUMN user_preferences.preference_type IS 'Data type of the preference value';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey('user_preferences', 'fk_user_preferences_user_id');

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE user_preferences 
      DROP CONSTRAINT uk_user_preferences_user_key
    `);

    // Drop indexes
    await queryRunner.dropIndex('user_preferences', 'idx_user_preferences_user_id');
    await queryRunner.dropIndex('user_preferences', 'idx_user_preferences_key');
    await queryRunner.dropIndex('user_preferences', 'idx_user_preferences_type');
    await queryRunner.dropIndex('user_preferences', 'idx_user_preferences_is_active');
    await queryRunner.dropIndex('user_preferences', 'idx_user_preferences_deleted_at');
    await queryRunner.dropIndex('user_preferences', 'idx_user_preferences_user_active');

    // Drop table
    await queryRunner.dropTable('user_preferences');
  }
}
