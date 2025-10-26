import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTranscriptions1761488775107 implements MigrationInterface {
  name = 'AddTranscriptions1761488775107'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transcriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" text NOT NULL, "segments" jsonb, "structuredData" jsonb, "language" character varying(10), "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "noteId" uuid, CONSTRAINT "REL_f33f09e5b1abe3947d0dc79587" UNIQUE ("noteId"), CONSTRAINT "PK_cba8a0264bdf2680c0d93fc7d17" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "transcriptions" ADD CONSTRAINT "FK_f33f09e5b1abe3947d0dc795870" FOREIGN KEY ("noteId") REFERENCES "notes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transcriptions" DROP CONSTRAINT "FK_f33f09e5b1abe3947d0dc795870"`
    )
    await queryRunner.query(`DROP TABLE "transcriptions"`)
  }
}
