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
import { Incident } from "./incident.entity";

@Entity("incident_images")
export class IncidentImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  image_url: string;

  @Column({ type: "varchar", length: 255 })
  original_name: string;

  @Column({ type: "varchar", length: 100 })
  mime_type: string;

  @Column({ type: "bigint" })
  file_size: number;

  @Column({ type: "varchar", length: 500 })
  spaces_key: string;

  @Column({ type: "int", default: 1 })
  order: number;

  @ManyToOne(() => Incident, (incident) => incident.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "incident_id" })
  incident: Incident;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
