import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPatientUserId1788800000000 implements MigrationInterface {
  name = 'AddPatientUserId1788800000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "patients" ADD "userId" uuid`)
    await queryRunner.query(
      `UPDATE "patients" SET "userId" = (SELECT "id" FROM "users" WHERE "username" = 'demo' LIMIT 1) WHERE "userId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "patients" ALTER COLUMN "userId" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "FK_user_patients" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_patients_user_id" ON "patients" ("userId")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_patients_user_id"`)
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "FK_user_patients"`
    )
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "userId"`)
  }
}
