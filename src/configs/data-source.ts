import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "@entities/user.entity";
import { Patrol } from "@entities/patrol.entity";
import { Branch } from "@entities/branch.entity";
import { Company } from "@entities/company.entity";
import { PatrolRecord } from "@entities/patrol_record.entity";
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";
import { Checkpoint } from "@entities/checkpoint.entity";
import { CheckpointRecord } from "@entities/checkpoint_record.entity";
import { Incident } from "@entities/incident.entity";
import { Shift } from "@entities/shift.entity";
import { Role } from "@entities/role.entity";
import { ReportLog } from "@entities/report_log.entity";
import { OauthAuthorizationCodesEntity } from "@entities/oauth_authorization_codes.entity";
import { OauthRefreshTokensEntity } from "@entities/oauth_refresh_tokens.entity";
import { OauthAccessTokensEntity } from "@entities/oauth_access_tokens.entity";
import { OauthClientsEntity } from "@entities/oauth_clients.entity";
import { Code } from "@entities/code.entity";
import { IncidentImage } from "@interfaces/entity/incident_image.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.TYPEORM_SYNCHRONIZE === "true",
  logging: false,
  entities: [
    User,
    Patrol,
    Branch,
    Company,
    PatrolRecord,
    PatrolAssignment,
    Checkpoint,
    CheckpointRecord,
    Incident,
    Shift,
    Role,
    ReportLog,
    OauthAuthorizationCodesEntity,
    OauthRefreshTokensEntity,
    OauthAccessTokensEntity,
    OauthClientsEntity,
    Code,
    IncidentImage,
  ],
  subscribers: [],
  migrations: [__dirname + "/../utils/migrations/*.{ts,js}"],
});
