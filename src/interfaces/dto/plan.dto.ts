export interface CreatePlanDto {
  name: string;
  image_url: string;
  branch_id: number;
}

export type PartialCreatePlanDto = Partial<CreatePlanDto>;
