export interface PatrolRecordDto {
  user_id: string;
  patrol_id: string;
  date: Date;
  actual_start: Date;
  actual_end: Date;
  status: "completado" | "pendiente" | "cancelado" | "en_progreso";
}

export type PartialPatrolRecordDto = Partial<PatrolRecordDto>;
