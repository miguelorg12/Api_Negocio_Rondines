import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { PatrolAssignment } from "@entities/patrol_assigment.entity";
import { Checkpoint } from "@entities/checkpoint.entity";

@Entity("checkpoint_records")
export class CheckpointRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PatrolAssignment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patrol_assignment_id" })
  patrolAssignment: PatrolAssignment;

  @ManyToOne(() => Checkpoint, { onDelete: "CASCADE" })
  @JoinColumn({ name: "checkpoint_id" })
  checkpoint: Checkpoint;

  @Column({
    type: "enum",
    enum: ["pending", "completed", "missed", "late"],
    default: "pending"
  })
  status: "pending" | "completed" | "missed" | "late";

  @Column({ type: "timestamptz" })
  check_time: Date; // Hora programada para pasar por el checkpoint

  @Column({ type: "timestamptz", nullable: true })
  real_check: Date; // Hora real cuando pasó por el checkpoint

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
