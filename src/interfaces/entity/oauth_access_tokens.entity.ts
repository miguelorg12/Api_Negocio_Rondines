import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "@entities/user.entity";
import { OauthClientsEntity } from "@entities/oauth_clients.entity";

@Entity("oauth_access_tokens")
export class OauthAccessTokensEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  access_token: string;

  @ManyToOne(() => User, (user) => user.accessTokens)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => OauthClientsEntity, (client) => client.accessTokens)
  @JoinColumn({ name: "client_id" })
  client: OauthClientsEntity;

  @Column({ type: "timestamptz" })
  expires_at: Date;

  @Column({ nullable: true })
  scope: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
