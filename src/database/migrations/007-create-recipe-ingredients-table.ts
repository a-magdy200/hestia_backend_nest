import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Recipe Ingredients Table
 *
 * This migration creates the recipe_ingredients table for mapping ingredients
 * to recipes, including quantity, unit, notes, substitutions, and audit fields.
 */
export class CreateRecipeIngredientsTable1704067560000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'recipe_ingredients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique recipe ingredient identifier',
          },
          {
            name: 'recipe_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Recipe identifier',
          },
          {
            name: 'ingredient_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Ingredient identifier',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            comment: 'Ingredient quantity',
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Unit of measure',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Ingredient notes',
          },
          {
            name: 'substitutions',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of substitution options',
          },
          {
            name: 'cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Ingredient cost',
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
    // Indexes
    await queryRunner.createIndex(
      'recipe_ingredients',
      new TableIndex({
        name: 'idx_recipe_ingredients_recipe_id',
        columnNames: ['recipe_id'],
      }),
    );
    await queryRunner.createIndex(
      'recipe_ingredients',
      new TableIndex({
        name: 'idx_recipe_ingredients_ingredient_id',
        columnNames: ['ingredient_id'],
      }),
    );
    await queryRunner.createIndex(
      'recipe_ingredients',
      new TableIndex({
        name: 'idx_recipe_ingredients_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    // Composite
    await queryRunner.createIndex(
      'recipe_ingredients',
      new TableIndex({
        name: 'idx_recipe_ingredients_recipe_ingredient',
        columnNames: ['recipe_id', 'ingredient_id'],
      }),
    );
    // FKs
    await queryRunner.createForeignKey(
      'recipe_ingredients',
      new TableForeignKey({
        name: 'fk_recipe_ingredients_recipe_id',
        columnNames: ['recipe_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'recipes',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'recipe_ingredients',
      new TableForeignKey({
        name: 'fk_recipe_ingredients_ingredient_id',
        columnNames: ['ingredient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ingredients',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE recipe_ingredients IS 'Mapping of ingredients to recipes';
      COMMENT ON COLUMN recipe_ingredients.id IS 'Unique recipe ingredient identifier (UUID)';
      COMMENT ON COLUMN recipe_ingredients.substitutions IS 'Array of substitution options';
    `);
  }
  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('recipe_ingredients', 'fk_recipe_ingredients_recipe_id');
    await queryRunner.dropForeignKey('recipe_ingredients', 'fk_recipe_ingredients_ingredient_id');
    await queryRunner.dropIndex('recipe_ingredients', 'idx_recipe_ingredients_recipe_id');
    await queryRunner.dropIndex('recipe_ingredients', 'idx_recipe_ingredients_ingredient_id');
    await queryRunner.dropIndex('recipe_ingredients', 'idx_recipe_ingredients_deleted_at');
    await queryRunner.dropIndex('recipe_ingredients', 'idx_recipe_ingredients_recipe_ingredient');
    await queryRunner.dropTable('recipe_ingredients');
  }
}
