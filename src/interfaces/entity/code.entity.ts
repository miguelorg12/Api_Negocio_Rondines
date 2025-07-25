import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import * as bcrypt from "bcryptjs";

@Entity()
export class Code {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  code: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @Column({ type: "timestamptz" })
  expirates_at: Date;

  @BeforeInsert()
  setExpirationDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10); // Set expiration to 10 minutes from now
    this.expirates_at = now;
  }

  @BeforeInsert()
  async hashCode() {
    if (this.code) {
      this.code = await bcrypt.hash(this.code, 10);
    }
  }
}
