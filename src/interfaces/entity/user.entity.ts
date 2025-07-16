import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "@entities/role.entity";
import { Company } from "@entities/company.entity";
import { Incident } from "@entities/incident.entity";
import { ReportLog } from "@entities/report_log.entity";
import { PatrolRecord } from "./patrol_record.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ length: 18 })
  curp: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 100 })
  password: string;

  @Column({ default: true })
  active: boolean;

  @Column()
  biometric: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "role_id" })
  role: Role;

  @OneToMany(() => Company, (company) => company.user)
  company: Company;

  @OneToMany(() => Incident, (incident) => incident.user)
  incidents: Incident[];

  @OneToMany(() => ReportLog, (reportLog) => reportLog.user)
  reportLogs: ReportLog[];

  @OneToMany(() => PatrolRecord, (patrolRecord) => patrolRecord.user)
  patrolRecords: PatrolRecord[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
