import { apiClient } from './apiClient';
import { WinnerRecord } from '@types/Winner';

export function fetchWinners(): Promise<WinnerRecord[]> {
  return apiClient.get<WinnerRecord[]>('/winners').then(res => res.data);
}
 
