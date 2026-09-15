import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixLocalImageUrls1735600000000 implements MigrationInterface {
  name = 'FixLocalImageUrls1735600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "product_images"
      SET "url" = REPLACE("url", 'http://localhost:3001', 'https://scented-candles-api-gateway.onrender.com')
      WHERE "url" LIKE 'http://localhost:3001%';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
