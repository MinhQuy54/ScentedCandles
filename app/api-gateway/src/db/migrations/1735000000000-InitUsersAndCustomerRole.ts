import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUsersAndCustomerRole1735000000000 implements MigrationInterface {
  name = 'InitUsersAndCustomerRole1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "TM_role_setting" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying NOT NULL,
        "description" character varying NOT NULL,
        "status" character varying NOT NULL,
        "created_date" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_date" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_by" character varying,
        "updated_by" character varying,
        CONSTRAINT "PK_TM_role_setting" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_TM_role_setting_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "TM_role_setting" ("code", "description", "status", "is_deleted")
      VALUES ('CUSTOMER', 'Khách hàng', 'ACTIVE', false)
      ON CONFLICT ("code") DO NOTHING
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "full_name" character varying NOT NULL,
        "phone" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "role_setting_id" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "FK_users_role_setting" FOREIGN KEY ("role_setting_id")
          REFERENCES "TM_role_setting"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(
      `DELETE FROM "TM_role_setting" WHERE "code" = 'CUSTOMER'`,
    );
  }
}
