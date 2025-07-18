export class CreateUserDto {
  name: string;
  last_name: string;
  curp: string;
  email: string;
  password: string;
  role_id: number;
  active: boolean;
  biometric: string;
  code: string;
}

export type PartialCreateUserDto = Partial<CreateUserDto>;
