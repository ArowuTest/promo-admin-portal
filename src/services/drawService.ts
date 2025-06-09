import apiClient from './apiClient';
import type { DrawRequest, DrawResponse } from '@types/Draw';

export const executeDraw = async (payload: DrawRequest): Promise<DrawResponse> => {
    const { data } = await apiClient.post<DrawResponse>('/draws/execute', payload);
    return data;
};

export const rerunDraw = async (vars: { drawId: string; payload: DrawRequest }): Promise<DrawResponse> => {
    const { data } = await apiClient.post<DrawResponse>(`/draws/rerun/${vars.drawId}`, vars.payload);
    return data;
};

export const listDraws = async (): Promise<any[]> => {
    const { data } = await apiClient.get<any[]>('/draws');
    return data;
};