import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAddressAndOrders1735500000000 implements MigrationInterface {
  name = 'InitAddressAndOrders1735500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "order_status_enum" AS ENUM (
          'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "payment_status_enum" AS ENUM (
          'PENDING', 'PAID', 'FAILED', 'REFUNDED'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "payment_method_enum" AS ENUM (
          'COD', 'BANK_TRANSFER', 'CARD', 'E_WALLET'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "addresses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "recipient_name" varchar(150) NOT NULL,
        "phone" varchar(50) NOT NULL,
        "street_address" varchar(255) NOT NULL,
        "ward" varchar(100) NOT NULL,
        "district" varchar(100) NOT NULL,
        "city" varchar(100) NOT NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_addresses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_addresses_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_addresses_user_id" ON "addresses" ("user_id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_number" varchar(50) NOT NULL,
        "user_id" uuid NOT NULL,
        "status" "order_status_enum" NOT NULL DEFAULT 'PENDING',
        "payment_status" "payment_status_enum" NOT NULL DEFAULT 'PENDING',
        "payment_method" "payment_method_enum" NOT NULL DEFAULT 'COD',
        "shipping_recipient_name" varchar(150) NOT NULL,
        "shipping_phone" varchar(50) NOT NULL,
        "shipping_street_address" varchar(255) NOT NULL,
        "shipping_ward" varchar(100) NOT NULL,
        "shipping_district" varchar(100) NOT NULL,
        "shipping_city" varchar(100) NOT NULL,
        "subtotal" decimal(12,2) NOT NULL,
        "shipping_fee" decimal(12,2) NOT NULL DEFAULT 0,
        "discount_amount" decimal(12,2) NOT NULL DEFAULT 0,
        "total_amount" decimal(12,2) NOT NULL,
        "note" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_orders" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number"),
        CONSTRAINT "FK_orders_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orders_user_id" ON "orders" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orders_status" ON "orders" ("status")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "product_name" varchar(255) NOT NULL,
        "product_sku" varchar(50) NOT NULL,
        "unit_price" decimal(12,2) NOT NULL,
        "quantity" int NOT NULL,
        "total_price" decimal(12,2) NOT NULL,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id")
          REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_order_items_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_order_items_order_id" ON "order_items" ("order_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "addresses"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "order_status_enum"`);
  }
}
