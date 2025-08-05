import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("session")
export class Session {
  @PrimaryColumn({ type: "varchar" })
  sid: string;

  @Column({ type: "json" })
  sess: any;

  @Column({ type: "timestamp", precision: 6 })
  expire: Date;
}
