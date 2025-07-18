export interface ShiftDto {
  name: "matutino" | "vespertino" | "nocturno";
  start_time: Date;
  end_time: Date;
  deleted_at?: Date;
}

export type PartialShiftDto = Partial<ShiftDto>;
