import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Shopping Lists Table
 *
 * This migration creates the shopping_lists table for shopping list management,
 * including metadata, sharing, analytics, and audit fields.
 */
export class CreateShoppingListsTable1704067620000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shopping_lists',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique shopping list identifier',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Owner user identifier',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
            comment: 'Shopping list name',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Shopping list description',
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'List visibility (public/private)',
          },
          {
            name: 'estimated_total',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
            comment: 'Estimated total cost',
          },
          {
            name: 'items_count',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of items in the list',
          },
          {
            name: 'completed_items_count',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of completed items',
          },
          {
            name: 'share_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Shareable URL for the list',
          },
          {
            name: 'shared_with',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of user IDs the list is shared with',
          },
          {
            name: 'tags',
            type: 'jsonb',
            isNullable: true,
            comment: 'Array of tags for the list',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'List category',
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high'],
            default: "'medium'",
            isNullable: false,
            comment: 'List priority',
          },
          {
            name: 'analytics',
            type: 'jsonb',
            isNullable: true,
            comment: 'Analytics data for the list',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional list metadata',
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
      'shopping_lists',
      new TableIndex({
        name: 'idx_shopping_lists_user_id',
        columnNames: ['user_id'],
      }),
    );
    await queryRunner.createIndex(
      'shopping_lists',
      new TableIndex({
        name: 'idx_shopping_lists_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'shopping_lists',
      new TableIndex({
        name: 'idx_shopping_lists_is_public',
        columnNames: ['is_public'],
      }),
    );
    await queryRunner.createIndex(
      'shopping_lists',
      new TableIndex({
        name: 'idx_shopping_lists_priority',
        columnNames: ['priority'],
      }),
    );
    await queryRunner.createIndex(
      'shopping_lists',
      new TableIndex({
        name: 'idx_shopping_lists_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    // Composite
    await queryRunner.createIndex(
      'shopping_lists',
      new TableIndex({
        name: 'idx_shopping_lists_user_public',
        columnNames: ['user_id', 'is_public'],
      }),
    );
    // FK
    await queryRunner.createForeignKey(
      'shopping_lists',
      new TableForeignKey({
        name: 'fk_shopping_lists_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE shopping_lists IS 'Shopping list management table';
      COMMENT ON COLUMN shopping_lists.id IS 'Unique shopping list identifier (UUID)';
      COMMENT ON COLUMN shopping_lists.analytics IS 'Analytics data for the list';
    `);
  }
  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('shopping_lists', 'fk_shopping_lists_user_id');
    await queryRunner.dropIndex('shopping_lists', 'idx_shopping_lists_user_id');
    await queryRunner.dropIndex('shopping_lists', 'idx_shopping_lists_name');
    await queryRunner.dropIndex('shopping_lists', 'idx_shopping_lists_is_public');
    await queryRunner.dropIndex('shopping_lists', 'idx_shopping_lists_priority');
    await queryRunner.dropIndex('shopping_lists', 'idx_shopping_lists_deleted_at');
    await queryRunner.dropIndex('shopping_lists', 'idx_shopping_lists_user_public');
    await queryRunner.dropTable('shopping_lists');
  }
}
