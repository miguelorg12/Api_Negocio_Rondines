export interface CreateNetworkDto {
  ssid: string;
  password: string;
  branch_id: number;
}

export type PartialNetworkDto = Partial<CreateNetworkDto>;
