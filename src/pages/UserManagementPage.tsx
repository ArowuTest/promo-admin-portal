import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser, deleteUser } from '@services/userService';
import { AdminUser, CreateUserPayload, UpdateUserPayload } from '@types/User';
import Spinner from '@components/Spinner';
import { v4 as uuidv4 } from 'uuid';

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<AdminUser[]>(['users'], fetchUsers);

  const createMutation = useMutation(createUser, {
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });
  const updateMutation = useMutation(({ id, data }: { id: string; data: UpdateUserPayload }) => updateUser(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });
  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CreateUserPayload>({
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
    status: 'Active',
  });

  useEffect(() => {
    if (editing && data) {
      const user = data.find(u => u.id === editing);
      if (user) {
        setFormValues({ username: user.username, email: user.email, password: '', role: user.role, status: user.status });
      }
    }
  }, [editing, data]);

  const startEdit = (u: AdminUser) => {
    setEditing(u.id);
  };
  const cancelEdit = () => {
    setEditing(null);
    setFormValues({ username: '', email: '', password: '', role: 'ADMIN', status: 'Active' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const payload: UpdateUserPayload = {
        username: formValues.username,
        email: formValues.email,
        role: formValues.role,
        status: formValues.status,
      };
      if (formValues.password) payload.password = formValues.password;
      updateMutation.mutate({ id: editing, data: payload });
    } else {
      const payload: CreateUserPayload = {
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
        role: formValues.role,
        status: formValues.status,
      };
      createMutation.mutate(payload);
    }
    cancelEdit();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this user?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-500">Failed to load users</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Users</h2>
      <div className="bg-white rounded shadow mb-6">
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border">Username</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Role</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map(u => (
              <tr key={u.id} className="bg-white">
                <td className="px-4 py-2 border">{u.username}</td>
                <td className="px-4 py-2 border">{u.email}</td>
                <td className="px-4 py-2 border">{u.role}</td>
                <td className="px-4 py-2 border">{u.status}</td>
                <td className="px-4 py-2 border space-x-2">
                  <button
                    onClick={() => startEdit(u)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Form */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">{editing ? 'Edit' : 'New'} User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={formValues.username}
              onChange={e => setFormValues({ ...formValues, username: e.target.value })}
              required
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={formValues.email}
              onChange={e => setFormValues({ ...formValues, email: e.target.value })}
              required
              className="mt-1 w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Password {editing && '(leave blank to keep)'}</label>
            <input
              type="password"
              value={formValues.password}
              onChange={e => setFormValues({ ...formValues, password: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded"
              {...(!editing && { required: true })}
            />
          </div>
          <div>
            <label className="block text-gray-700">Role</label>
            <select
              value={formValues.role}
              onChange={e => setFormValues({ ...formValues, role: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded"
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
              value={formValues.status}
              onChange={e => setFormValues({ ...formValues, status: e.target.value })}
              className="mt-1 w-full px-3 py-2 border rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Locked">Locked</option>
            </select>
          </div>
          <div className="space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editing ? 'Update' : 'Create'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
 
