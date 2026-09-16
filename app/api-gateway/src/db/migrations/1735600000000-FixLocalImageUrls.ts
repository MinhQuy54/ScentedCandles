import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixLocalImageUrls1735600000000 implements MigrationInterface {
  name = 'FixLocalImageUrls1735600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "product_images"
      SET "url" = REGEXP_REPLACE("url", '^https?://[^/]+', '')
      WHERE "url" LIKE 'http%';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
