import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Item Maintenance Table
 *
 * This migration creates the item_maintenance table to replace the JSON maintenance
 * column in items table, with proper relational structure for comprehensive maintenance and value tracking data.
 */
export class CreateItemMaintenanceTable1704068400000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'item_maintenance',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique item maintenance identifier',
          },
          {
            name: 'item_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Item identifier',
          },
          {
            name: 'maintenance_type',
            type: 'enum',
            enum: [
              'cleaning',
              'repair',
              'replacement',
              'inspection',
              'calibration',
              'upgrade',
              'other',
            ],
            isNullable: false,
            comment: 'Type of maintenance required',
          },
          {
            name: 'maintenance_frequency',
            type: 'enum',
            enum: [
              'daily',
              'weekly',
              'monthly',
              'quarterly',
              'biannual',
              'annual',
              'as_needed',
              'never',
            ],
            default: "'as_needed'",
            isNullable: false,
            comment: 'How often maintenance is required',
          },
          {
            name: 'last_maintenance_date',
            type: 'timestamp',
            isNullable: true,
            comment: 'Date of last maintenance',
          },
          {
            name: 'next_maintenance_date',
            type: 'timestamp',
            isNullable: true,
            comment: 'Date of next scheduled maintenance',
          },
          {
            name: 'maintenance_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Cost of maintenance',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            isNullable: false,
            comment: 'Currency code for maintenance cost',
          },
          {
            name: 'maintenance_notes',
            type: 'text',
            isNullable: true,
            comment: 'Additional notes about maintenance',
          },
          {
            name: 'maintenance_provider',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Service provider for maintenance',
          },
          {
            name: 'provider_contact',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Contact information for maintenance provider',
          },
          {
            name: 'warranty_expiry',
            type: 'timestamp',
            isNullable: true,
            comment: 'Warranty expiration date',
          },
          {
            name: 'warranty_provider',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Warranty provider',
          },
          {
            name: 'warranty_terms',
            type: 'text',
            isNullable: true,
            comment: 'Warranty terms and conditions',
          },
          {
            name: 'purchase_date',
            type: 'timestamp',
            isNullable: true,
            comment: 'Date of purchase',
          },
          {
            name: 'purchase_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Original purchase price',
          },
          {
            name: 'purchase_currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            isNullable: false,
            comment: 'Currency code for purchase price',
          },
          {
            name: 'current_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Current estimated value',
          },
          {
            name: 'value_currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            isNullable: false,
            comment: 'Currency code for current value',
          },
          {
            name: 'depreciation_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: 'Annual depreciation rate percentage',
          },
          {
            name: 'expected_lifespan_years',
            type: 'integer',
            isNullable: true,
            comment: 'Expected lifespan in years',
          },
          {
            name: 'condition_rating',
            type: 'enum',
            enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
            default: "'good'",
            isNullable: false,
            comment: 'Current condition rating',
          },
          {
            name: 'condition_notes',
            type: 'text',
            isNullable: true,
            comment: 'Notes about current condition',
          },
          {
            name: 'replacement_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Cost to replace the item',
          },
          {
            name: 'replacement_currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            isNullable: false,
            comment: 'Currency code for replacement cost',
          },
          {
            name: 'is_insured',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether the item is insured',
          },
          {
            name: 'insurance_provider',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Insurance provider',
          },
          {
            name: 'insurance_policy_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Insurance policy number',
          },
          {
            name: 'insurance_coverage_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Insurance coverage amount',
          },
          {
            name: 'insurance_currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            isNullable: false,
            comment: 'Currency code for insurance coverage',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Maintenance record active status',
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

    // Unique constraint for item maintenance
    await queryRunner.query(`
      ALTER TABLE item_maintenance 
      ADD CONSTRAINT uk_item_maintenance_item 
      UNIQUE (item_id)
    `);

    // Indexes
    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_item_id',
        columnNames: ['item_id'],
      }),
    );

    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_type',
        columnNames: ['maintenance_type'],
      }),
    );

    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_frequency',
        columnNames: ['maintenance_frequency'],
      }),
    );

    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_next_date',
        columnNames: ['next_maintenance_date'],
      }),
    );

    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_condition',
        columnNames: ['condition_rating'],
      }),
    );

    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_warranty',
        columnNames: ['warranty_expiry'],
      }),
    );

    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_item_active',
        columnNames: ['item_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_next_active',
        columnNames: ['next_maintenance_date', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'item_maintenance',
      new TableIndex({
        name: 'idx_item_maintenance_condition_active',
        columnNames: ['condition_rating', 'is_active'],
      }),
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'item_maintenance',
      new TableForeignKey({
        name: 'fk_item_maintenance_item_id',
        columnNames: ['item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'items',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE item_maintenance IS 'Item maintenance, value tracking, and lifecycle management';
      COMMENT ON COLUMN item_maintenance.id IS 'Unique item maintenance identifier (UUID)';
      COMMENT ON COLUMN item_maintenance.maintenance_type IS 'Type of maintenance required';
      COMMENT ON COLUMN item_maintenance.maintenance_frequency IS 'How often maintenance is required';
      COMMENT ON COLUMN item_maintenance.condition_rating IS 'Current condition rating';
      COMMENT ON COLUMN item_maintenance.current_value IS 'Current estimated value';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey('item_maintenance', 'fk_item_maintenance_item_id');

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE item_maintenance 
      DROP CONSTRAINT uk_item_maintenance_item
    `);

    // Drop indexes
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_item_id');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_type');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_frequency');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_next_date');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_condition');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_warranty');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_is_active');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_deleted_at');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_item_active');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_next_active');
    await queryRunner.dropIndex('item_maintenance', 'idx_item_maintenance_condition_active');

    // Drop table
    await queryRunner.dropTable('item_maintenance');
  }
}
