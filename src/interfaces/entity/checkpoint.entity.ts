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
import { CheckpointRecord } from "@entities/checkpoint_record.entity";
import { Network } from "./network.entity";

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

  @ManyToOne(() => Network, (network) => network.checkpoints, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "network_id" })
  network: Network;

  @OneToMany(() => Incident, (incident) => incident.checkpoint)
  incidents: Incident[];

  @OneToMany(() => PatrolRoutePoint, (routePoint) => routePoint.checkpoint)
  routePoints: PatrolRoutePoint[];

  @OneToMany(
    () => CheckpointRecord,
    (checkpointRecord) => checkpointRecord.checkpoint
  )
  checkpointRecords: CheckpointRecord[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
