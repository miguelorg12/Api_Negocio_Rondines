export interface PatrolAssignmentDto {
  user_id: number;
  patrol_id: number;
  shift_id: number;
  date: Date | string; // Can be Date object or ISO date string
  deleted_at?: Date; // Optional for soft delete
}

export interface UpdateRouteWithCheckpointsDto {
  user_id?: number;
  patrol_id?: number;
  shift_id?: number;
  date?: Date;
}

export type PartialPatrolAssignmentDto = Partial<PatrolAssignmentDto>;
