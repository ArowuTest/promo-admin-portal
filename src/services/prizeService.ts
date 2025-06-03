import { apiClient } from './apiClient';
import { PrizeStructure } from '@types/Prize';

export function fetchPrizeStructures(): Promise<PrizeStructure[]> {
  return apiClient.get<PrizeStructure[]>('/prizes').then(res => res.data);
}

export function createPrizeStructure(data: PrizeStructure): Promise<PrizeStructure> {
  return apiClient.post<PrizeStructure>('/prizes', data).then(res => res.data);
}

export function updatePrizeStructure(id: string, data: PrizeStructure): Promise<PrizeStructure> {
  return apiClient.put<PrizeStructure>(`/prizes/${id}`, data).then(res => res.data);
}

export function deletePrizeStructure(id: string): Promise<void> {
  return apiClient.delete(`/prizes/${id}`).then(() => {});
}
 
