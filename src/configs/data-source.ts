import { DataSource } from "typeorm";
import { config, isDevelopment } from "./environment";
import { User } from "@entities/user.entity";
import { Patrol } from "@entities/patrol.entity";
import { Branch } from "@entities/branch.entity";
import { Company } from "@entities/company.entity";
import { PatrolRecord } from "@entities/patrol_record.entity";
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";
import { Checkpoint } from "@entities/checkpoint.entity";
import { CheckpointRecord } from "@entities/checkpoint_record.entity";
import { Incident } from "@entities/incident.entity";
import { Plan } from "@entities/plan.entity";
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
  host: config.DB_HOST,
  port: config.DB_PORT,
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  synchronize: isDevelopment, // Solo sincronizar en desarrollo
  logging: isDevelopment, // Solo logging en desarrollo
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
