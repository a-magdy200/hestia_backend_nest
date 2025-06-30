import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Ingredient Substitutions Table
 *
 * This migration creates the ingredient_substitutions table to replace the JSON substitutions
 * column in ingredients table, with proper relational structure.
 */
export class CreateIngredientSubstitutionsTable1704068160000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ingredient_substitutions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique ingredient substitution identifier',
          },
          {
            name: 'original_ingredient_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Original ingredient identifier',
          },
          {
            name: 'substitute_ingredient_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Substitute ingredient identifier',
          },
          {
            name: 'substitution_ratio',
            type: 'decimal',
            precision: 10,
            scale: 3,
            isNullable: false,
            comment: 'Substitution ratio (how much substitute to use)',
          },
          {
            name: 'substitution_notes',
            type: 'text',
            isNullable: true,
            comment: 'Notes about the substitution',
          },
          {
            name: 'confidence_score',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0.5,
            isNullable: false,
            comment: 'Confidence score for the substitution (0.00-1.00)',
          },
          {
            name: 'substitution_type',
            type: 'enum',
            enum: ['direct', 'functional', 'flavor', 'texture', 'nutritional'],
            default: "'direct'",
            isNullable: false,
            comment: 'Type of substitution',
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether the substitution has been verified',
          },
          {
            name: 'verified_by',
            type: 'uuid',
            isNullable: true,
            comment: 'User who verified the substitution',
          },
          {
            name: 'verified_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Verification timestamp',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Substitution active status',
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

    // Unique constraint for ingredient substitution combination
    await queryRunner.query(`
      ALTER TABLE ingredient_substitutions 
      ADD CONSTRAINT uk_ingredient_substitutions_original_substitute 
      UNIQUE (original_ingredient_id, substitute_ingredient_id)
    `);

    // Indexes
    await queryRunner.createIndex(
      'ingredient_substitutions',
      new TableIndex({
        name: 'idx_ingredient_substitutions_original_id',
        columnNames: ['original_ingredient_id'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_substitutions',
      new TableIndex({
        name: 'idx_ingredient_substitutions_substitute_id',
        columnNames: ['substitute_ingredient_id'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_substitutions',
      new TableIndex({
        name: 'idx_ingredient_substitutions_type',
        columnNames: ['substitution_type'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_substitutions',
      new TableIndex({
        name: 'idx_ingredient_substitutions_confidence',
        columnNames: ['confidence_score'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_substitutions',
      new TableIndex({
        name: 'idx_ingredient_substitutions_is_verified',
        columnNames: ['is_verified'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_substitutions',
      new TableIndex({
        name: 'idx_ingredient_substitutions_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_substitutions',
      new TableIndex({
        name: 'idx_ingredient_substitutions_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'ingredient_substitutions',
      new TableIndex({
        name: 'idx_ingredient_substitutions_original_active',
        columnNames: ['original_ingredient_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'ingredient_substitutions',
      new TableIndex({
        name: 'idx_ingredient_substitutions_confidence_verified',
        columnNames: ['confidence_score', 'is_verified'],
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'ingredient_substitutions',
      new TableForeignKey({
        name: 'fk_ingredient_substitutions_original_id',
        columnNames: ['original_ingredient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ingredients',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'ingredient_substitutions',
      new TableForeignKey({
        name: 'fk_ingredient_substitutions_substitute_id',
        columnNames: ['substitute_ingredient_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ingredients',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'ingredient_substitutions',
      new TableForeignKey({
        name: 'fk_ingredient_substitutions_verified_by',
        columnNames: ['verified_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE ingredient_substitutions IS 'Ingredient substitution mappings';
      COMMENT ON COLUMN ingredient_substitutions.id IS 'Unique ingredient substitution identifier (UUID)';
      COMMENT ON COLUMN ingredient_substitutions.substitution_ratio IS 'Substitution ratio (how much substitute to use)';
      COMMENT ON COLUMN ingredient_substitutions.confidence_score IS 'Confidence score for the substitution (0.00-1.00)';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey(
      'ingredient_substitutions',
      'fk_ingredient_substitutions_original_id',
    );
    await queryRunner.dropForeignKey(
      'ingredient_substitutions',
      'fk_ingredient_substitutions_substitute_id',
    );
    await queryRunner.dropForeignKey(
      'ingredient_substitutions',
      'fk_ingredient_substitutions_verified_by',
    );

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE ingredient_substitutions 
      DROP CONSTRAINT uk_ingredient_substitutions_original_substitute
    `);

    // Drop indexes
    await queryRunner.dropIndex(
      'ingredient_substitutions',
      'idx_ingredient_substitutions_original_id',
    );
    await queryRunner.dropIndex(
      'ingredient_substitutions',
      'idx_ingredient_substitutions_substitute_id',
    );
    await queryRunner.dropIndex('ingredient_substitutions', 'idx_ingredient_substitutions_type');
    await queryRunner.dropIndex(
      'ingredient_substitutions',
      'idx_ingredient_substitutions_confidence',
    );
    await queryRunner.dropIndex(
      'ingredient_substitutions',
      'idx_ingredient_substitutions_is_verified',
    );
    await queryRunner.dropIndex(
      'ingredient_substitutions',
      'idx_ingredient_substitutions_is_active',
    );
    await queryRunner.dropIndex(
      'ingredient_substitutions',
      'idx_ingredient_substitutions_deleted_at',
    );
    await queryRunner.dropIndex(
      'ingredient_substitutions',
      'idx_ingredient_substitutions_original_active',
    );
    await queryRunner.dropIndex(
      'ingredient_substitutions',
      'idx_ingredient_substitutions_confidence_verified',
    );

    // Drop table
    await queryRunner.dropTable('ingredient_substitutions');
  }
}
