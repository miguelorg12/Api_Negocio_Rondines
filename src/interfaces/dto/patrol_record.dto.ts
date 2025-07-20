export interface PatrolRecordDto {
  user_id: number;
  patrol_id: number;
  date: Date;
  actual_start?: Date;
  actual_end?: Date;
  status?: "completado" | "pendiente" | "cancelado" | "en_progreso";
}

export type PartialPatrolRecordDto = Partial<PatrolRecordDto>;
