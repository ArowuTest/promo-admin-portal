import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, createUser, updateUser, deleteUser } from '@services/userService';
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from '@types/User';
import Spinner from '@components/Spinner';

const emptyFormState: CreateUserPayload = {
    username: '',
    email: '',
    password: '',
    role: 'ADMIN',
    status: 'Active',
};

export default function UserManagementPage() {
    const queryClient = useQueryClient();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<CreateUserPayload>(emptyFormState);
    const [formError, setFormError] = useState<string | null>(null);

    const { data: users, isLoading } = useQuery<AdminUser[], Error>({ queryKey: ['users'], queryFn: fetchUsers });

    const mutationOptions = {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); resetForm(); },
        onError: (err: any) => { setFormError(err.response?.data?.error || 'An error occurred'); }
    };

    const createMutation = useMutation({ mutationFn: createUser, ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (vars: { id: string, data: UpdateUserPayload }) => updateUser(vars.id, vars.data), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); } });
    
    const resetForm = () => {
        setEditingId(null);
        setFormValues(emptyFormState);
        setIsFormVisible(false);
        setFormError(null);
    };

    const startEdit = (user: AdminUser) => {
        setEditingId(user.id);
        setFormValues({ ...user, password: '' });
        setIsFormVisible(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (editingId) {
            const { username, email, password, role, status } = formValues;
            const payload: UpdateUserPayload = { username, email, role, status };
            if (password) { payload.password = password; }
            updateMutation.mutate({ id: editingId, data: payload });
        } else {
            createMutation.mutate(formValues);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                {!isFormVisible && <button onClick={() => { setIsFormVisible(true); setEditingId(null); setFormValues(emptyFormState); }} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add New User</button>}
            </div>
            
            {isFormVisible && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-md bg-gray-50 space-y-4">
                    <h2 className="text-lg font-semibold">{editingId ? `Editing ${formValues.username}` : 'Create New User'}</h2>
                    {formError && <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm">{formError}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Username" value={formValues.username} onChange={e => setFormValues({...formValues, username: e.target.value})} required className="rounded-md"/>
                        <input type="email" placeholder="Email" value={formValues.email} onChange={e => setFormValues({...formValues, email: e.target.value})} required className="rounded-md"/>
                        <input type="password" placeholder={editingId ? 'New Password (optional)' : 'Password'} value={formValues.password} onChange={e => setFormValues({...formValues, password: e.target.value})} required={!editingId} className="rounded-md"/>
                        <select value={formValues.role} onChange={e => setFormValues({...formValues, role: e.target.value as CreateUserPayload['role']})} className="rounded-md">
                            <option value="SUPERADMIN">SUPERADMIN</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SENIORUSER">SENIORUSER</option>
                        </select>
                        <select value={formValues.status} onChange={e => setFormValues({...formValues, status: e.target.value as CreateUserPayload['status']})} className="col-span-2 md:col-span-1 rounded-md">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Locked">Locked</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading} className="w-28 flex justify-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400">{createMutation.isLoading || updateMutation.isLoading ? <Spinner/> : 'Save User'}</button>
                    </div>
                </form>
            )}

            {isLoading ? <div className="flex justify-center mt-10"><Spinner /></div> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users?.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => startEdit(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        <button onClick={() => deleteMutation.mutate(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}