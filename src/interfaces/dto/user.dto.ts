export interface CreateUserDto {
  name: string;
  last_name: string;
  curp: string;
  email: string;
  password: string;
  confirm_password: string;
  role_id: number;
  active: boolean;
  biometric: number;
}

export interface UserDataDto {
  name: string;
  last_name: string;
  curp: string;
  email: string;
  password: string;
  role_id: number;
  active: boolean;
  biometric: number;
  branch_id: number;
}

// DTO para update con todos los campos opcionales
export interface UpdateUserDto {
  name?: string;
  last_name?: string;
  curp?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  role_id?: number;
  active?: boolean;
  biometric?: number;
}

export type PartialCreateUserDto = Partial<UserDataDto>;
