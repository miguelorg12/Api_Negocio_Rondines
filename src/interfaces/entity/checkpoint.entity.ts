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
  DeleteDateColumn,
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

  @Column({ type: "time" })
  time: string;

  @ManyToOne(() => Plan, (plan) => plan.checkpoints, { onDelete: "CASCADE" })
  @JoinColumn({ name: "plan_id" })
  plan: Plan;

  @OneToMany(() => Incident, (incident) => incident.checkpoint)
  incident: Incident[];

  @ManyToMany(() => Patrol, { onDelete: "CASCADE" })
  @JoinTable({
    name: "patrol_checkpoints",
    joinColumn: { name: "checkpoint_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "patrol_id", referencedColumnName: "id" },
  })
  patrols: Patrol[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
