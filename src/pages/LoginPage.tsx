// src/pages/LoginPage.tsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, LoginRequest, LoginResponse } from '@services/authService';
import { AuthContext } from '@contexts/AuthContext';
import Spinner from '@components/Spinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: doLogin } = useContext(AuthContext);

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🟢 handleSubmit() fired with:', { username, password });
    setLoading(true);
    setError(null);

    // Build the exact payload shape the backend expects:
    const payload: LoginRequest = {
      username: username.trim(),
      password: password,
    };

    console.log('📤 About to call login() with payload:', payload);
    try {
      // NOTE: loginService() resolves to something like { token, role, user_id, username }
      const response: LoginResponse = await loginService(payload);
      console.log('✅ login() returned:', response);

      // Immediately hand **all** of it to AuthContext.login (token + role + username)
      doLogin({
        token: response.token,
        role: response.role,
        username: response.username,
      });

      // Navigate to the default protected page (e.g. “/draws”)
      navigate('/draws');
    } catch (err: any) {
      console.error('❌ Login error caught:', err);
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            {loading ? <Spinner /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
