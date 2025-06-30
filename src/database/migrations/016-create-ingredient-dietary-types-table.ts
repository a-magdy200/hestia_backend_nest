import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Ingredient Dietary Types Table
 *
 * This migration creates the ingredient_dietary_types table to replace the JSON dietary_types
 * column in ingredients table, with proper relational structure.
 */
export class CreateIngredientDietaryTypesTable1704068100000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ingredient_dietary_types',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique ingredient dietary type identifier',
          },
          {
            name: 'ingredient_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Ingredient identifier',
          },
          {
            name: 'dietary_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Dietary type (e.g., vegan, vegetarian, keto, paleo)',
          },
          {
            name: 'dietary_category',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Dietary category (e.g., lifestyle, medical, religious)',
          },
          {
            name: 'compliance_level',
            type: 'enum',
            enum: ['compliant', 'non_compliant', 'conditional', 'unknown'],
            default: "'compliant'",
            isNullable: false,
            comment: 'Compliance level with dietary type',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Additional notes about dietary compliance',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Dietary type active status',
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

    // Unique constraint for ingredient dietary type combination
    await queryRunner.query(`
      ALTER TABLE ingredient_dietary_types 
      ADD CONSTRAINT uk_ingredient_dietary_types_ingredient_type 
      UNIQUE (ingredient_id, dietary_type)
    `);

    // Indexes
    await queryRunner.createIndex(
      'ingredient_dietary_types',
      new TableIndex({
        name: 'idx_ingredient_dietary_types_ingredient_id',
        columnNames: ['ingredient_id'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_dietary_types',
      new TableIndex({
        name: 'idx_ingredient_dietary_types_type',
        columnNames: ['dietary_type'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_dietary_types',
      new TableIndex({
        name: 'idx_ingredient_dietary_types_category',
        columnNames: ['dietary_category'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_dietary_types',
      new TableIndex({
        name: 'idx_ingredient_dietary_types_compliance',
        columnNames: ['compliance_level'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_dietary_types',
      new TableIndex({
        name: 'idx_ingredient_dietary_types_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_dietary_types',
      new TableIndex({
        name: 'idx_ingredient_dietary_types_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'ingredient_dietary_types',
      new TableIndex({
        name: 'idx_ingredient_dietary_types_ingredient_active',
        columnNames: ['ingredient_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_dietary_types',
      new TableIndex({
        name: 'idx_ingredient_dietary_types_type_compliance',
        columnNames: ['dietary_type', 'compliance_level'],
      }),
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'ingredient_dietary_types',
      new TableForeignKey({
        name: 'fk_ingredient_dietary_types_ingredient_id',
        columnNames: ['ingredient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ingredients',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE ingredient_dietary_types IS 'Ingredient dietary type classifications';
      COMMENT ON COLUMN ingredient_dietary_types.id IS 'Unique ingredient dietary type identifier (UUID)';
      COMMENT ON COLUMN ingredient_dietary_types.dietary_type IS 'Dietary type (unique per ingredient)';
      COMMENT ON COLUMN ingredient_dietary_types.compliance_level IS 'Compliance level with dietary type';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey(
      'ingredient_dietary_types',
      'fk_ingredient_dietary_types_ingredient_id',
    );

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE ingredient_dietary_types 
      DROP CONSTRAINT uk_ingredient_dietary_types_ingredient_type
    `);

    // Drop indexes
    await queryRunner.dropIndex(
      'ingredient_dietary_types',
      'idx_ingredient_dietary_types_ingredient_id',
    );
    await queryRunner.dropIndex('ingredient_dietary_types', 'idx_ingredient_dietary_types_type');
    await queryRunner.dropIndex(
      'ingredient_dietary_types',
      'idx_ingredient_dietary_types_category',
    );
    await queryRunner.dropIndex(
      'ingredient_dietary_types',
      'idx_ingredient_dietary_types_compliance',
    );
    await queryRunner.dropIndex(
      'ingredient_dietary_types',
      'idx_ingredient_dietary_types_is_active',
    );
    await queryRunner.dropIndex(
      'ingredient_dietary_types',
      'idx_ingredient_dietary_types_deleted_at',
    );
    await queryRunner.dropIndex(
      'ingredient_dietary_types',
      'idx_ingredient_dietary_types_ingredient_active',
    );
    await queryRunner.dropIndex(
      'ingredient_dietary_types',
      'idx_ingredient_dietary_types_type_compliance',
    );

    // Drop table
    await queryRunner.dropTable('ingredient_dietary_types');
  }
}
