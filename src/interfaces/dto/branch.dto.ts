export interface CreateBranchDto {
  name: string;
  address: string;
  company_id: number;
  user_id?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type PartialBranchDto = Partial<CreateBranchDto>;
