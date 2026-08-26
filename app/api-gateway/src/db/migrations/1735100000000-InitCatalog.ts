import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCatalog1735100000000 implements MigrationInterface {
  name = 'InitCatalog1735100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "product_status_enum" AS ENUM (
          'DRAFT', 'PROCESSING', 'ACTIVE', 'INACTIVE'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "parent_id" uuid,
        "name" varchar(150) NOT NULL,
        "slug" varchar(150) NOT NULL,
        "description" text,
        "image_url" varchar(500),
        "sort_order" int NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parent_id")
          REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_categories_parent_id" ON "categories" ("parent_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_categories_slug" ON "categories" ("slug")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "category_id" uuid NOT NULL,
        "sku" varchar(50) NOT NULL,
        "name" varchar(255) NOT NULL,
        "slug" varchar(255) NOT NULL,
        "short_description" varchar(500),
        "raw_description" text NOT NULL,
        "price" decimal(12,2) NOT NULL,
        "compare_at_price" decimal(12,2),
        "status" "product_status_enum" NOT NULL DEFAULT 'DRAFT',
        "is_featured" boolean NOT NULL DEFAULT false,
        "weight_grams" int,
        "burn_time_hours" decimal(5,1),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz,
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
        CONSTRAINT "UQ_products_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("category_id")
          REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_category_id" ON "products" ("category_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_status" ON "products" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_sku" ON "products" ("sku")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_slug" ON "products" ("slug")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "url" varchar(500) NOT NULL,
        "alt_text" varchar(255),
        "sort_order" int NOT NULL DEFAULT 0,
        "is_primary" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_images" PRIMARY KEY ("id"),
        CONSTRAINT "FK_product_images_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_product_images_product_id" ON "product_images" ("product_id")
    `);

    await queryRunner.query(`
      INSERT INTO "categories" ("name", "slug", "description")
      VALUES ('Nến thơm', 'nen-thom', 'Nến thơm handmade')
      ON CONFLICT ("slug") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "products" (
        "category_id", "sku", "name", "slug",
        "short_description", "raw_description", "price", "status"
      )
      SELECT
        c.id,
        'CANDLE-001',
        'Lavender Dream',
        'lavender-dream',
        'Hương oải hương dịu nhẹ',
        'Nến lavender handmade.',
        250000,
        'ACTIVE'
      FROM "categories" c
      WHERE c.slug = 'nen-thom'
      ON CONFLICT ("sku") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "product_images" ("product_id", "url", "alt_text", "is_primary")
      SELECT p.id, 'https://placehold.co/600x600?text=Lavender', 'Lavender Dream', true
      FROM "products" p
      WHERE p.sku = 'CANDLE-001'
        AND NOT EXISTS (
          SELECT 1 FROM "product_images" pi WHERE pi.product_id = p.id
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "product_status_enum"`);
  }
}
