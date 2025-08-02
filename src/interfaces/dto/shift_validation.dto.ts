export interface ShiftValidationDto {
  biometric: number;
  timestamp: Date;
}

export interface ShiftValidationResponse {
  success: boolean;
  message: string;
  status?: string;
  patrolRecord?: any;
  shift?: any;
} 