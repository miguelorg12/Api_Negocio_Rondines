export interface PatrolDto {
  name: string;
  frequency: "diaria" | "semanal" | "mensual";
  active?: boolean | true;
  branch_id: number;
  plan_id?: number; // Optional for creation, required for updates
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export type PartialPatrolDto = Partial<PatrolDto>;
