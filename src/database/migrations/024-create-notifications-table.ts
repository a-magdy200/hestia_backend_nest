import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Notifications Table
 *
 * This migration creates the notifications table to support comprehensive notification system
 * with different types, channels, and delivery status tracking.
 */
export class CreateNotificationsTable1704068580000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique notification identifier',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            comment: 'User identifier (recipient)',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Tenant identifier (for tenant-specific notifications)',
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'recipe_shared',
              'recipe_liked',
              'recipe_commented',
              'recipe_favorited',
              'ingredient_low_stock',
              'ingredient_expiring',
              'shopping_list_shared',
              'shopping_list_completed',
              'item_maintenance_due',
              'item_warranty_expiring',
              'system_update',
              'security_alert',
              'welcome',
              'profile_update',
              'preference_change',
              'subscription_expiring',
              'payment_failed',
              'achievement_unlocked',
              'goal_completed',
              'reminder',
              'invitation',
              'collaboration_request',
              'comment_reply',
              'mention',
              'follow',
              'custom',
              'other',
            ],
            isNullable: false,
            comment: 'Notification type',
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'recipe',
              'shopping',
              'inventory',
              'system',
              'social',
              'security',
              'reminder',
              'achievement',
            ],
            isNullable: false,
            comment: 'Notification category',
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'normal', 'high', 'urgent'],
            default: "'normal'",
            isNullable: false,
            comment: 'Notification priority level',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Notification title',
          },
          {
            name: 'message',
            type: 'text',
            isNullable: false,
            comment: 'Notification message content',
          },
          {
            name: 'short_message',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Short version of the message',
          },
          {
            name: 'data',
            type: 'jsonb',
            isNullable: true,
            comment: 'Additional notification data (JSON object)',
          },
          {
            name: 'action_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'URL for notification action',
          },
          {
            name: 'action_text',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Text for notification action button',
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Notification image URL',
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Notification icon name',
          },
          {
            name: 'channels',
            type: 'text',
            isNullable: false,
            comment: 'Delivery channels (JSON array: email, push, sms, in_app)',
          },
          {
            name: 'scheduled_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When notification should be sent (for scheduled notifications)',
          },
          {
            name: 'sent_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When notification was sent',
          },
          {
            name: 'delivered_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When notification was delivered',
          },
          {
            name: 'read_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When notification was read',
          },
          {
            name: 'clicked_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When notification action was clicked',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'scheduled', 'sending', 'sent', 'delivered', 'failed', 'cancelled'],
            default: "'pending'",
            isNullable: false,
            comment: 'Notification delivery status',
          },
          {
            name: 'delivery_attempts',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: 'Number of delivery attempts',
          },
          {
            name: 'max_attempts',
            type: 'integer',
            default: 3,
            isNullable: false,
            comment: 'Maximum delivery attempts',
          },
          {
            name: 'last_attempt_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Last delivery attempt timestamp',
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
            comment: 'Error message if delivery failed',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'When notification expires',
          },
          {
            name: 'is_silent',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether notification is silent (no sound/vibration)',
          },
          {
            name: 'is_persistent',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether notification persists until action taken',
          },
          {
            name: 'is_grouped',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether notification can be grouped with others',
          },
          {
            name: 'group_key',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Key for grouping similar notifications',
          },
          {
            name: 'related_entity_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Type of related entity (recipe, ingredient, etc.)',
          },
          {
            name: 'related_entity_id',
            type: 'uuid',
            isNullable: true,
            comment: 'ID of related entity',
          },
          {
            name: 'sender_id',
            type: 'uuid',
            isNullable: true,
            comment: 'User who triggered the notification',
          },
          {
            name: 'is_system',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether this is a system-generated notification',
          },
          {
            name: 'is_bulk',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether this is a bulk notification',
          },
          {
            name: 'batch_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Batch ID for bulk notifications',
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
      'notifications',
      new TableIndex({
        name: 'idx_notifications_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_type',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_category',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_priority',
        columnNames: ['priority'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_scheduled_at',
        columnNames: ['scheduled_at'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_sent_at',
        columnNames: ['sent_at'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_read_at',
        columnNames: ['read_at'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_expires_at',
        columnNames: ['expires_at'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_group_key',
        columnNames: ['group_key'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_batch_id',
        columnNames: ['batch_id'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_user_status',
        columnNames: ['user_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_user_read',
        columnNames: ['user_id', 'read_at'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_tenant_status',
        columnNames: ['tenant_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_scheduled_status',
        columnNames: ['scheduled_at', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_type_status',
        columnNames: ['type', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'notifications',
      new TableIndex({
        name: 'idx_notifications_priority_status',
        columnNames: ['priority', 'status'],
      }),
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'fk_notifications_user_id',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'fk_notifications_tenant_id',
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({
        name: 'fk_notifications_sender_id',
        columnNames: ['sender_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE notifications IS 'Comprehensive notification system with delivery tracking';
      COMMENT ON COLUMN notifications.id IS 'Unique notification identifier (UUID)';
      COMMENT ON COLUMN notifications.type IS 'Notification type';
      COMMENT ON COLUMN notifications.status IS 'Notification delivery status';
      COMMENT ON COLUMN notifications.channels IS 'Delivery channels (JSON array)';
      COMMENT ON COLUMN notifications.data IS 'Additional notification data (JSON object)';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('notifications', 'fk_notifications_sender_id');
    await queryRunner.dropForeignKey('notifications', 'fk_notifications_tenant_id');
    await queryRunner.dropForeignKey('notifications', 'fk_notifications_user_id');

    // Drop indexes
    await queryRunner.dropIndex('notifications', 'idx_notifications_user_id');
    await queryRunner.dropIndex('notifications', 'idx_notifications_tenant_id');
    await queryRunner.dropIndex('notifications', 'idx_notifications_type');
    await queryRunner.dropIndex('notifications', 'idx_notifications_category');
    await queryRunner.dropIndex('notifications', 'idx_notifications_priority');
    await queryRunner.dropIndex('notifications', 'idx_notifications_status');
    await queryRunner.dropIndex('notifications', 'idx_notifications_scheduled_at');
    await queryRunner.dropIndex('notifications', 'idx_notifications_sent_at');
    await queryRunner.dropIndex('notifications', 'idx_notifications_read_at');
    await queryRunner.dropIndex('notifications', 'idx_notifications_expires_at');
    await queryRunner.dropIndex('notifications', 'idx_notifications_group_key');
    await queryRunner.dropIndex('notifications', 'idx_notifications_batch_id');
    await queryRunner.dropIndex('notifications', 'idx_notifications_deleted_at');
    await queryRunner.dropIndex('notifications', 'idx_notifications_user_status');
    await queryRunner.dropIndex('notifications', 'idx_notifications_user_read');
    await queryRunner.dropIndex('notifications', 'idx_notifications_tenant_status');
    await queryRunner.dropIndex('notifications', 'idx_notifications_scheduled_status');
    await queryRunner.dropIndex('notifications', 'idx_notifications_type_status');
    await queryRunner.dropIndex('notifications', 'idx_notifications_priority_status');

    // Drop table
    await queryRunner.dropTable('notifications');
  }
}
