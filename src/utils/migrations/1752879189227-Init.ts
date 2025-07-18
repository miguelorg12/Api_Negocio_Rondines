import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1752879189227 implements MigrationInterface {
    name = 'Init1752879189227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "companies" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "address" character varying(255) NOT NULL,
                "email" character varying(255) NOT NULL,
                "phone" character varying(10) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "UQ_d0af6f5866201d5cb424767744a" UNIQUE ("email"),
                CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "patrol_records" (
                "id" SERIAL NOT NULL,
                "date" TIMESTAMP WITH TIME ZONE NOT NULL,
                "actual_start" TIMESTAMP WITH TIME ZONE NOT NULL,
                "actual_end" TIMESTAMP WITH TIME ZONE NOT NULL,
                "active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "user_id" integer,
                "patrol_id" integer,
                CONSTRAINT "PK_4e7bd5f7716b9451570b5361354" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "patrols" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "frequency" character varying NOT NULL,
                "active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "branch_id" integer,
                CONSTRAINT "PK_e9fc912ea5d187f0130ab4a4cef" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "branches" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "address" character varying(255) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "company_id" integer,
                "user_id" integer,
                CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "plans" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "image_url" text NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "branch_id" integer,
                CONSTRAINT "PK_3720521a81c7c24fe9b7202ba61" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "checkpoints" (
                "id" SERIAL NOT NULL,
                "name" character varying(255) NOT NULL,
                "nfc_uid" text NOT NULL,
                "x" bigint NOT NULL,
                "y" bigint NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "plan_id" integer,
                CONSTRAINT "PK_dfcc46a91d96ecba8a8dcd8b11c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "incidents" (
                "id" SERIAL NOT NULL,
                "description" text NOT NULL,
                "status" character varying NOT NULL,
                "severity" character varying NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "user_id" integer,
                "checkpoint_id" integer,
                "branch_id" integer,
                CONSTRAINT "PK_ccb34c01719889017e2246469f9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "report_logs" (
                "id" SERIAL NOT NULL,
                "report_type" character varying NOT NULL,
                "generated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "user_id" integer,
                CONSTRAINT "PK_242e8e0f9c2689f09aeaf00e67b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "name" character varying(100) NOT NULL,
                "last_name" character varying(100) NOT NULL,
                "curp" character varying(18) NOT NULL,
                "email" character varying(100) NOT NULL,
                "password" character varying(100) NOT NULL,
                "active" boolean NOT NULL DEFAULT true,
                "biometric" character varying NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                "role_id" integer,
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "shifts" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
                "end_time" TIMESTAMP WITH TIME ZONE NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "patrol_assignments" (
                "user_id" integer NOT NULL,
                "patrol_id" integer NOT NULL,
                "shift_id" integer NOT NULL,
                "date" date NOT NULL,
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_0cd978da3e5d37bd0ff45b847e1" PRIMARY KEY ("user_id", "patrol_id", "shift_id", "date")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "checkpoint_records" (
                "patrol_record_id" integer NOT NULL,
                "checkpoint_id" integer NOT NULL,
                "read_time" TIMESTAMP WITH TIME ZONE,
                "correct" boolean,
                "biometric_verified_at" TIMESTAMP WITH TIME ZONE,
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_a7ce32109f5cd59ec65e7df7fce" PRIMARY KEY ("patrol_record_id", "checkpoint_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "checkpoints_patrols_patrols" (
                "checkpointsId" integer NOT NULL,
                "patrolsId" integer NOT NULL,
                CONSTRAINT "PK_e86bb4af457b1a47fa4eb35ba0d" PRIMARY KEY ("checkpointsId", "patrolsId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9f0c52a9a9efd4b0bcebe06b15" ON "checkpoints_patrols_patrols" ("checkpointsId")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4683087d2d267f765629f964fe" ON "checkpoints_patrols_patrols" ("patrolsId")
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_records"
            ADD CONSTRAINT "FK_b1e9d94485eeeb0e5e2475a4ab8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_records"
            ADD CONSTRAINT "FK_c0cf048c214d5937218c35d75f5" FOREIGN KEY ("patrol_id") REFERENCES "patrols"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "patrols"
            ADD CONSTRAINT "FK_e854d2c5209da1045aac66cddeb" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "branches"
            ADD CONSTRAINT "FK_5973f79e64a27c506b07cd84b29" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "branches"
            ADD CONSTRAINT "FK_1359c25adc8fa78046837f7ad60" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "plans"
            ADD CONSTRAINT "FK_be006c839d804f3dfd261c2fdf2" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoints"
            ADD CONSTRAINT "FK_39b4afa2acd45d30ed9fdb8bacb" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "incidents"
            ADD CONSTRAINT "FK_66f302514887c0a1202dc48c239" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "incidents"
            ADD CONSTRAINT "FK_9b6aaf5cfae63bf747a42c8ee56" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "incidents"
            ADD CONSTRAINT "FK_42813e59f8d54520d1a38647849" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "report_logs"
            ADD CONSTRAINT "FK_6b182514d5aeb5ab4fbf361e573" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_assignments"
            ADD CONSTRAINT "FK_d9db403a94a1f611a93a4bc620c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_assignments"
            ADD CONSTRAINT "FK_9c5a31ca6824755513a49e3c40a" FOREIGN KEY ("patrol_id") REFERENCES "patrols"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_assignments"
            ADD CONSTRAINT "FK_f70f5be5645f658f606a7abe03a" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoint_records"
            ADD CONSTRAINT "FK_9c8535b3abe7b04260b5e7d8e5a" FOREIGN KEY ("patrol_record_id") REFERENCES "patrol_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoint_records"
            ADD CONSTRAINT "FK_3c70d27cc467909260030c98003" FOREIGN KEY ("checkpoint_id") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoints_patrols_patrols"
            ADD CONSTRAINT "FK_9f0c52a9a9efd4b0bcebe06b151" FOREIGN KEY ("checkpointsId") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoints_patrols_patrols"
            ADD CONSTRAINT "FK_4683087d2d267f765629f964fea" FOREIGN KEY ("patrolsId") REFERENCES "patrols"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "checkpoints_patrols_patrols" DROP CONSTRAINT "FK_4683087d2d267f765629f964fea"
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoints_patrols_patrols" DROP CONSTRAINT "FK_9f0c52a9a9efd4b0bcebe06b151"
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoint_records" DROP CONSTRAINT "FK_3c70d27cc467909260030c98003"
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoint_records" DROP CONSTRAINT "FK_9c8535b3abe7b04260b5e7d8e5a"
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_assignments" DROP CONSTRAINT "FK_f70f5be5645f658f606a7abe03a"
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_assignments" DROP CONSTRAINT "FK_9c5a31ca6824755513a49e3c40a"
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_assignments" DROP CONSTRAINT "FK_d9db403a94a1f611a93a4bc620c"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"
        `);
        await queryRunner.query(`
            ALTER TABLE "report_logs" DROP CONSTRAINT "FK_6b182514d5aeb5ab4fbf361e573"
        `);
        await queryRunner.query(`
            ALTER TABLE "incidents" DROP CONSTRAINT "FK_42813e59f8d54520d1a38647849"
        `);
        await queryRunner.query(`
            ALTER TABLE "incidents" DROP CONSTRAINT "FK_9b6aaf5cfae63bf747a42c8ee56"
        `);
        await queryRunner.query(`
            ALTER TABLE "incidents" DROP CONSTRAINT "FK_66f302514887c0a1202dc48c239"
        `);
        await queryRunner.query(`
            ALTER TABLE "checkpoints" DROP CONSTRAINT "FK_39b4afa2acd45d30ed9fdb8bacb"
        `);
        await queryRunner.query(`
            ALTER TABLE "plans" DROP CONSTRAINT "FK_be006c839d804f3dfd261c2fdf2"
        `);
        await queryRunner.query(`
            ALTER TABLE "branches" DROP CONSTRAINT "FK_1359c25adc8fa78046837f7ad60"
        `);
        await queryRunner.query(`
            ALTER TABLE "branches" DROP CONSTRAINT "FK_5973f79e64a27c506b07cd84b29"
        `);
        await queryRunner.query(`
            ALTER TABLE "patrols" DROP CONSTRAINT "FK_e854d2c5209da1045aac66cddeb"
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_records" DROP CONSTRAINT "FK_c0cf048c214d5937218c35d75f5"
        `);
        await queryRunner.query(`
            ALTER TABLE "patrol_records" DROP CONSTRAINT "FK_b1e9d94485eeeb0e5e2475a4ab8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4683087d2d267f765629f964fe"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9f0c52a9a9efd4b0bcebe06b15"
        `);
        await queryRunner.query(`
            DROP TABLE "checkpoints_patrols_patrols"
        `);
        await queryRunner.query(`
            DROP TABLE "checkpoint_records"
        `);
        await queryRunner.query(`
            DROP TABLE "patrol_assignments"
        `);
        await queryRunner.query(`
            DROP TABLE "shifts"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "report_logs"
        `);
        await queryRunner.query(`
            DROP TABLE "incidents"
        `);
        await queryRunner.query(`
            DROP TABLE "checkpoints"
        `);
        await queryRunner.query(`
            DROP TABLE "plans"
        `);
        await queryRunner.query(`
            DROP TABLE "branches"
        `);
        await queryRunner.query(`
            DROP TABLE "patrols"
        `);
        await queryRunner.query(`
            DROP TABLE "patrol_records"
        `);
        await queryRunner.query(`
            DROP TABLE "companies"
        `);
        await queryRunner.query(`
            DROP TABLE "roles"
        `);
    }

}
