export interface IncidentDto {
  description: string;
  status: string;
  severity: string;
  user_id: number;
  checkpoint_id?: number;
  branch_id?: number;
}

export interface IncidentStatisticsDto {
  start_date: string; // ISO date string
  end_date: string; // ISO date string
}

export interface CompanyIncidentStats {
  company_id: number;
  company_name: string;
  total_incidents: number;
  branches_count: number;
}

export interface BranchIncidentStats {
  branch_id: number;
  branch_name: string;
  company_name: string;
  total_incidents: number;
}

export type PartialIncidentDto = Partial<IncidentDto>;
