import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Column,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { User } from "@entities/user.entity";
import { Patrol } from "@entities/patrol.entity";
import { Shift } from "@entities/shift.entity";
import { PatrolRecord } from "@entities/patrol_record.entity";
import { CheckpointRecord } from "@entities/checkpoint_record.entity";

@Entity("patrol_assignments")
export class PatrolAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamptz" })
  date: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Patrol, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patrol_id" })
  patrol: Patrol;

  @ManyToOne(() => Shift, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shift_id" })
  shift: Shift;

  @OneToMany(
    () => PatrolRecord,
    (patrolRecord) => patrolRecord.patrolAssignment
  )
  patrolRecords: PatrolRecord[];

  @OneToMany(
    () => CheckpointRecord,
    (checkpointRecord) => checkpointRecord.patrolAssignment
  )
  checkpointRecords: CheckpointRecord[];

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
