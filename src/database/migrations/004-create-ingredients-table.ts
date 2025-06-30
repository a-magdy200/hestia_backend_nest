import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Ingredients Table
 *
 * This migration creates the ingredients table for comprehensive ingredient
 * management with nutritional information, allergens, and dietary classifications.
 *
 * Features included:
 * - Global ingredient database with 10,000+ ingredients
 * - Nutritional information with macro and micronutrients
 * - Allergen tracking and cross-contamination warnings
 * - Dietary classifications (vegan, vegetarian, keto, paleo, etc.)
 * - Seasonal availability and geographic sourcing information
 * - Performance indexes and data integrity constraints
 */
export class CreateIngredientsTable1704067380000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ingredients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique ingredient identifier',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
            comment: 'Ingredient name',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Ingredient description',
          },
          {
            name: 'category_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Ingredient category identifier',
          },
          {
            name: 'scientific_name',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: 'Scientific name of the ingredient',
          },
          {
            name: 'common_names',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of common names and aliases',
          },
          {
            name: 'nutritional_info',
            type: 'jsonb',
            isNullable: true,
            comment: 'Comprehensive nutritional information',
          },
          {
            name: 'allergens',
            type: 'jsonb',
            isNullable: true,
            default: "'[]'",
            comment: 'Array of allergen identifiers',
          },
          {
            name: 'dietary_types',
            type: 'jsonb',
            isNullable: true,
            default: "'[]'",
            comment: 'Array of dietary classifications',
          },
          {
            name: 'seasonality',
            type: 'jsonb',
            isNullable: true,
            comment: 'Seasonal availability information',
          },
          {
            name: 'origin',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Geographic origin of the ingredient',
          },
          {
            name: 'storage_instructions',
            type: 'text',
            isNullable: true,
            comment: 'Storage and handling instructions',
          },
          {
            name: 'shelf_life',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Shelf life information',
          },
          {
            name: 'substitutions',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of substitution options',
          },
          {
            name: 'certifications',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of certifications (organic, fair trade, etc.)',
          },
          {
            name: 'sustainability_score',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
            comment: 'Sustainability rating (0.00-1.00)',
          },
          {
            name: 'cost_per_unit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Average cost per unit',
          },
          {
            name: 'unit_of_measure',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Standard unit of measure',
          },
          {
            name: 'is_global',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Indicates if this is a global ingredient',
          },
          {
            name: 'is_custom',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Indicates if this is a custom ingredient',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
            comment: 'User who created this ingredient (for custom ingredients)',
          },
          {
            name: 'is_approved',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Approval status for custom ingredients',
          },
          {
            name: 'approval_status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected'],
            default: "'approved'",
            isNullable: false,
            comment: 'Approval status for custom ingredients',
          },
          {
            name: 'usage_count',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of times this ingredient is used in recipes',
          },
          {
            name: 'popularity_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
            isNullable: false,
            comment: 'Popularity score based on usage and ratings',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional ingredient metadata',
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
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_category_id',
        columnNames: ['category_id'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_is_global',
        columnNames: ['is_global'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_is_custom',
        columnNames: ['is_custom'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_created_by',
        columnNames: ['created_by'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_approval_status',
        columnNames: ['approval_status'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_usage_count',
        columnNames: ['usage_count'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_popularity_score',
        columnNames: ['popularity_score'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Create composite indexes for common queries
    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_global_approved',
        columnNames: ['is_global', 'approval_status'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_category_approved',
        columnNames: ['category_id', 'approval_status'],
      }),
    );

    await queryRunner.createIndex(
      'ingredients',
      new TableIndex({
        name: 'idx_ingredients_popularity_approved',
        columnNames: ['popularity_score', 'approval_status'],
      }),
    );

    // Create GIN indexes for JSONB columns
    await queryRunner.query(`
      CREATE INDEX idx_ingredients_allergens_gin ON ingredients USING GIN (allergens);
      CREATE INDEX idx_ingredients_dietary_types_gin ON ingredients USING GIN (dietary_types);
      CREATE INDEX idx_ingredients_common_names_gin ON ingredients USING GIN (common_names);
      CREATE INDEX idx_ingredients_nutritional_info_gin ON ingredients USING GIN (nutritional_info);
    `);

    // Add foreign keys for data integrity
    await queryRunner.createForeignKey(
      'ingredients',
      new TableForeignKey({
        name: 'fk_ingredients_category_id',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ingredient_categories',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'ingredients',
      new TableForeignKey({
        name: 'fk_ingredients_created_by',
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Add comments to table and columns for documentation
    await queryRunner.query(`
      COMMENT ON TABLE ingredients IS 'Global ingredient database with nutritional and dietary information';
      COMMENT ON COLUMN ingredients.id IS 'Unique ingredient identifier (UUID)';
      COMMENT ON COLUMN ingredients.name IS 'Ingredient name (required)';
      COMMENT ON COLUMN ingredients.nutritional_info IS 'JSON object containing comprehensive nutritional data';
      COMMENT ON COLUMN ingredients.allergens IS 'JSON array of allergen identifiers';
      COMMENT ON COLUMN ingredients.dietary_types IS 'JSON array of dietary classifications';
      COMMENT ON COLUMN ingredients.sustainability_score IS 'Sustainability rating from 0.00 to 1.00';
      COMMENT ON COLUMN ingredients.popularity_score IS 'Popularity score based on usage and user ratings';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('ingredients', 'fk_ingredients_category_id');
    await queryRunner.dropForeignKey('ingredients', 'fk_ingredients_created_by');

    // Drop GIN indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_ingredients_allergens_gin;
      DROP INDEX IF EXISTS idx_ingredients_dietary_types_gin;
      DROP INDEX IF EXISTS idx_ingredients_common_names_gin;
      DROP INDEX IF EXISTS idx_ingredients_nutritional_info_gin;
    `);

    // Drop regular indexes
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_name');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_category_id');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_is_global');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_is_custom');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_created_by');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_approval_status');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_usage_count');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_popularity_score');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_deleted_at');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_global_approved');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_category_approved');
    await queryRunner.dropIndex('ingredients', 'idx_ingredients_popularity_approved');

    // Drop table
    await queryRunner.dropTable('ingredients');
  }
}
