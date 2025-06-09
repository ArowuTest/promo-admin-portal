import apiClient from './apiClient';
import type { WinnerRecord } from '@types/Winner';

export const fetchWinnersByDrawId = async (drawId: string): Promise<WinnerRecord[]> => {
    // Corrected to use the proper API endpoint
    const response = await apiClient.get<WinnerRecord[]>(`/draws/${drawId}/winners`);
    return response.data;
};