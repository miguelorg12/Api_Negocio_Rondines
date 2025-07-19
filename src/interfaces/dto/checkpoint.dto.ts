export interface CheckPointDto {
  name: string;
  nfc_uid: string;
  x: number;
  y: number;
  plan_id: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export type PartialCheckPointDto = Partial<CheckPointDto>;
