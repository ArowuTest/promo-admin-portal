export interface WinnerRecord {
  id: string;
  drawId: string;
  prizeTier: string;
  position: 'Winner' | 'RunnerUp';
  msisdn: string;       // full MSISDN (masked on UI)
  date: string;         // ISO string
}
 
