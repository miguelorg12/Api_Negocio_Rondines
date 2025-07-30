export interface CreateGuardDto {
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

export type PartialCreateGuardDto = Partial<CreateGuardDto>;
