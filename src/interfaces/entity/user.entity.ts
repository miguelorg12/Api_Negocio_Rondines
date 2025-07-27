import {
  AfterInsert,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Exclude } from "class-transformer";
import { Role } from "@entities/role.entity";
import { Incident } from "@entities/incident.entity";
import { ReportLog } from "@entities/report_log.entity";
import { Branch } from "@entities/branch.entity";
import * as bcrypt from "bcryptjs";
import { OauthAuthorizationCodesEntity } from "@entities/oauth_authorization_codes.entity";
import { OauthAccessTokensEntity } from "@entities/oauth_access_tokens.entity";
import { OauthRefreshTokensEntity } from "@entities/oauth_refresh_tokens.entity";
import { Code } from "@entities/code.entity";

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

  @Exclude()
  @Column({ length: 100 })
  password: string;

  @Column({ default: true })
  active: boolean;

  @Column()
  biometric: string;

  @OneToMany(() => Code, (code) => code.user)
  codes: Code[];

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "role_id" })
  role: Role;

  @OneToMany(() => Branch, (branch) => branch.user)
  branch: Branch[];

  @OneToMany(() => Incident, (incident) => incident.user)
  incidents: Incident[];

  @OneToMany(() => ReportLog, (reportLog) => reportLog.user)
  reportLogs: ReportLog[];

  @OneToMany(
    () => OauthAuthorizationCodesEntity,
    (authorizationCode) => authorizationCode.user
  )
  oauthAuthorizationCodes: OauthAuthorizationCodesEntity[];

  @OneToMany(
    () => OauthRefreshTokensEntity,
    (refreshToken) => refreshToken.user
  )
  refreshTokens: OauthRefreshTokensEntity[];

  @OneToMany(() => OauthAccessTokensEntity, (accessToken) => accessToken.user)
  accessTokens: OauthAccessTokensEntity[];

  @ManyToMany(() => Branch, (branch) => branch.guards)
  @JoinTable({
    name: "user_branches",
    joinColumn: { name: "user_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "branch_id", referencedColumnName: "id" },
  })
  branches: Branch[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
