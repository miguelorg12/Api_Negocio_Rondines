import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "@entities/user.entity";
import { Patrol } from "@entities/patrol.entity";
import { Branch } from "@entities/branch.entity";
import { Company } from "@entities/company.entity";
import { PatrolRecord } from "@entities/patrol_record.entity";
import { PatrolAssignment } from "@entities/patrol_assigment";
import { Checkpoint } from "@entities/checkpoint.entity";
import { CheckpointRecord } from "@entities/checkpoint_record.entity";
import { Incident } from "@entities/incident.entity";
import { Plan } from "@entities/plan.entity";
import { Shift } from "@entities/shift.entity";
import { Role } from "@entities/role.entity";
import { ReportLog } from "@entities/report_log.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: true,
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
  ],
  subscribers: [],
  migrations: [__dirname + "/../utils/migrations/*.{ts,js}"],
});
