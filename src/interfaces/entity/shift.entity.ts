import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Branch } from "./branch.entity";

@Entity("shifts")
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "timestamptz" })
  start_time: Date;

  @Column({ type: "timestamptz" })
  end_time: Date;

  @Column()
  branch_id: number;

  @ManyToOne(() => Branch, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
