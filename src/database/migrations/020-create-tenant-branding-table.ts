import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Migration: Create Tenant Branding Table
 *
 * This migration creates the tenant_branding table to replace the JSON branding
 * column in tenant_settings table, with proper relational structure for comprehensive branding data.
 */
export class CreateTenantBrandingTable1704068340000 implements MigrationInterface {
  /**
   *
   * @param queryRunner
   */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tenant_branding',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
            comment: 'Unique tenant branding identifier',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Tenant identifier',
          },
          {
            name: 'brand_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Brand name',
          },
          {
            name: 'brand_slogan',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Brand slogan or tagline',
          },
          {
            name: 'primary_color',
            type: 'varchar',
            length: '7',
            isNullable: true,
            comment: 'Primary brand color (hex format)',
          },
          {
            name: 'secondary_color',
            type: 'varchar',
            length: '7',
            isNullable: true,
            comment: 'Secondary brand color (hex format)',
          },
          {
            name: 'accent_color',
            type: 'varchar',
            length: '7',
            isNullable: true,
            comment: 'Accent brand color (hex format)',
          },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Logo image URL',
          },
          {
            name: 'logo_alt_text',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Logo alt text for accessibility',
          },
          {
            name: 'favicon_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Favicon URL',
          },
          {
            name: 'hero_image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Hero/banner image URL',
          },
          {
            name: 'hero_image_alt_text',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Hero image alt text for accessibility',
          },
          {
            name: 'website_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Brand website URL',
          },
          {
            name: 'contact_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Brand contact email',
          },
          {
            name: 'contact_phone',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Brand contact phone',
          },
          {
            name: 'social_media',
            type: 'jsonb',
            isNullable: true,
            comment: 'Social media links (JSON object)',
          },
          {
            name: 'font_family',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Primary font family',
          },
          {
            name: 'font_family_secondary',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Secondary font family',
          },
          {
            name: 'border_radius',
            type: 'integer',
            isNullable: true,
            comment: 'Border radius in pixels',
          },
          {
            name: 'shadow_intensity',
            type: 'enum',
            enum: ['none', 'light', 'medium', 'heavy'],
            default: "'medium'",
            isNullable: false,
            comment: 'Shadow intensity level',
          },
          {
            name: 'animation_speed',
            type: 'enum',
            enum: ['slow', 'normal', 'fast'],
            default: "'normal'",
            isNullable: false,
            comment: 'Animation speed preference',
          },
          {
            name: 'theme_mode',
            type: 'enum',
            enum: ['light', 'dark', 'auto'],
            default: "'auto'",
            isNullable: false,
            comment: 'Theme mode preference',
          },
          {
            name: 'custom_css',
            type: 'text',
            isNullable: true,
            comment: 'Custom CSS styles',
          },
          {
            name: 'custom_js',
            type: 'text',
            isNullable: true,
            comment: 'Custom JavaScript code',
          },
          {
            name: 'meta_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Meta title for SEO',
          },
          {
            name: 'meta_description',
            type: 'text',
            isNullable: true,
            comment: 'Meta description for SEO',
          },
          {
            name: 'meta_keywords',
            type: 'text',
            isNullable: true,
            comment: 'Meta keywords for SEO',
          },
          {
            name: 'og_image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: 'Open Graph image URL',
          },
          {
            name: 'og_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Open Graph title',
          },
          {
            name: 'og_description',
            type: 'text',
            isNullable: true,
            comment: 'Open Graph description',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
            comment: 'Branding active status',
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
            isNullable: false,
            comment: 'Whether this is the default branding',
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

    // Unique constraint for tenant branding
    await queryRunner.query(`
      ALTER TABLE tenant_branding 
      ADD CONSTRAINT uk_tenant_branding_tenant 
      UNIQUE (tenant_id)
    `);

    // Indexes
    await queryRunner.createIndex(
      'tenant_branding',
      new TableIndex({
        name: 'idx_tenant_branding_tenant_id',
        columnNames: ['tenant_id'],
      }),
    );

    await queryRunner.createIndex(
      'tenant_branding',
      new TableIndex({
        name: 'idx_tenant_branding_brand_name',
        columnNames: ['brand_name'],
      }),
    );

    await queryRunner.createIndex(
      'tenant_branding',
      new TableIndex({
        name: 'idx_tenant_branding_is_active',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'tenant_branding',
      new TableIndex({
        name: 'idx_tenant_branding_is_default',
        columnNames: ['is_default'],
      }),
    );

    await queryRunner.createIndex(
      'tenant_branding',
      new TableIndex({
        name: 'idx_tenant_branding_theme_mode',
        columnNames: ['theme_mode'],
      }),
    );

    await queryRunner.createIndex(
      'tenant_branding',
      new TableIndex({
        name: 'idx_tenant_branding_deleted_at',
        columnNames: ['deleted_at'],
      }),
    );

    // Composite indexes
    await queryRunner.createIndex(
      'tenant_branding',
      new TableIndex({
        name: 'idx_tenant_branding_tenant_active',
        columnNames: ['tenant_id', 'is_active'],
      }),
    );

    await queryRunner.createIndex(
      'tenant_branding',
      new TableIndex({
        name: 'idx_tenant_branding_active_default',
        columnNames: ['is_active', 'is_default'],
      }),
    );

    // Foreign key
    await queryRunner.createForeignKey(
      'tenant_branding',
      new TableForeignKey({
        name: 'fk_tenant_branding_tenant_id',
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenants',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Comments
    await queryRunner.query(`
      COMMENT ON TABLE tenant_branding IS 'Tenant branding and customization settings';
      COMMENT ON COLUMN tenant_branding.id IS 'Unique tenant branding identifier (UUID)';
      COMMENT ON COLUMN tenant_branding.brand_name IS 'Brand name';
      COMMENT ON COLUMN tenant_branding.primary_color IS 'Primary brand color (hex format)';
      COMMENT ON COLUMN tenant_branding.theme_mode IS 'Theme mode preference';
      COMMENT ON COLUMN tenant_branding.is_default IS 'Whether this is the default branding';
    `);
  }

  /**
   *
   * @param queryRunner
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.dropForeignKey('tenant_branding', 'fk_tenant_branding_tenant_id');

    // Drop unique constraint
    await queryRunner.query(`
      ALTER TABLE tenant_branding 
      DROP CONSTRAINT uk_tenant_branding_tenant
    `);

    // Drop indexes
    await queryRunner.dropIndex('tenant_branding', 'idx_tenant_branding_tenant_id');
    await queryRunner.dropIndex('tenant_branding', 'idx_tenant_branding_brand_name');
    await queryRunner.dropIndex('tenant_branding', 'idx_tenant_branding_is_active');
    await queryRunner.dropIndex('tenant_branding', 'idx_tenant_branding_is_default');
    await queryRunner.dropIndex('tenant_branding', 'idx_tenant_branding_theme_mode');
    await queryRunner.dropIndex('tenant_branding', 'idx_tenant_branding_deleted_at');
    await queryRunner.dropIndex('tenant_branding', 'idx_tenant_branding_tenant_active');
    await queryRunner.dropIndex('tenant_branding', 'idx_tenant_branding_active_default');

    // Drop table
    await queryRunner.dropTable('tenant_branding');
  }
}
