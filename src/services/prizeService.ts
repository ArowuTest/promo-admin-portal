// src/services/prizeService.ts
import apiClient from './apiClient';

/**
 * PrizeTier exactly matches what the backend returns:
 */
export interface PrizeTier {
  ID: string;
  PrizeStructureID: string;
  TierName: string;
  Amount: number;
  Quantity: number;
  RunnerUpCount: number;
  OrderIndex: number;
}

export interface PrizeStructure {
  id: string;
  name: string;
  effective: string; // e.g. "2025-06-04T00:00:00Z"
  tiers: PrizeTier[];
}

/**
 * 1) GET /api/v1/prize-structures
 */
export function fetchPrizeStructures(): Promise<PrizeStructure[]> {
  return apiClient
    .get<PrizeStructure[]>('/prize-structures')
    .then((res) => res.data);
}

/**
 * 2) POST /api/v1/prize-structures
 */
export interface PrizeStructurePayload {
  name: string;
  effective: string; // "2025-06-04"
  tiers: Array<{
    TierName: string;
    Amount: number;
    Quantity: number;
    RunnerUpCount: number;
    OrderIndex: number;
  }>;
}

export function createPrizeStructure(
  payload: PrizeStructurePayload
): Promise<PrizeStructure> {
  return apiClient
    .post<PrizeStructure>('/prize-structures', payload)
    .then((res) => res.data);
}

/**
 * 3) PUT /api/v1/prize-structures/:id
 */
export function updatePrizeStructure(
  id: string,
  payload: PrizeStructurePayload
): Promise<PrizeStructure> {
  return apiClient
    .put<PrizeStructure>(`/prize-structures/${id}`, payload)
    .then((res) => res.data);
}

/**
 * 4) DELETE /api/v1/prize-structures/:id
 */
export function deletePrizeStructure(id: string): Promise<void> {
  return apiClient
    .delete(`/prize-structures/${id}`)
    .then(() => {});
}
