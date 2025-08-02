import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "../interfaces/entity/user.entity";
import { Patrol } from "../interfaces/entity/patrol.entity";
import { Branch } from "../interfaces/entity/branch.entity";
import { Company } from "../interfaces/entity/company.entity";
import { PatrolRecord } from "../interfaces/entity/patrol_record.entity";
import { PatrolAssignment } from "../interfaces/entity/patrol_assigment.entity";
import { Checkpoint } from "../interfaces/entity/checkpoint.entity";
import { CheckpointRecord } from "../interfaces/entity/checkpoint_record.entity";
import { Incident } from "../interfaces/entity/incident.entity";
import { Plan } from "../interfaces/entity/plan.entity";
import { Shift } from "../interfaces/entity/shift.entity";
import { Role } from "../interfaces/entity/role.entity";
import { ReportLog } from "../interfaces/entity/report_log.entity";
import { OauthAuthorizationCodesEntity } from "../interfaces/entity/oauth_authorization_codes.entity";
import { OauthRefreshTokensEntity } from "../interfaces/entity/oauth_refresh_tokens.entity";
import { OauthAccessTokensEntity } from "../interfaces/entity/oauth_access_tokens.entity";
import { OauthClientsEntity } from "../interfaces/entity/oauth_clients.entity";
import { Code } from "../interfaces/entity/code.entity";
import { IncidentImage } from "../interfaces/entity/incident_image.entity";

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
    Plan,
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
