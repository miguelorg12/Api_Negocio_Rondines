import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Branch } from "@entities/branch.entity";
import { PatrolRecord } from "@entities/patrol_record.entity";

@Entity("patrols")
export class Patrol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ["ronda_matutina", "ronda_vespertina", "ronda_nocturna"] })
  name: string;

  @Column({ enum: ["diaria", "semanal", "mensual"] })
  frequency: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Branch, (branch) => branch.patrols, { onDelete: "CASCADE" })
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @OneToMany(() => PatrolRecord, (patrolRecord) => patrolRecord.patrol)
  patrolRecords: PatrolRecord[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
