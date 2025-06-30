import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Ingredient Categories Table
 *
 * This migration creates the ingredient_categories table for hierarchical
 * ingredient categorization, supporting parent-child relationships and metadata.
 */
export class CreateIngredientCategoriesTable1704067440000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ingredient_categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique category identifier',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Category name',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Category description',
          },
          {
            name: 'parent_category_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Parent category for hierarchy',
          },
          {
            name: 'order_index',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Ordering index for display',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Category active status',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional category metadata',
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
      'ingredient_categories',
      new TableIndex({
        name: 'idx_ingredient_categories_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'ingredient_categories',
      new TableIndex({
        name: 'idx_ingredient_categories_parent',
        columnNames: ['parent_category_id'],
      }),
    );
    await queryRunner.createIndex(
      'ingredient_categories',
      new TableIndex({
        name: 'idx_ingredient_categories_is_active',
        columnNames: ['is_active'],
      }),
    );
    await queryRunner.createIndex(
      'ingredient_categories',
      new TableIndex({
        name: 'idx_ingredient_categories_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    // Composite
    await queryRunner.createIndex(
      'ingredient_categories',
      new TableIndex({
        name: 'idx_ingredient_categories_parent_active',
        columnNames: ['parent_category_id', 'is_active'],
      }),
    );
    // FK
    await queryRunner.createForeignKey(
      'ingredient_categories',
      new TableForeignKey({
        name: 'fk_ingredient_categories_parent',
        columnNames: ['parent_category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ingredient_categories',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE ingredient_categories IS 'Ingredient category hierarchy';
      COMMENT ON COLUMN ingredient_categories.id IS 'Unique category identifier (UUID)';
      COMMENT ON COLUMN ingredient_categories.parent_category_id IS 'Parent category for hierarchy';
    `);
  }
  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('ingredient_categories', 'fk_ingredient_categories_parent');
    await queryRunner.dropIndex('ingredient_categories', 'idx_ingredient_categories_name');
    await queryRunner.dropIndex('ingredient_categories', 'idx_ingredient_categories_parent');
    await queryRunner.dropIndex('ingredient_categories', 'idx_ingredient_categories_is_active');
    await queryRunner.dropIndex('ingredient_categories', 'idx_ingredient_categories_deleted_at');
    await queryRunner.dropIndex('ingredient_categories', 'idx_ingredient_categories_parent_active');
    await queryRunner.dropTable('ingredient_categories');
  }
}
