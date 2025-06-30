import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Recipe Steps Table
 *
 * This migration creates the recipe_steps table to replace the JSON instructions
 * column in recipes table, with proper relational structure for step-by-step instructions.
 */
export class CreateRecipeStepsTable1704068220000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'recipe_steps',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique recipe step identifier',
          },
          {
            name: 'recipe_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Recipe identifier',
          },
          {
            name: 'step_number',
            type: 'integer',
            isNullable: false,
            comment: 'Step order number',
          },
          {
            name: 'instruction',
            type: 'text',
            isNullable: false,
            comment: 'Step instruction text',
          },
          {
            name: 'duration_minutes',
            type: 'integer',
            isNullable: true,
            comment: 'Estimated duration in minutes',
          },
          {
            name: 'difficulty',
            type: 'enum',
            enum: ['easy', 'medium', 'hard', 'expert'],
            default: "'medium'",
            isNullable: false,
            comment: 'Step difficulty level',
          },
          {
            name: 'tips',
            type: 'text',
            isNullable: true,
            comment: 'Additional tips for this step',
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Step image URL',
          },
          {
            name: 'video_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Step video URL',
          },
          {
            name: 'temperature',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: 'Required temperature (if applicable)',
          },
          {
            name: 'temperature_unit',
            type: 'enum',
            enum: ['celsius', 'fahrenheit'],
            isNullable: true,
            comment: 'Temperature unit',
          },
          {
            name: 'is_critical',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether this step is critical to recipe success',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Step active status',
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

    // Unique constraint for recipe step number combination
    await queryRunner.query(`
      ALTER TABLE recipe_steps 
      ADD CONSTRAINT uk_recipe_steps_recipe_number 
      UNIQUE (recipe_id, step_number)
    `);

    // Indexes
    await queryRunner.createIndex(
      'recipe_steps',
      new TableIndex({
        name: 'idx_recipe_steps_recipe_id',
        columnNames: ['recipe_id'],
      }),
    );

    await queryRunner.createIndex(
      'recipe_steps',
      new TableIndex({
        name: 'idx_recipe_steps_step_number',
        columnNames: ['step_number'],
      }),
    );

    await queryRunner.createIndex(
      'recipe_steps',
      new TableIndex({
        name: 'idx_recipe_steps_difficulty',
        columnNames: ['difficulty'],
      }),
    );

    await queryRunner.createIndex(
      'recipe_steps',
      new TableIndex({
        name: 'idx_recipe_steps_is_critical',
        columnNames: ['is_critical'],
      }),
    );

    await queryRunner.createIndex(
      'recipe_steps',
      new TableIndex({
        name: 'idx_recipe_steps_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'recipe_steps',
      new TableIndex({
        name: 'idx_recipe_steps_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'recipe_steps',
      new TableIndex({
        name: 'idx_recipe_steps_recipe_active',
        columnNames: ['recipe_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'recipe_steps',
      new TableIndex({
        name: 'idx_recipe_steps_recipe_number_active',
        columnNames: ['recipe_id', 'step_number', 'is_active'],
      }),
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'recipe_steps',
      new TableForeignKey({
        name: 'fk_recipe_steps_recipe_id',
        columnNames: ['recipe_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'recipes',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE recipe_steps IS 'Recipe step-by-step instructions';
      COMMENT ON COLUMN recipe_steps.id IS 'Unique recipe step identifier (UUID)';
      COMMENT ON COLUMN recipe_steps.step_number IS 'Step order number (unique per recipe)';
      COMMENT ON COLUMN recipe_steps.instruction IS 'Step instruction text';
      COMMENT ON COLUMN recipe_steps.difficulty IS 'Step difficulty level';
      COMMENT ON COLUMN recipe_steps.is_critical IS 'Whether this step is critical to recipe success';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey('recipe_steps', 'fk_recipe_steps_recipe_id');

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE recipe_steps 
      DROP CONSTRAINT uk_recipe_steps_recipe_number
    `);

    // Drop indexes
    await queryRunner.dropIndex('recipe_steps', 'idx_recipe_steps_recipe_id');
    await queryRunner.dropIndex('recipe_steps', 'idx_recipe_steps_step_number');
    await queryRunner.dropIndex('recipe_steps', 'idx_recipe_steps_difficulty');
    await queryRunner.dropIndex('recipe_steps', 'idx_recipe_steps_is_critical');
    await queryRunner.dropIndex('recipe_steps', 'idx_recipe_steps_is_active');
    await queryRunner.dropIndex('recipe_steps', 'idx_recipe_steps_deleted_at');
    await queryRunner.dropIndex('recipe_steps', 'idx_recipe_steps_recipe_active');
    await queryRunner.dropIndex('recipe_steps', 'idx_recipe_steps_recipe_number_active');

    // Drop table
    await queryRunner.dropTable('recipe_steps');
  }
}
