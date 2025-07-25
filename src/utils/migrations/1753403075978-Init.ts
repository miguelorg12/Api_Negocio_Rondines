import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1753403075978 implements MigrationInterface {
    name = 'Init1753403075978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "code" (
                "id" SERIAL NOT NULL,
                "code" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "expirates_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "user_id" integer,
                CONSTRAINT "PK_367e70f79a9106b8e802e1a9825" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "code"
            ADD CONSTRAINT "FK_2c4a681bc6a5fa9f5d4149f86bf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "code" DROP CONSTRAINT "FK_2c4a681bc6a5fa9f5d4149f86bf"
        `);
        await queryRunner.query(`
            DROP TABLE "code"
        `);
    }

}
