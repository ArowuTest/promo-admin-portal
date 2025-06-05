// src/services/apiClient.ts

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getToken } from '@hooks/useAuth'; // note: this is a named export

// Base URL for all API calls. `VITE_API_BASE_URL` should be something like "https://promo-backend-ensh.onrender.com/api/v1"
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token if present
apiClient.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
