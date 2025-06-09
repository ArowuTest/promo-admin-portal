export interface MSISDNEntry {
  msisdn: string;
  points: number;
}

export interface DrawRequest {
  draw_date: string;
  prize_structure_id: string;
  msisdn_entries?: MSISDNEntry[];
}

export interface DrawWinner {
  prize_tier: string;
  position: number;
  masked_msisdn: string;
  is_runner_up: boolean;
}

export interface DrawResponse {
  winners: DrawWinner[];
}