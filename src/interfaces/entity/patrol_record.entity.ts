import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "@entities/user.entity";
import { Patrol } from "@entities/patrol.entity";

@Entity("patrol_records")
export class PatrolRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamptz" })
  date: Date;

  @Column({ type: "timestamptz" })
  actual_start: Date;

  @Column({ type: "timestamptz" })
  actual_end: Date;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => User, (user) => user.patrolRecords, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Patrol, (patrol) => patrol.patrolRecords, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "patrol_id" })
  patrol: Patrol;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
