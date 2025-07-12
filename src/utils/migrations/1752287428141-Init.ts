import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1752287428141 implements MigrationInterface {
    name = 'Init1752287428141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "last_name" character varying(100) NOT NULL,
                "curp" character varying(18) NOT NULL,
                "email" character varying(100) NOT NULL,
                "password" character varying(100) NOT NULL,
                "role_id" integer NOT NULL,
                "active" boolean NOT NULL,
                "biometric" character varying NOT NULL,
                "code" character varying NOT NULL,
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "user"
        `);
    }

}
