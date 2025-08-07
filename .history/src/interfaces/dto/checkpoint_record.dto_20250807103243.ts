export interface CheckpointRecordResponse {
  id: number;
  status: "pending" | "completed" | "missed" | "late";
  check_time: string;
  real_check?: string;
  patrol_assignment: {
    id: number;
    date: string;
    user: {
      id: number;
      name: string;
      last_name: string;
    };
    patrol: {
      id: number;
      name: string;
    };
    shift: {
      id: number;
      name: string;
    };
  };
  checkpoint: {
    id: number;
    name: string;
    nfc_uid?: string;
    latitude?: number;
    longitude?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CheckpointRecordCreateRequest {
  patrol_assignment_id: number;
  checkpoint_id: number;
  check_time: string; // Hora programada para pasar por el checkpoint
}

export interface CheckpointRecordUpdateRequest {
  status?: "pending" | "completed" | "missed" | "late";
  real_check?: string; // Hora real cuando pasó por el checkpoint
}

export interface CheckpointRecordFilterRequest {
  patrol_assignment_id?: number;
  checkpoint_id?: number;
  status?: "pending" | "completed" | "missed" | "late";
  date_from?: string;
  date_to?: string;
}
