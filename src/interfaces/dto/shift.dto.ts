export interface ShiftDto {
  name: string;
  start_time: string; // Formato: "HH:MM" (ej: "07:00", "15:30")
  end_time: string; // Formato: "HH:MM" (ej: "07:00", "15:30")
  branch_id: number;
  deleted_at?: Date;
}

export type PartialShiftDto = Partial<ShiftDto>;
