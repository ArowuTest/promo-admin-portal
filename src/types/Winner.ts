export interface WinnerRecord {
  id: string;
  msisdn_masked: string;
  msisdn_full?: string; // This is now optional and only present for SUPERADMIN
  prize_tier: string;
  position: number;
  is_runner_up: boolean;
}