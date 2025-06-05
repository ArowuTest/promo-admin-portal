// File: src/services/prizeService.ts

import apiClient from './apiClient';

/**
 * Matches exactly what the backend returns under GET /api/v1/prize-structures
 */
export interface PrizeTier {
  ID: string;
  PrizeStructureID: string;
  TierName: string;
  Amount: number;
  Quantity: number;
  RunnerUpCount: number;   // <— runner-up count is compulsory
  OrderIndex: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface PrizeStructure {
  ID: string;
  Name: string;
  Effective: string; // e.g. "2025-06-04T00:00:00Z"
  CreatedAt?: string;
  UpdatedAt?: string;
  Tiers: PrizeTier[];
}

/**
 * Fetch all prize structures 
 * (GET /api/v1/prize-structures)
 */
export function fetchPrizeStructures(): Promise<PrizeStructure[]> {
  return apiClient.get<PrizeStructure[]>('/prize-structures').then((res) => res.data);
}

/**
 * Create a new PrizeStructure
 * (POST /api/v1/prize-structures)
 * 
 * The backend expects:
 * {
 *   name: string,
 *   effective: string,
 *   tiers: [
 *     { tier_name: string, amount: number, quantity: number, runner_up_count: number, order_index: number },
 *     ...
 *   ]
 * }
 */
export function createPrizeStructure(payload: {
  name: string;
  effective: string;
  tiers: Array<{
    tier_name: string;
    amount: number;
    quantity: number;
    runner_up_count: number;
    order_index: number;
  }>;
}): Promise<PrizeStructure> {
  return apiClient.post<PrizeStructure>('/prize-structures', payload).then((res) => res.data);
}

/**
 * Update an existing PrizeStructure
 * (PUT /api/v1/prize-structures/:id)
 */
export function updatePrizeStructure(
  id: string,
  payload: {
    name: string;
    effective: string;
    tiers: Array<{
      ID?: string; // if existing tier, include its ID
      tier_name: string;
      amount: number;
      quantity: number;
      runner_up_count: number;
      order_index: number;
    }>;
  }
): Promise<PrizeStructure> {
  return apiClient.put<PrizeStructure>(`/prize-structures/${id}`, payload).then((res) => res.data);
}

/**
 * Delete a prize structure by ID
 * (DELETE /api/v1/prize-structures/:id)
 */
export function deletePrizeStructure(id: string): Promise<void> {
  return apiClient.delete(`/prize-structures/${id}`).then(() => {});
}
