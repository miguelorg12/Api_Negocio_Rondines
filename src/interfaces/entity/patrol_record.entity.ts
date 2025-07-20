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
import { PatrolAssignment } from "@interfaces/entity/patrol_assigment.entity";

@Entity("patrol_records")
export class PatrolRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamptz" })
  date: Date;

  @Column({ type: "timestamptz", nullable: true })
  actual_start: Date;

  @Column({ type: "timestamptz", nullable: true })
  actual_end: Date;

  @Column({
    type: "enum",
    enum: ["completado", "pendiente", "cancelado", "en_progreso"],
  })
  status: string;

  @ManyToOne(
    () => PatrolAssignment,
    (patrolAssignment) => patrolAssignment.patrolRecords,
    {
      onDelete: "CASCADE",
    }
  )
  @JoinColumn({ name: "patrol_assignment_id" })
  patrolAssignment: PatrolAssignment;

  // @ManyToOne(() => User, (user) => user.patrolRecords, { onDelete: "CASCADE" })
  // @JoinColumn({ name: "user_id" })
  // user: User;

  // @ManyToOne(() => Patrol, (patrol) => patrol.patrolRecords, {
  //   onDelete: "CASCADE",
  // })
  // @JoinColumn({ name: "patrol_id" })
  // patrol: Patrol;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
