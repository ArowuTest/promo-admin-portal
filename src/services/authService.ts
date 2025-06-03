// src/services/authService.ts
import { apiClient } from "./apiClient";

/**
 * Data we send to the backend on login.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Data the backend returns on a successful login.
 * Adjust this if your backend returns a different shape.
 */
export interface LoginResponse {
  token:    string;
  role:     string;
  user_id:  string;
  username: string;
}

/**
 * Call POST /admin/login (i.e. ${VITE_API_BASE_URL}/admin/login).
 * On success, the backend returns { token: ... }.
 */
export function login(payload: LoginRequest): Promise<LoginResponse> {
  // apiClient is already configured with baseURL = VITE_API_BASE_URL
  return apiClient
    .post<LoginResponse>("/admin/login", payload)
    .then((res) => res.data);
}
