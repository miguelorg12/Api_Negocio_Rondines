import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from "typeorm";
import { Plan } from "@entities/plan.entity";
import { Incident } from "@entities/incident.entity";
import { Patrol } from "@entities/patrol.entity";

@Entity("checkpoints")
export class Checkpoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "text" })
  nfc_uid: string;

  @Column({ type: "int8" })
  x: number;

  @Column({ type: "int8" })
  y: number;

  @ManyToOne(() => Plan, (plan) => plan.checkpoints, { onDelete: "CASCADE" })
  @JoinColumn({ name: "plan_id" })
  plan: Plan;

  @OneToMany(() => Incident, (incident) => incident.checkpoint)
  incident: Incident[];

  @ManyToMany(() => Patrol, { onDelete: "CASCADE" })
  @JoinTable()
  patrols: Patrol[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
