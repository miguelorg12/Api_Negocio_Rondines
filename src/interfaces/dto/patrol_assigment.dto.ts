export interface PatrolAssignmentDto {
  user_id: number;
  patrol_id: number;
  shift_id: number;
  date: Date; // ISO date string
  deleted_at?: Date; // Optional for soft delete
}

export interface RouteAssignmentWithCheckpointsDto {
  user_id: number;
  patrol_id: number;
  shift_id: number;
  date: Date;
}

export interface UpdateRouteWithCheckpointsDto {
  user_id?: number;
  patrol_id?: number;
  shift_id?: number;
  date?: Date;
}

export type PartialPatrolAssignmentDto = Partial<PatrolAssignmentDto>;
