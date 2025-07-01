import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration to create user_profiles table
 * Creates the user_profiles table with all necessary columns, indexes, and constraints
 */
export class CreateUserProfilesTable028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'date_of_birth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'language',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'avatar_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'cover_image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'visibility',
            type: 'enum',
            enum: ['public', 'private', 'friends_only'],
            default: "'public'",
            isNullable: false,
          },
          {
            name: 'preferences',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'social_links',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_public_profile',
            type: 'boolean',
            default: false,
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
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_user_id',
        columnNames: ['user_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_visibility',
        columnNames: ['visibility'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_is_public_profile',
        columnNames: ['is_public_profile'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_is_deleted',
        columnNames: ['is_deleted'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_updated_at',
        columnNames: ['updated_at'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_location',
        columnNames: ['location'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_language',
        columnNames: ['language'],
      }),
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'user_profiles',
      new TableForeignKey({
        name: 'fk_user_profiles_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey('user_profiles', 'fk_user_profiles_user_id');

    // Drop indexes
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_user_id');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_visibility');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_is_public_profile');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_is_deleted');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_created_at');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_updated_at');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_location');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_language');

    // Drop table
    await queryRunner.dropTable('user_profiles');
  }
} 