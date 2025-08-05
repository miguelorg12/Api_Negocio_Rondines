export interface PatrolDto {
  name: string;
  active?: boolean | true;
  branch_id: number;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface PatrolAssigmentDto {
  name: string;
  active?: boolean | true;
  branch_id: number;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  user_id: number; // Optional, used for tracking who created/updated the patrol
}

export type PartialPatrolDto = Partial<PatrolDto>;
