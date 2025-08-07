export interface CheckpointDto {
  name: string;
  branch_id: number;
  nfc_uid: number;
  created_at?: Date;
  deleted_at?: Date;
}

export type PartialCheckpointDto = Partial<CheckpointDto>;
