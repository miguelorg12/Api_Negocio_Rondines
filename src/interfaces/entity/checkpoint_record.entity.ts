import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Column,
  DeleteDateColumn,
} from "typeorm";
import { PatrolRecord } from "@entities/patrol_record.entity";
import { Checkpoint } from "@entities/checkpoint.entity";

@Entity("checkpoint_records")
export class CheckpointRecord {
  @PrimaryColumn()
  patrol_record_id: number;

  @PrimaryColumn()
  checkpoint_id: number;

  @Column({ type: "timestamptz", nullable: true })
  read_time: Date;

  @Column({ type: "boolean", nullable: true })
  correct: boolean;

  @Column({ type: "timestamptz", nullable: true })
  biometric_verified_at: Date;

  @ManyToOne(() => PatrolRecord, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patrol_record_id" })
  patrolRecord: PatrolRecord;

  @ManyToOne(() => Checkpoint, { onDelete: "CASCADE" })
  @JoinColumn({ name: "checkpoint_id" })
  checkpoint: Checkpoint;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
