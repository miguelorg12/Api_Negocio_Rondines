import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Column,
  DeleteDateColumn,
} from "typeorm";
import { User } from "@entities/user.entity";
import { Patrol } from "@entities/patrol.entity";
import { Shift } from "@entities/shift.entity";

@Entity("patrol_assignments")
export class PatrolAssignment {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  patrol_id: number;

  @PrimaryColumn()
  shift_id: number;

  @PrimaryColumn({ type: "date" })
  date: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Patrol, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patrol_id" })
  patrol: Patrol;

  @ManyToOne(() => Shift, { onDelete: "CASCADE" })
  @JoinColumn({ name: "shift_id" })
  shift: Shift;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
