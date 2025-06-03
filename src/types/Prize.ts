export interface PrizeTier {
  id: string;
  name: string;
  amount: number;      // e.g. Naira amount
  quantity: number;    // how many winners for this tier
  runnerUps: number;   // how many runner‐ups
}

export interface PrizeStructure {
  id: string;
  effectiveDate: string; // YYYY-MM-DD
  currency: string;      // e.g. "₦"
  tiers: PrizeTier[];
}
 
