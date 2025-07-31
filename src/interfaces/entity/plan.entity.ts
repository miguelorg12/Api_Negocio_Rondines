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
import { Patrol } from "@entities/patrol.entity";
import { Checkpoint } from "@entities/checkpoint.entity";

@Entity("plans")
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

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

  @ManyToOne(() => Patrol, (patrol) => patrol.plans, { onDelete: "CASCADE" })
  @JoinColumn({ name: "patrol_id" })
  patrol: Patrol;

  @OneToMany(() => Checkpoint, (checkpoint) => checkpoint.plan)
  checkpoints: Checkpoint[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at?: Date;
}
