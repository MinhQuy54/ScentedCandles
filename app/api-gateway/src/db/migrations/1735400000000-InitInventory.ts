import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitInventory1735400000000 implements MigrationInterface {
  name = 'InitInventory1735400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "inventory_transaction_type_enum" AS ENUM (
          'ORDER', 'RETURN', 'ADJUSTMENT', 'RESERVE', 'RELEASE'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inventory" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "quantity_on_hand" int NOT NULL DEFAULT 0,
        "quantity_reserved" int NOT NULL DEFAULT 0,
        "low_stock_threshold" int NOT NULL DEFAULT 5,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_inventory_product_id" UNIQUE ("product_id"),
        CONSTRAINT "FK_inventory_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inventory_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "inventory_id" uuid NOT NULL,
        "type" "inventory_transaction_type_enum" NOT NULL,
        "quantity_change" int NOT NULL,
        "quantity_after" int NOT NULL,
        "reference_type" varchar(50),
        "reference_id" varchar(100),
        "note" text,
        "created_by" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventory_transactions_inventory" FOREIGN KEY ("inventory_id")
          REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_inventory_transactions_inventory_id"
        ON "inventory_transactions" ("inventory_id")
    `);

    // Seed initial inventory of 100 for all existing products
    await queryRunner.query(`
      INSERT INTO "inventory" ("product_id", "quantity_on_hand", "quantity_reserved", "low_stock_threshold")
      SELECT p.id, 100, 0, 5
      FROM "products" p
      ON CONFLICT ("product_id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "inventory_transaction_type_enum"`);
  }
}
