// src/pages/UserManagementPage.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@services/apiClient';
import Spinner from '@components/Spinner';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  created: string;
  updated: string;
}

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password: string;
    role: string;
    status: string;
  }>({
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
    status: 'Active',
  });

  // 1) Fetch all users
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<AdminUser[]>('adminUsers', () =>
    apiClient.get<AdminUser[]>('/admin/users').then((res) => res.data)
  );

  // 2) Create user mutation
  const createUserMutation = useMutation(
    (newUser: {
      username: string;
      email: string;
      password: string;
      role: string;
      status: string;
    }) => apiClient.post<AdminUser>('/admin/users', newUser),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'ADMIN',
          status: 'Active',
        });
      },
    }
  );

  // 3) Update user mutation
  const updateUserMutation = useMutation(
    ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        username: string;
        email: string;
        password: string;
        role: string;
        status: string;
      }>;
    }) => apiClient.put<AdminUser>(`/admin/users/${id}`, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
        setEditingUserId(null);
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'ADMIN',
          status: 'Active',
        });
      },
    }
  );

  // 4) Delete user mutation
  const deleteUserMutation = useMutation(
    (id: string) => apiClient.delete(`/admin/users/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminUsers');
      },
    }
  );

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Error fetching users.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>

      {/* ─── Create / Edit Form ───────────────────────── */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-medium mb-2">
          {editingUserId ? 'Edit User' : 'Create New User'}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingUserId) {
              updateUserMutation.mutate({
                id: editingUserId,
                updates: {
                  username: formData.username,
                  email: formData.email,
                  password: formData.password || undefined,
                  role: formData.role,
                  status: formData.status,
                },
              });
            } else {
              createUserMutation.mutate({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                status: formData.status,
              });
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData((f) => ({ ...f, username: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((f) => ({ ...f, email: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">
              {editingUserId ? 'New Password (leave blank to keep)' : 'Password'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((f) => ({ ...f, password: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
              {...(!editingUserId && { required: true })}
            />
          </div>
          <div>
            <label className="block text-gray-700">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((f) => ({ ...f, role: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="SUPERADMIN">SUPERADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SENIORUSER">SENIORUSER</option>
              <option value="WINNERREPORTS">WINNERREPORTS</option>
              <option value="ALLREPORTS">ALLREPORTS</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((f) => ({ ...f, status: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2 flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={
                createUserMutation.isLoading || updateUserMutation.isLoading
              }
            >
              {(editingUserId && updateUserMutation.isLoading) ||
              createUserMutation.isLoading ? (
                <Spinner />
              ) : editingUserId ? (
                'Update User'
              ) : (
                'Create User'
              )}
            </button>
            {editingUserId && (
              <button
                type="button"
                onClick={() => {
                  setEditingUserId(null);
                  setFormData({
                    username: '',
                    email: '',
                    password: '',
                    role: 'ADMIN',
                    status: 'Active',
                  });
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ─── Users List ───────────────────────── */}
      <div className="bg-white p-4 rounded shadow">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border">Username</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Created</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-100"
                >
                  <td className="px-4 py-2 border">{u.username}</td>
                  <td className="px-4 py-2 border">{u.email}</td>
                  <td className="px-4 py-2 border">{u.role}</td>
                  <td className="px-4 py-2 border">{u.status}</td>
                  <td className="px-4 py-2 border">
                    {u.created.slice(0, 10)}
                  </td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => {
                        setEditingUserId(u.id);
                        setFormData({
                          username: u.username,
                          email: u.email,
                          password: '',
                          role: u.role,
                          status: u.status,
                        });
                      }}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUserMutation.mutate(u.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
