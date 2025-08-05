import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Branch } from "@entities/branch.entity";
import { PatrolRecord } from "@entities/patrol_record.entity";
import { Checkpoint } from "@entities/checkpoint.entity";
import { PatrolAssignment } from "@entities/patrol_assigment.entity";

@Entity("patrols")
export class Patrol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ["ronda_matutina", "ronda_vespertina", "ronda_nocturna"] })
  name: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Branch, (branch) => branch.patrols, { onDelete: "CASCADE" })
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @OneToMany(() => PatrolAssignment, (assignment) => assignment.patrol)
  patrolAssignments: PatrolAssignment[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
