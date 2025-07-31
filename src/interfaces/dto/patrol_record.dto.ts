export interface PatrolRecordDto {
  date: Date;
  actual_start?: Date;
  actual_end?: Date;
  status?: "completado" | "pendiente" | "cancelado" | "en_progreso";
  patrol_assignment_id?: number;
}

export type PartialPatrolRecordDto = Partial<PatrolRecordDto>;
