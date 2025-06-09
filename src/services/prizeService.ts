import apiClient from './apiClient';
import type { PrizeStructure, PrizeStructurePayload } from '@types/Prize';

export const fetchPrizeStructures = async (): Promise<PrizeStructure[]> => {
    const response = await apiClient.get<PrizeStructure[]>('/prize-structures');
    return response.data;
};

// New function to get valid prize structures for a specific date
export const fetchValidPrizeStructuresForDate = async (date: string): Promise<PrizeStructure[]> => {
    const response = await apiClient.get<PrizeStructure[]>(`/prize-structures?date=${date}`);
    return response.data;
};

export const createPrizeStructure = async (payload: PrizeStructurePayload): Promise<PrizeStructure> => {
    const response = await apiClient.post<PrizeStructure>('/prize-structures', payload);
    return response.data;
};

export const updatePrizeStructure = async ({ id, payload }: { id: string, payload: PrizeStructurePayload }): Promise<PrizeStructure> => {
    const response = await apiClient.put<PrizeStructure>(`/prize-structures/${id}`, payload);
    return response.data;
};

export const deletePrizeStructure = async (id: string): Promise<void> => {
    await apiClient.delete(`/prize-structures/${id}`);
};