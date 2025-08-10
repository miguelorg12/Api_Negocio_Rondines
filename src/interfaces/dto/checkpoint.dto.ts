export interface CheckpointDto {
  name: string;
  branch_id: number;
  network_id: number;
  created_at?: Date;
  deleted_at?: Date;
}

export type PartialCheckpointDto = Partial<CheckpointDto>;
