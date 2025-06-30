import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Ingredient Allergens Table
 *
 * This migration creates the ingredient_allergens table to replace the JSON allergens
 * column in ingredients table, with proper relational structure.
 */
export class CreateIngredientAllergensTable1704068040000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ingredient_allergens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique ingredient allergen identifier',
          },
          {
            name: 'ingredient_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Ingredient identifier',
          },
          {
            name: 'allergen_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Allergen name',
          },
          {
            name: 'allergen_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Allergen type (e.g., food, environmental)',
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'critical'],
            default: "'medium'",
            isNullable: false,
            comment: 'Allergen severity level',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Allergen active status',
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

    // Unique constraint for ingredient allergen combination
    await queryRunner.query(`
      ALTER TABLE ingredient_allergens 
      ADD CONSTRAINT uk_ingredient_allergens_ingredient_name 
      UNIQUE (ingredient_id, allergen_name)
    `);

    // Indexes
    await queryRunner.createIndex(
      'ingredient_allergens',
      new TableIndex({
        name: 'idx_ingredient_allergens_ingredient_id',
        columnNames: ['ingredient_id'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_allergens',
      new TableIndex({
        name: 'idx_ingredient_allergens_name',
        columnNames: ['allergen_name'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_allergens',
      new TableIndex({
        name: 'idx_ingredient_allergens_type',
        columnNames: ['allergen_type'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_allergens',
      new TableIndex({
        name: 'idx_ingredient_allergens_severity',
        columnNames: ['severity'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_allergens',
      new TableIndex({
        name: 'idx_ingredient_allergens_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_allergens',
      new TableIndex({
        name: 'idx_ingredient_allergens_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'ingredient_allergens',
      new TableIndex({
        name: 'idx_ingredient_allergens_ingredient_active',
        columnNames: ['ingredient_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_allergens',
      new TableIndex({
        name: 'idx_ingredient_allergens_name_active',
        columnNames: ['allergen_name', 'is_active'],
      }),
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'ingredient_allergens',
      new TableForeignKey({
        name: 'fk_ingredient_allergens_ingredient_id',
        columnNames: ['ingredient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ingredients',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE ingredient_allergens IS 'Ingredient allergen information';
      COMMENT ON COLUMN ingredient_allergens.id IS 'Unique ingredient allergen identifier (UUID)';
      COMMENT ON COLUMN ingredient_allergens.allergen_name IS 'Allergen name (unique per ingredient)';
      COMMENT ON COLUMN ingredient_allergens.severity IS 'Allergen severity level';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey(
      'ingredient_allergens',
      'fk_ingredient_allergens_ingredient_id',
    );

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE ingredient_allergens 
      DROP CONSTRAINT uk_ingredient_allergens_ingredient_name
    `);

    // Drop indexes
    await queryRunner.dropIndex('ingredient_allergens', 'idx_ingredient_allergens_ingredient_id');
    await queryRunner.dropIndex('ingredient_allergens', 'idx_ingredient_allergens_name');
    await queryRunner.dropIndex('ingredient_allergens', 'idx_ingredient_allergens_type');
    await queryRunner.dropIndex('ingredient_allergens', 'idx_ingredient_allergens_severity');
    await queryRunner.dropIndex('ingredient_allergens', 'idx_ingredient_allergens_is_active');
    await queryRunner.dropIndex('ingredient_allergens', 'idx_ingredient_allergens_deleted_at');
    await queryRunner.dropIndex(
      'ingredient_allergens',
      'idx_ingredient_allergens_ingredient_active',
    );
    await queryRunner.dropIndex('ingredient_allergens', 'idx_ingredient_allergens_name_active');

    // Drop table
    await queryRunner.dropTable('ingredient_allergens');
  }
}
