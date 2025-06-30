import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Shopping List Analytics Table
 *
 * This migration creates the shopping_list_analytics table to replace the JSON analytics
 * column in shopping_lists table, with proper relational structure for comprehensive shopping analytics and insights data.
 */
export class CreateShoppingListAnalyticsTable1704068460000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shopping_list_analytics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique shopping list analytics identifier',
          },
          {
            name: 'shopping_list_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Shopping list identifier',
          },
          {
            name: 'total_items',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Total number of items in the list',
          },
          {
            name: 'completed_items',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of completed items',
          },
          {
            name: 'pending_items',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of pending items',
          },
          {
            name: 'estimated_total_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Estimated total cost of all items',
          },
          {
            name: 'actual_total_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Actual total cost after shopping',
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            isNullable: false,
            comment: 'Currency code for costs',
          },
          {
            name: 'budget_limit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Budget limit for this shopping list',
          },
          {
            name: 'budget_utilization_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: 'Percentage of budget utilized',
          },
          {
            name: 'estimated_shopping_time_minutes',
            type: 'integer',
            isNullable: true,
            comment: 'Estimated time to complete shopping',
          },
          {
            name: 'actual_shopping_time_minutes',
            type: 'integer',
            isNullable: true,
            comment: 'Actual time taken to complete shopping',
          },
          {
            name: 'shopping_start_time',
            type: 'timestamp',
            isNullable: true,
            comment: 'When shopping started',
          },
          {
            name: 'shopping_end_time',
            type: 'timestamp',
            isNullable: true,
            comment: 'When shopping completed',
          },
          {
            name: 'preferred_store',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Preferred store for shopping',
          },
          {
            name: 'actual_store',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Store where shopping was actually done',
          },
          {
            name: 'store_location',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Store location or address',
          },
          {
            name: 'shopping_method',
            type: 'enum',
            enum: ['in_store', 'online', 'curbside', 'delivery', 'hybrid'],
            default: "'in_store'",
            isNullable: false,
            comment: 'Method used for shopping',
          },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['cash', 'credit_card', 'debit_card', 'mobile_payment', 'check', 'other'],
            isNullable: true,
            comment: 'Payment method used',
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Total discount received',
          },
          {
            name: 'discount_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: 'Discount percentage',
          },
          {
            name: 'tax_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Tax amount',
          },
          {
            name: 'tax_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: 'Tax percentage',
          },
          {
            name: 'savings_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Total savings (compared to regular prices)',
          },
          {
            name: 'savings_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
            comment: 'Savings percentage',
          },
          {
            name: 'coupons_used',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of coupons used',
          },
          {
            name: 'coupon_savings',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Total savings from coupons',
          },
          {
            name: 'loyalty_points_earned',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Loyalty points earned',
          },
          {
            name: 'loyalty_points_redeemed',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Loyalty points redeemed',
          },
          {
            name: 'loyalty_savings',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Savings from loyalty program',
          },
          {
            name: 'items_on_sale',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of items purchased on sale',
          },
          {
            name: 'sale_savings',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Total savings from sale items',
          },
          {
            name: 'items_substituted',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of items substituted',
          },
          {
            name: 'substitution_savings',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Savings from substitutions',
          },
          {
            name: 'items_not_found',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of items not found',
          },
          {
            name: 'not_found_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: 'Cost of items not found',
          },
          {
            name: 'shopping_efficiency_score',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
            comment: 'Shopping efficiency score (0-1)',
          },
          {
            name: 'budget_efficiency_score',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
            comment: 'Budget efficiency score (0-1)',
          },
          {
            name: 'time_efficiency_score',
            type: 'decimal',
            precision: 3,
            scale: 2,
            isNullable: true,
            comment: 'Time efficiency score (0-1)',
          },
          {
            name: 'overall_satisfaction_rating',
            type: 'integer',
            isNullable: true,
            comment: 'Overall satisfaction rating (1-5)',
          },
          {
            name: 'satisfaction_notes',
            type: 'text',
            isNullable: true,
            comment: 'Notes about shopping experience',
          },
          {
            name: 'weather_conditions',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Weather conditions during shopping',
          },
          {
            name: 'traffic_conditions',
            type: 'enum',
            enum: ['light', 'moderate', 'heavy', 'very_heavy'],
            isNullable: true,
            comment: 'Traffic conditions',
          },
          {
            name: 'parking_difficulty',
            type: 'enum',
            enum: ['easy', 'moderate', 'difficult', 'very_difficult'],
            isNullable: true,
            comment: 'Parking difficulty level',
          },
          {
            name: 'store_crowding',
            type: 'enum',
            enum: ['empty', 'light', 'moderate', 'crowded', 'very_crowded'],
            isNullable: true,
            comment: 'Store crowding level',
          },
          {
            name: 'staff_helpfulness_rating',
            type: 'integer',
            isNullable: true,
            comment: 'Staff helpfulness rating (1-5)',
          },
          {
            name: 'checkout_wait_time_minutes',
            type: 'integer',
            isNullable: true,
            comment: 'Checkout wait time in minutes',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Analytics record active status',
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

    // Unique constraint for shopping list analytics
    await queryRunner.query(`
      ALTER TABLE shopping_list_analytics 
      ADD CONSTRAINT uk_shopping_list_analytics_list 
      UNIQUE (shopping_list_id)
    `);

    // Indexes
    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_list_id',
        columnNames: ['shopping_list_id'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_total_cost',
        columnNames: ['actual_total_cost'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_shopping_time',
        columnNames: ['actual_shopping_time_minutes'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_shopping_method',
        columnNames: ['shopping_method'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_payment_method',
        columnNames: ['payment_method'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_satisfaction',
        columnNames: ['overall_satisfaction_rating'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_efficiency',
        columnNames: ['shopping_efficiency_score'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_list_active',
        columnNames: ['shopping_list_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_method_cost',
        columnNames: ['shopping_method', 'actual_total_cost'],
      }),
    );

    await queryRunner.createIndex(
      'shopping_list_analytics',
      new TableIndex({
        name: 'idx_shopping_list_analytics_satisfaction_active',
        columnNames: ['overall_satisfaction_rating', 'is_active'],
      }),
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'shopping_list_analytics',
      new TableForeignKey({
        name: 'fk_shopping_list_analytics_list_id',
        columnNames: ['shopping_list_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shopping_lists',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE shopping_list_analytics IS 'Comprehensive shopping list analytics and insights';
      COMMENT ON COLUMN shopping_list_analytics.id IS 'Unique shopping list analytics identifier (UUID)';
      COMMENT ON COLUMN shopping_list_analytics.actual_total_cost IS 'Actual total cost after shopping';
      COMMENT ON COLUMN shopping_list_analytics.shopping_efficiency_score IS 'Shopping efficiency score (0-1)';
      COMMENT ON COLUMN shopping_list_analytics.overall_satisfaction_rating IS 'Overall satisfaction rating (1-5)';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey(
      'shopping_list_analytics',
      'fk_shopping_list_analytics_list_id',
    );

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE shopping_list_analytics 
      DROP CONSTRAINT uk_shopping_list_analytics_list
    `);

    // Drop indexes
    await queryRunner.dropIndex('shopping_list_analytics', 'idx_shopping_list_analytics_list_id');
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_total_cost',
    );
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_shopping_time',
    );
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_shopping_method',
    );
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_payment_method',
    );
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_satisfaction',
    );
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_efficiency',
    );
    await queryRunner.dropIndex('shopping_list_analytics', 'idx_shopping_list_analytics_is_active');
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_deleted_at',
    );
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_list_active',
    );
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_method_cost',
    );
    await queryRunner.dropIndex(
      'shopping_list_analytics',
      'idx_shopping_list_analytics_satisfaction_active',
    );

    // Drop table
    await queryRunner.dropTable('shopping_list_analytics');
  }
}
