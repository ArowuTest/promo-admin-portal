// src/services/authService.ts

import apiClient from './apiClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_id: string;
  username: string;
  role: string;
}

/**
 * Send POST /api/v1/admin/login
 * Your backend expects exactly { username, password } in the JSON body,
 * and returns { token, user_id, username, role } on success.
 */
export function login(payload: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/admin/login', payload).then((res) => res.data);
}
