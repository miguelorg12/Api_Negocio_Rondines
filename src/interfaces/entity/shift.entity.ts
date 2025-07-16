import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("shifts")
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ["matutino", "vespertino", "nocturno"] })
  name: string;

  @Column({ type: "timestamptz" })
  start_time: Date;

  @Column({ type: "timestamptz" })
  end_time: Date;
}
