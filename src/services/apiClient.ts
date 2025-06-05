// src/services/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getToken } from '@hooks/useAuth';

/**
 * Base URL for all API calls. 
 * If VITE_API_BASE_URL is set (e.g. on Vercel), we use that;
 * otherwise default to local dev.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
