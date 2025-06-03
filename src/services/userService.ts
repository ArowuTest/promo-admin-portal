import { apiClient } from './apiClient';
import { AdminUser, CreateUserPayload, UpdateUserPayload } from '@types/User';

export function fetchUsers(): Promise<AdminUser[]> {
  return apiClient.get<AdminUser[]>('/admin/users').then(res => res.data);
}

export function createUser(data: CreateUserPayload): Promise<AdminUser> {
  return apiClient.post<AdminUser>('/admin/users', data).then(res => res.data);
}

export function updateUser(id: string, data: UpdateUserPayload): Promise<AdminUser> {
  return apiClient.put<AdminUser>(`/admin/users/${id}`, data).then(res => res.data);
}

export function deleteUser(id: string): Promise<void> {
  return apiClient.delete(`/admin/users/${id}`).then(() => {});
}
 
