import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdminRole1735200000000 implements MigrationInterface {
  name = 'SeedAdminRole1735200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "TM_role_setting" ("code", "description", "status", "is_deleted")
      VALUES ('ADMIN', 'Quản trị viên', 'ACTIVE', false)
      ON CONFLICT ("code") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "TM_role_setting" WHERE "code" = 'ADMIN'
    `);
  }
}
