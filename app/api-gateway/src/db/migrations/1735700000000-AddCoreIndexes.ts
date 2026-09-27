import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCoreIndexes1735700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Indexes for orders table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "orders" ("user_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders" ("status");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_payment_status" ON "orders" ("payment_status");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders" ("created_at" DESC);
    `);

    // 2. Indexes for order_items table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_order_items_order_id" ON "order_items" ("order_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_order_items_product_id" ON "order_items" ("product_id");
    `);

    // 3. Indexes for inventory table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_inventory_product_id" ON "inventory" ("product_id");
    `);

    // 4. Indexes for products table
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_products_status" ON "products" ("status");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_products_category_id" ON "products" ("category_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_category_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_product_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_items_product_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_order_items_order_id";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_created_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_payment_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_status";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_user_id";`);
  }
}
