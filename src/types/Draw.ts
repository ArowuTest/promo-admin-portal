// src/types/Draw.ts

/** 
 * If the admin uploads a CSV, each row becomes an MSISDNEntry:
 *   { msisdn: string; points: number }
 *   e.g. { msisdn: "08012345678", points: 3 }
 */
export interface MSISDNEntry {
  msisdn: string;
  points: number;
}

/**
 * DrawRequest sent to the backend:
 *  - date: "YYYY-MM-DD"
 *  - optionally, an array of msisdn_entries (if CSV was used)
 */
export interface DrawRequest {
  date: string; // e.g. "2025-06-20"
  msisdn_entries?: MSISDNEntry[];
}

/**
 * Each winner object in the DrawResponse:
 *  - prizeTier: the tier name (e.g. "Jackpot" or "Consolation")
 *  - position: numeric position (1, 2, 3, etc.)
 *  - msisdn: the already‐masked MSISDN from the backend (e.g. "080****5678")
 */
export interface DrawWinner {
  prizeTier: string;
  position: number;
  msisdn: string;
}

/**
 * DrawResponse returned by the backend:
 *  - drawId: UUID of the newly‐created draw
 *  - date: same "YYYY-MM-DD" as requested
 *  - winners: an array of DrawWinner objects
 */
export interface DrawResponse {
  drawId: string;
  date: string;
  winners: DrawWinner[];
}
