import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Branch } from "@entities/branch.entity";
import { Incident } from "@entities/incident.entity";
import { PatrolRoutePoint } from "@entities/patrol_route_point.entity";

@Entity("checkpoints")
export class Checkpoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  nfc_uid: string;

  @ManyToOne(() => Branch, (branch) => branch.checkpoints, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @OneToMany(() => Incident, (incident) => incident.checkpoint)
  incidents: Incident[];

  @OneToMany(() => PatrolRoutePoint, (routePoint) => routePoint.checkpoint)
  routePoints: PatrolRoutePoint[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
