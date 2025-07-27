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
import { Plan } from "@entities/plan.entity";
import { Incident } from "@entities/incident.entity";
import { Patrol } from "@entities/patrol.entity";
import { User } from "./user.entity";

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
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Plan, (plan) => plan.branch)
  plans: Plan[];

  @OneToMany(() => Incident, (incident) => incident.branch)
  incidents: Incident[];

  @OneToMany(() => Patrol, (patrol) => patrol.branch)
  patrols: Patrol[];

  @ManyToMany(() => User, (user) => user.branches)
  guards: User[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
