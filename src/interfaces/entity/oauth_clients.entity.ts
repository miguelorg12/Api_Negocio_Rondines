import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OauthAuthorizationCodesEntity } from "@entities/oauth_authorization_codes.entity";
import { OauthAccessTokensEntity } from "@entities/oauth_access_tokens.entity";
import { OauthRefreshTokensEntity } from "@entities/oauth_refresh_tokens.entity";
import * as bcrypt from "bcryptjs";

@Entity("oauth_clients")
export class OauthClientsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Generated("uuid")
  client_id: string;

  @Column()
  client_secret: string;

  @Column({ nullable: true })
  redirect_uri: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: false })
  trusted_client: boolean;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updated_at: Date;

  @OneToMany(
    () => OauthAuthorizationCodesEntity,
    (authorizationCode) => authorizationCode.client
  )
  authorizationCodes: OauthAuthorizationCodesEntity[];

  @OneToMany(() => OauthAccessTokensEntity, (accessToken) => accessToken.client)
  accessTokens: OauthAccessTokensEntity[];

  @OneToMany(
    () => OauthRefreshTokensEntity,
    (refreshToken) => refreshToken.client
  )
  refreshTokens: OauthRefreshTokensEntity[];

  @BeforeInsert()
  async generateClientSecret() {
    if (this.client_secret) {
      this.client_secret = await bcrypt.hash(this.client_secret, 10);
    }
  }
}
