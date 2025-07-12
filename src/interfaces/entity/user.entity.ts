import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  last_name: string;
  @Column({ length: 18 })
  curp: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 100 })
  password: string;

  @Column()
  role_id: number;

  @Column()
  active: boolean;

  @Column()
  biometric: string;

  @Column()
  code: string;
}
