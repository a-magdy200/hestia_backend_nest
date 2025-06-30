import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create User Profiles Table
 *
 * This migration creates the user_profiles table to support comprehensive profile management
 * with detailed user information, preferences, and settings.
 */
export class CreateUserProfilesTable1704068520000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique user profile identifier',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: 'User identifier',
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
            comment: 'Display name for the user',
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
            comment: 'User biography or description',
          },
          {
            name: 'avatar_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'User avatar image URL',
          },
          {
            name: 'cover_image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'User cover image URL',
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
            comment: 'User gender',
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: 'User phone number',
          },
          {
            name: 'phone_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether phone number is verified',
          },
          {
            name: 'address_line_1',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Address line 1',
          },
          {
            name: 'address_line_2',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Address line 2',
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'City',
          },
          {
            name: 'state_province',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'State or province',
          },
          {
            name: 'postal_code',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: 'Postal code',
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Country',
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
            default: "'en-US'",
            isNullable: false,
            comment: 'User locale preference',
          },
          {
            name: 'language',
            type: 'varchar',
            length: '10',
            default: "'en'",
            isNullable: false,
            comment: 'User language preference',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            isNullable: false,
            comment: 'User preferred currency',
          },
          {
            name: 'units_system',
            type: 'enum',
            enum: ['metric', 'imperial', 'mixed'],
            default: "'metric'",
            isNullable: false,
            comment: 'Preferred units system',
          },
          {
            name: 'cooking_experience',
            type: 'enum',
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: "'beginner'",
            isNullable: false,
            comment: 'User cooking experience level',
          },
          {
            name: 'dietary_restrictions',
            type: 'text',
            isNullable: true,
            comment: 'Dietary restrictions (JSON array)',
          },
          {
            name: 'allergies',
            type: 'text',
            isNullable: true,
            comment: 'Food allergies (JSON array)',
          },
          {
            name: 'favorite_cuisines',
            type: 'text',
            isNullable: true,
            comment: 'Favorite cuisines (JSON array)',
          },
          {
            name: 'cooking_goals',
            type: 'text',
            isNullable: true,
            comment: 'Cooking goals (JSON array)',
          },
          {
            name: 'household_size',
            type: 'integer',
            isNullable: true,
            comment: 'Number of people in household',
          },
          {
            name: 'children_count',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of children in household',
          },
          {
            name: 'pets',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether user has pets',
          },
          {
            name: 'kitchen_size',
            type: 'enum',
            enum: ['small', 'medium', 'large', 'commercial'],
            isNullable: true,
            comment: 'Kitchen size',
          },
          {
            name: 'cooking_frequency',
            type: 'enum',
            enum: ['daily', 'few_times_week', 'weekly', 'occasionally', 'rarely'],
            isNullable: true,
            comment: 'How often user cooks',
          },
          {
            name: 'meal_planning_frequency',
            type: 'enum',
            enum: ['daily', 'weekly', 'biweekly', 'monthly', 'never'],
            isNullable: true,
            comment: 'How often user plans meals',
          },
          {
            name: 'budget_range',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'luxury'],
            isNullable: true,
            comment: 'Grocery budget range',
          },
          {
            name: 'shopping_frequency',
            type: 'enum',
            enum: ['daily', 'few_times_week', 'weekly', 'biweekly', 'monthly'],
            isNullable: true,
            comment: 'How often user shops for groceries',
          },
          {
            name: 'preferred_stores',
            type: 'text',
            isNullable: true,
            comment: 'Preferred grocery stores (JSON array)',
          },
          {
            name: 'social_media_links',
            type: 'jsonb',
            isNullable: true,
            comment: 'Social media profile links',
          },
          {
            name: 'website_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Personal website URL',
          },
          {
            name: 'blog_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Blog URL',
          },
          {
            name: 'is_public_profile',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether profile is public',
          },
          {
            name: 'profile_visibility',
            type: 'enum',
            enum: ['public', 'friends', 'private'],
            default: "'private'",
            isNullable: false,
            comment: 'Profile visibility level',
          },
          {
            name: 'show_email',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether to show email publicly',
          },
          {
            name: 'show_phone',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether to show phone publicly',
          },
          {
            name: 'show_location',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether to show location publicly',
          },
          {
            name: 'notification_preferences',
            type: 'jsonb',
            isNullable: true,
            comment: 'Notification preferences (JSON object)',
          },
          {
            name: 'privacy_settings',
            type: 'jsonb',
            isNullable: true,
            comment: 'Privacy settings (JSON object)',
          },
          {
            name: 'last_profile_update',
            type: 'timestamp',
            isNullable: true,
            comment: 'Last profile update timestamp',
          },
          {
            name: 'profile_completion_percentage',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Profile completion percentage',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Profile active status',
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

    // Unique constraint for user profile
    await queryRunner.query(`
      ALTER TABLE user_profiles 
      ADD CONSTRAINT uk_user_profiles_user 
      UNIQUE (user_id)
    `);

    // Indexes
    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_display_name',
        columnNames: ['display_name'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_email',
        columnNames: ['phone_number'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_country',
        columnNames: ['country'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_cooking_experience',
        columnNames: ['cooking_experience'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_visibility',
        columnNames: ['profile_visibility'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_is_public',
        columnNames: ['is_public_profile'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_user_active',
        columnNames: ['user_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_public_active',
        columnNames: ['is_public_profile', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'user_profiles',
      new TableIndex({
        name: 'idx_user_profiles_experience_active',
        columnNames: ['cooking_experience', 'is_active'],
      }),
    );

    // Foreign key
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

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE user_profiles IS 'Comprehensive user profile information and preferences';
      COMMENT ON COLUMN user_profiles.id IS 'Unique user profile identifier (UUID)';
      COMMENT ON COLUMN user_profiles.display_name IS 'Display name for the user';
      COMMENT ON COLUMN user_profiles.cooking_experience IS 'User cooking experience level';
      COMMENT ON COLUMN user_profiles.profile_visibility IS 'Profile visibility level';
      COMMENT ON COLUMN user_profiles.profile_completion_percentage IS 'Profile completion percentage';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey('user_profiles', 'fk_user_profiles_user_id');

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE user_profiles 
      DROP CONSTRAINT uk_user_profiles_user
    `);

    // Drop indexes
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_user_id');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_display_name');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_email');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_country');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_cooking_experience');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_visibility');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_is_public');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_is_active');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_deleted_at');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_user_active');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_public_active');
    await queryRunner.dropIndex('user_profiles', 'idx_user_profiles_experience_active');

    // Drop table
    await queryRunner.dropTable('user_profiles');
  }
}
