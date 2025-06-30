import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Items Table
 *
 * This migration creates the items table for inventory management, including
 * categories, status, priority, condition, location, purchase, maintenance, value, and audit fields.
 */
export class CreateItemsTable1704067740000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique item identifier',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
            comment: 'Item name',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Item description',
          },
          {
            name: 'category_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Item category identifier',
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'electronics',
              'kitchen_equipment',
              'tools',
              'furniture',
              'clothing',
              'books',
              'other',
            ],
            default: "'other'",
            isNullable: false,
            comment: 'Item type',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'broken', 'lost', 'stolen', 'sold', 'donated'],
            default: "'active'",
            isNullable: false,
            comment: 'Item status',
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'critical'],
            default: "'medium'",
            isNullable: false,
            comment: 'Item priority',
          },
          {
            name: 'condition',
            type: 'enum',
            enum: ['new', 'excellent', 'good', 'fair', 'poor', 'broken'],
            default: "'good'",
            isNullable: false,
            comment: 'Item condition',
          },
          {
            name: 'location',
            type: 'varchar',
            length: '200',
            isNullable: true,
            comment: 'Item location/storage info',
          },
          {
            name: 'purchase_info',
            type: 'jsonb',
            isNullable: true,
            comment: 'Purchase information (date, price, vendor, etc.)',
          },
          {
            name: 'maintenance_info',
            type: 'jsonb',
            isNullable: true,
            comment: 'Maintenance schedule and history',
          },
          {
            name: 'value_info',
            type: 'jsonb',
            isNullable: true,
            comment: 'Value tracking and depreciation info',
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
      'items',
      new TableIndex({
        name: 'idx_items_name',
        columnNames: ['name'],
      }),
    );
    await queryRunner.createIndex(
      'items',
      new TableIndex({
        name: 'idx_items_category_id',
        columnNames: ['category_id'],
      }),
    );
    await queryRunner.createIndex(
      'items',
      new TableIndex({
        name: 'idx_items_type',
        columnNames: ['type'],
      }),
    );
    await queryRunner.createIndex(
      'items',
      new TableIndex({
        name: 'idx_items_status',
        columnNames: ['status'],
      }),
    );
    await queryRunner.createIndex(
      'items',
      new TableIndex({
        name: 'idx_items_priority',
        columnNames: ['priority'],
      }),
    );
    await queryRunner.createIndex(
      'items',
      new TableIndex({
        name: 'idx_items_condition',
        columnNames: ['condition'],
      }),
    );
    await queryRunner.createIndex(
      'items',
      new TableIndex({
        name: 'idx_items_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );
    // Composite
    await queryRunner.createIndex(
      'items',
      new TableIndex({
        name: 'idx_items_status_priority',
        columnNames: ['status', 'priority'],
      }),
    );
    // FK
    await queryRunner.createForeignKey(
      'items',
      new TableForeignKey({
        name: 'fk_items_category_id',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'ingredient_categories',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE items IS 'Inventory management table';
      COMMENT ON COLUMN items.id IS 'Unique item identifier (UUID)';
      COMMENT ON COLUMN items.maintenance_info IS 'Maintenance schedule and history';
      COMMENT ON COLUMN items.value_info IS 'Value tracking and depreciation info';
    `);
  }
  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('items', 'fk_items_category_id');
    await queryRunner.dropIndex('items', 'idx_items_name');
    await queryRunner.dropIndex('items', 'idx_items_category_id');
    await queryRunner.dropIndex('items', 'idx_items_type');
    await queryRunner.dropIndex('items', 'idx_items_status');
    await queryRunner.dropIndex('items', 'idx_items_priority');
    await queryRunner.dropIndex('items', 'idx_items_condition');
    await queryRunner.dropIndex('items', 'idx_items_deleted_at');
    await queryRunner.dropIndex('items', 'idx_items_status_priority');
    await queryRunner.dropTable('items');
  }
}
