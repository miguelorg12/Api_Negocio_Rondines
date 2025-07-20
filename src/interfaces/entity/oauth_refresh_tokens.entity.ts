import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "@entities/user.entity";
import { OauthClientsEntity } from "@entities/oauth_clients.entity";

@Entity("oauth_refresh_tokens")
export class OauthRefreshTokensEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  refresh_token: string;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => OauthClientsEntity, (client) => client.refreshTokens)
  @JoinColumn({ name: "client_id" })
  client: OauthClientsEntity;

  @Column({ type: "timestamptz" })
  expires_at: Date;

  @Column({ nullable: true })
  scope: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
