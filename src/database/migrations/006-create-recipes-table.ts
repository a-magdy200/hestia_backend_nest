import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Recipes Table
 *
 * This migration creates the recipes table for recipe management, including
 * title, description, instructions, nutrition, status, versioning, and audit fields.
 */
export class CreateRecipesTable1704067500000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'recipes',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique recipe identifier',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: false,
            comment: 'Recipe title',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Recipe description',
          },
          {
            name: 'instructions',
            type: 'jsonb',
            isNullable: false,
            comment: 'Step-by-step instructions as JSON array',
          },
          {
            name: 'nutritional_info',
            type: 'jsonb',
            isNullable: true,
            comment: 'Nutritional information as JSON object',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional recipe metadata',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'in_review', 'approved', 'published', 'archived'],
            default: "'draft'",
            isNullable: false,
            comment: 'Recipe workflow status',
          },
          {
            name: 'version',
            type: 'integer',
            default: 1,
            isNullable: false,
            comment: 'Recipe version number',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
            comment: 'User who created the recipe',
          },
          {
            name: 'updated_by',
            type: 'uuid',
            isNullable: true,
            comment: 'User who last updated the recipe',
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
      'recipes',
      new TableIndex({
        name: 'idx_recipes_title',
        columnNames: ['title'],
      }),
    );
    await queryRunner.createIndex(
      'recipes',
      new TableIndex({
        name: 'idx_recipes_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'recipes',
      new TableIndex({
        name: 'idx_recipes_created_by',
        columnNames: ['created_by'],
      }),
    );
    await queryRunner.createIndex(
      'recipes',
      new TableIndex({
        name: 'idx_recipes_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    // Composite
    await queryRunner.createIndex(
      'recipes',
      new TableIndex({
        name: 'idx_recipes_status_version',
        columnNames: ['status', 'version'],
      }),
    );
    // FKs
    await queryRunner.createForeignKey(
      'recipes',
      new TableForeignKey({
        name: 'fk_recipes_created_by',
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'recipes',
      new TableForeignKey({
        name: 'fk_recipes_updated_by',
        columnNames: ['updated_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE recipes IS 'Recipe management table';
      COMMENT ON COLUMN recipes.id IS 'Unique recipe identifier (UUID)';
      COMMENT ON COLUMN recipes.instructions IS 'Step-by-step instructions as JSON array';
      COMMENT ON COLUMN recipes.nutritional_info IS 'Nutritional information as JSON object';
      COMMENT ON COLUMN recipes.status IS 'Recipe workflow status';
    `);
  }
  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('recipes', 'fk_recipes_created_by');
    await queryRunner.dropForeignKey('recipes', 'fk_recipes_updated_by');
    await queryRunner.dropIndex('recipes', 'idx_recipes_title');
    await queryRunner.dropIndex('recipes', 'idx_recipes_status');
    await queryRunner.dropIndex('recipes', 'idx_recipes_created_by');
    await queryRunner.dropIndex('recipes', 'idx_recipes_deleted_at');
    await queryRunner.dropIndex('recipes', 'idx_recipes_status_version');
    await queryRunner.dropTable('recipes');
  }
}
