import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "@entities/user.entity";
import { OauthClientsEntity } from "@entities/oauth_clients.entity";
import { randomBytes } from "crypto";

@Entity("oauth_authorization_codes")
export class OauthAuthorizationCodesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @ManyToOne(() => User, (user) => user.oauthAuthorizationCodes)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => OauthClientsEntity, (client) => client.authorizationCodes)
  @JoinColumn({ name: "client_id" })
  client: OauthClientsEntity;

  @Column({ type: "timestamptz" })
  expires_at: Date;

  @Column({ nullable: true })
  scope: string;

  @Column()
  code_challenge: string;

  @Column()
  code_challenge_method: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @BeforeInsert()
  generateCode() {
    this.code = randomBytes(32).toString("hex");
  }
}
