import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Shopping List Items Table
 *
 * This migration creates the shopping_list_items table for shopping list item
 * management, including details, status, price, order, and audit fields.
 */
export class CreateShoppingListItemsTable1704067680000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shopping_list_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique shopping list item identifier',
          },
          {
            name: 'list_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Shopping list identifier',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
            comment: 'Item name',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            comment: 'Item quantity',
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Unit of measure',
          },
          {
            name: 'estimated_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Estimated price',
          },
          {
            name: 'actual_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Actual price paid',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Item category',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
            comment: 'Item notes',
          },
          {
            name: 'is_purchased',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Purchased status',
          },
          {
            name: 'order_index',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Order index for sorting',
          },
          {
            name: 'purchased_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Purchase timestamp',
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high'],
            default: "'medium'",
            isNullable: false,
            comment: 'Item priority',
          },
          {
            name: 'urgency',
            type: 'enum',
            enum: ['low', 'medium', 'high'],
            default: "'medium'",
            isNullable: false,
            comment: 'Item urgency',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional item metadata',
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
      'shopping_list_items',
      new TableIndex({
        name: 'idx_shopping_list_items_list_id',
        columnNames: ['list_id'],
      }),
    );
    await queryRunner.createIndex(
      'shopping_list_items',
      new TableIndex({
        name: 'idx_shopping_list_items_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'shopping_list_items',
      new TableIndex({
        name: 'idx_shopping_list_items_is_purchased',
        columnNames: ['is_purchased'],
      }),
    );
    await queryRunner.createIndex(
      'shopping_list_items',
      new TableIndex({
        name: 'idx_shopping_list_items_priority',
        columnNames: ['priority'],
      }),
    );
    await queryRunner.createIndex(
      'shopping_list_items',
      new TableIndex({
        name: 'idx_shopping_list_items_urgency',
        columnNames: ['urgency'],
      }),
    );
    await queryRunner.createIndex(
      'shopping_list_items',
      new TableIndex({
        name: 'idx_shopping_list_items_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    // Composite
    await queryRunner.createIndex(
      'shopping_list_items',
      new TableIndex({
        name: 'idx_shopping_list_items_list_purchased',
        columnNames: ['list_id', 'is_purchased'],
      }),
    );
    // FK
    await queryRunner.createForeignKey(
      'shopping_list_items',
      new TableForeignKey({
        name: 'fk_shopping_list_items_list_id',
        columnNames: ['list_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shopping_lists',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE shopping_list_items IS 'Shopping list item management table';
      COMMENT ON COLUMN shopping_list_items.id IS 'Unique shopping list item identifier (UUID)';
    `);
  }
  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('shopping_list_items', 'fk_shopping_list_items_list_id');
    await queryRunner.dropIndex('shopping_list_items', 'idx_shopping_list_items_list_id');
    await queryRunner.dropIndex('shopping_list_items', 'idx_shopping_list_items_name');
    await queryRunner.dropIndex('shopping_list_items', 'idx_shopping_list_items_is_purchased');
    await queryRunner.dropIndex('shopping_list_items', 'idx_shopping_list_items_priority');
    await queryRunner.dropIndex('shopping_list_items', 'idx_shopping_list_items_urgency');
    await queryRunner.dropIndex('shopping_list_items', 'idx_shopping_list_items_deleted_at');
    await queryRunner.dropIndex('shopping_list_items', 'idx_shopping_list_items_list_purchased');
    await queryRunner.dropTable('shopping_list_items');
  }
}
