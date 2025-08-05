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
import { Patrol } from "@entities/patrol.entity";
import { Checkpoint } from "@entities/checkpoint.entity";

@Entity("patrol_route_points")
export class PatrolRoutePoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: "decimal", precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: "int" })
  order: number;

  @Column({ type: "text", nullable: true })
  google_place_id?: string;

  @Column({ type: "text", nullable: true })
  address?: string;

  @Column({ type: "text", nullable: true })
  formatted_address?: string;

  @ManyToOne(() => Patrol, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patrol_id" })
  patrol: Patrol;

  @ManyToOne(() => Checkpoint, { onDelete: "CASCADE" })
  @JoinColumn({ name: "checkpoint_id" })
  checkpoint: Checkpoint;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
