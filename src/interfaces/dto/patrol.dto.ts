export interface PatrolDto {
  name: string;
  frequency: "diaria" | "semanal" | "mensual";
  active?: boolean | true;
  branch_id: number;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface PatrolAssigmentDto {
  name: string;
  frequency: "diaria" | "semanal" | "mensual";
  active?: boolean | true;
  branch_id: number;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  user_id: number; // Optional, used for tracking who created/updated the patrol
}

export interface PatrolWithPlanImageDto {
  name: string;
  frequency: "diaria" | "semanal" | "mensual";
  active?: boolean | true;
  branch_id: number;
  plan_name?: string;
  plan_image_url?: string;
  plan_original_name?: string;
  plan_mime_type?: string;
  plan_file_size?: number;
  plan_spaces_key?: string;
}

export type PartialPatrolDto = Partial<PatrolDto>;
