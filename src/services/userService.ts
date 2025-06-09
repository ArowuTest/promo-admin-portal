import apiClient from './apiClient';
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from '@types/User';

export const fetchUsers = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUser[]>('/admin/users');
  return response.data;
};

export const createUser = async (data: CreateUserPayload): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>('/admin/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: UpdateUserPayload): Promise<AdminUser> => {
  const response = await apiClient.put<AdminUser>(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/users/${id}`);
};