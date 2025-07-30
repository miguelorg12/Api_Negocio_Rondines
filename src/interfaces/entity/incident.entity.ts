import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Checkpoint } from "@entities/checkpoint.entity";
import { Branch } from "@entities/branch.entity";
import { User } from "./user.entity";
import { IncidentImage } from "./incident_image.entity";

@Entity("incidents")
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  description: string;

  @Column({ enum: ["reportado", "en_revision", "resuelto", , "descartado"] })
  status: string;

  @Column({ enum: ["baja", "media", "alta", "critica"] })
  severity: string;

  @ManyToOne(() => User, (user) => user.incidents, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Checkpoint, (checkpoint) => checkpoint.incident, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "checkpoint_id" })
  checkpoint: Checkpoint;

  @ManyToOne(() => Branch, (branch) => branch.incidents, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;

  @OneToMany(() => IncidentImage, (image) => image.incident)
  images: IncidentImage[];
}
