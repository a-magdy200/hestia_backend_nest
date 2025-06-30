import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Nutritional Info Table
 *
 * This migration creates the nutritional_info table to replace the JSON nutritional_info
 * column in recipes and ingredients tables, with proper relational structure for comprehensive nutritional data.
 */
export class CreateNutritionalInfoTable1704068280000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'nutritional_info',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique nutritional info identifier',
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Entity identifier (recipe or ingredient)',
          },
          {
            name: 'entity_type',
            type: 'enum',
            enum: ['recipe', 'ingredient'],
            isNullable: false,
            comment: 'Entity type (recipe or ingredient)',
          },
          {
            name: 'serving_size',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            comment: 'Serving size amount',
          },
          {
            name: 'serving_unit',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Serving size unit (g, ml, cup, etc.)',
          },
          {
            name: 'calories',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Calories per serving',
          },
          {
            name: 'protein_g',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Protein in grams',
          },
          {
            name: 'carbohydrates_g',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Carbohydrates in grams',
          },
          {
            name: 'fat_g',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Fat in grams',
          },
          {
            name: 'fiber_g',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Fiber in grams',
          },
          {
            name: 'sugar_g',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Sugar in grams',
          },
          {
            name: 'sodium_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Sodium in milligrams',
          },
          {
            name: 'cholesterol_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Cholesterol in milligrams',
          },
          {
            name: 'saturated_fat_g',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Saturated fat in grams',
          },
          {
            name: 'trans_fat_g',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Trans fat in grams',
          },
          {
            name: 'potassium_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Potassium in milligrams',
          },
          {
            name: 'calcium_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Calcium in milligrams',
          },
          {
            name: 'iron_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Iron in milligrams',
          },
          {
            name: 'vitamin_a_iu',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Vitamin A in International Units',
          },
          {
            name: 'vitamin_c_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Vitamin C in milligrams',
          },
          {
            name: 'vitamin_d_iu',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Vitamin D in International Units',
          },
          {
            name: 'vitamin_e_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Vitamin E in milligrams',
          },
          {
            name: 'vitamin_k_mcg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Vitamin K in micrograms',
          },
          {
            name: 'thiamin_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Thiamin (B1) in milligrams',
          },
          {
            name: 'riboflavin_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Riboflavin (B2) in milligrams',
          },
          {
            name: 'niacin_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Niacin (B3) in milligrams',
          },
          {
            name: 'vitamin_b6_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Vitamin B6 in milligrams',
          },
          {
            name: 'folate_mcg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Folate in micrograms',
          },
          {
            name: 'vitamin_b12_mcg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Vitamin B12 in micrograms',
          },
          {
            name: 'biotin_mcg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Biotin in micrograms',
          },
          {
            name: 'pantothenic_acid_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Pantothenic acid in milligrams',
          },
          {
            name: 'phosphorus_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Phosphorus in milligrams',
          },
          {
            name: 'iodine_mcg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Iodine in micrograms',
          },
          {
            name: 'magnesium_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Magnesium in milligrams',
          },
          {
            name: 'zinc_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Zinc in milligrams',
          },
          {
            name: 'selenium_mcg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Selenium in micrograms',
          },
          {
            name: 'copper_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Copper in milligrams',
          },
          {
            name: 'manganese_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Manganese in milligrams',
          },
          {
            name: 'chromium_mcg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Chromium in micrograms',
          },
          {
            name: 'molybdenum_mcg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Molybdenum in micrograms',
          },
          {
            name: 'chloride_mg',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
            comment: 'Chloride in milligrams',
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether nutritional info has been verified',
          },
          {
            name: 'verified_by',
            type: 'uuid',
            isNullable: true,
            comment: 'User who verified the nutritional info',
          },
          {
            name: 'verified_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Verification timestamp',
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

    // Unique constraint for entity nutritional info
    await queryRunner.query(`
      ALTER TABLE nutritional_info 
      ADD CONSTRAINT uk_nutritional_info_entity 
      UNIQUE (entity_id, entity_type)
    `);

    // Indexes
    await queryRunner.createIndex(
      'nutritional_info',
      new TableIndex({
        name: 'idx_nutritional_info_entity_id',
        columnNames: ['entity_id'],
      }),
    );

    await queryRunner.createIndex(
      'nutritional_info',
      new TableIndex({
        name: 'idx_nutritional_info_entity_type',
        columnNames: ['entity_type'],
      }),
    );

    await queryRunner.createIndex(
      'nutritional_info',
      new TableIndex({
        name: 'idx_nutritional_info_calories',
        columnNames: ['calories'],
      }),
    );

    await queryRunner.createIndex(
      'nutritional_info',
      new TableIndex({
        name: 'idx_nutritional_info_protein',
        columnNames: ['protein_g'],
      }),
    );

    await queryRunner.createIndex(
      'nutritional_info',
      new TableIndex({
        name: 'idx_nutritional_info_is_verified',
        columnNames: ['is_verified'],
      }),
    );

    await queryRunner.createIndex(
      'nutritional_info',
      new TableIndex({
        name: 'idx_nutritional_info_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'nutritional_info',
      new TableIndex({
        name: 'idx_nutritional_info_entity_type_verified',
        columnNames: ['entity_type', 'is_verified'],
      }),
    );

    // Foreign key for verification
    await queryRunner.createForeignKey(
      'nutritional_info',
      new TableForeignKey({
        name: 'fk_nutritional_info_verified_by',
        columnNames: ['verified_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE nutritional_info IS 'Comprehensive nutritional information for recipes and ingredients';
      COMMENT ON COLUMN nutritional_info.id IS 'Unique nutritional info identifier (UUID)';
      COMMENT ON COLUMN nutritional_info.entity_id IS 'Entity identifier (recipe or ingredient)';
      COMMENT ON COLUMN nutritional_info.entity_type IS 'Entity type (recipe or ingredient)';
      COMMENT ON COLUMN nutritional_info.serving_size IS 'Serving size amount';
      COMMENT ON COLUMN nutritional_info.is_verified IS 'Whether nutritional info has been verified';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey('nutritional_info', 'fk_nutritional_info_verified_by');

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE nutritional_info 
      DROP CONSTRAINT uk_nutritional_info_entity
    `);

    // Drop indexes
    await queryRunner.dropIndex('nutritional_info', 'idx_nutritional_info_entity_id');
    await queryRunner.dropIndex('nutritional_info', 'idx_nutritional_info_entity_type');
    await queryRunner.dropIndex('nutritional_info', 'idx_nutritional_info_calories');
    await queryRunner.dropIndex('nutritional_info', 'idx_nutritional_info_protein');
    await queryRunner.dropIndex('nutritional_info', 'idx_nutritional_info_is_verified');
    await queryRunner.dropIndex('nutritional_info', 'idx_nutritional_info_deleted_at');
    await queryRunner.dropIndex('nutritional_info', 'idx_nutritional_info_entity_type_verified');

    // Drop table
    await queryRunner.dropTable('nutritional_info');
  }
}
