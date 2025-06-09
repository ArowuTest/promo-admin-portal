/**
 * Represents a single tier within a prize structure for creating/updating.
 */
export interface PrizeTierPayload {
  tier_name: string;
  amount: number;
  quantity: number;
  runner_up_count: number;
  order_index: number;
}

/**
 * Represents a prize tier as returned by the API (includes ID).
 */
export interface PrizeTier extends PrizeTierPayload {
  ID: string;
  PrizeStructureID: string;
}

/**
 * Represents the payload for creating or updating a prize structure.
 */
export interface PrizeStructurePayload {
  name: string;
  effective: string; // Format: YYYY-MM-DD
  eligible_days: string[]; // e.g., ["Monday", "Saturday"]
  tiers: PrizeTierPayload[];
}

/**
 * Represents the full prize structure object as returned by the API.
 */
export interface PrizeStructure {
  ID: string;
  Name: string;
  Effective: string; // ISO DateTime string
  EligibleDays: string[];
  CreatedAt: string;
  UpdatedAt: string;
  Tiers: PrizeTier[];
}