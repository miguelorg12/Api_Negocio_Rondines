import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "@entities/user.entity";

@Entity("report_logs")
export class ReportLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ["rondin", "incidente", "asistencias", "general"] })
  report_type: string;

  @CreateDateColumn({ type: "timestamptz" })
  generated_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.reportLogs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
