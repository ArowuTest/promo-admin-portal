import apiClient from './apiClient';
import type { LoginRequest, LoginResponse } from '@types/Auth';

export type { LoginRequest, LoginResponse };

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/admin/login', payload);
  return response.data;
};