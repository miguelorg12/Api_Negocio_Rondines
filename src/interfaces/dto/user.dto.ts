export interface CreateUserDto {
  name: string;
  last_name: string;
  curp: string;
  email: string;
  password: string;
  role_id: number;
  active: boolean;
  biometric: number;
}

export type PartialCreateUserDto = Partial<CreateUserDto>;
