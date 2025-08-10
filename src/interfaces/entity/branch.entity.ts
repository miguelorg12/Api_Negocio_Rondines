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
import { Company } from "@entities/company.entity";
import { Incident } from "@entities/incident.entity";
import { Patrol } from "@entities/patrol.entity";
import { Checkpoint } from "@entities/checkpoint.entity";
import { User } from "./user.entity";
import { Network } from "./network.entity";

@Entity("branches")
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  address: string;

  @ManyToOne(() => Company, (company) => company.branch, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "company_id" })
  company: Company;

  @ManyToOne(() => User, (user) => user.branch, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Incident, (incident) => incident.branch)
  incidents: Incident[];

  @OneToMany(() => Patrol, (patrol) => patrol.branch)
  patrols: Patrol[];

  @OneToMany(() => Checkpoint, (checkpoint) => checkpoint.branch)
  checkpoints: Checkpoint[];

  @ManyToMany(() => User, (user) => user.branches)
  guards: User[];

  @OneToMany(() => Network, (network) => network.branch)
  networks: Network[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
