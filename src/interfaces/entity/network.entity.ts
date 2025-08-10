import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  JoinColumn,
  OneToMany,
  BeforeUpdate,
  BeforeInsert,
} from "typeorm";
import { Branch } from "./branch.entity";
import { Checkpoint } from "./checkpoint.entity";
import * as bcrypt from "bcrypt";

@Entity("networks")
export class Network {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  ssid: string;

  @Column({ length: 255 })
  password: string;

  @ManyToOne(() => Branch, (branch) => branch.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @OneToMany(() => Checkpoint, (checkpoint) => checkpoint.network)
  checkpoints: Checkpoint[];

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
