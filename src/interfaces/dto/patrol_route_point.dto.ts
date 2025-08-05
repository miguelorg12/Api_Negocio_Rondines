export interface PatrolRoutePointDto {
  latitude: number;
  longitude: number;
  order: number;
  google_place_id?: string;
  address?: string;
  formatted_address?: string;
  checkpoint_id: number;
}

export interface CreatePatrolWithRoutePointsDto {
  // Datos del patrol
  name: string;
  active?: boolean | true;
  branch_id: number;

  // Array de puntos de ruta
  route_points: PatrolRoutePointDto[];
}

export type PartialPatrolRoutePointDto = Partial<PatrolRoutePointDto>;
