// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { login as apiLogin } from '../services/authService'; // this calls POST /admin/login
import { useQueryClient } from '@tanstack/react-query';

export default function LoginPage() {
  const { login } = useAuthContext();
  const qc = useQueryClient();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const response = await apiLogin({ username, password });
      // response is { role, token, user_id, username }
      login(response);
      // Clear cached queries, if any
      qc.clear();
      // AuthProvider will redirect to /draws after setting
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Login</h1>
      {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username{' '}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Password{' '}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>
          Login
        </button>
      </form>
    </div>
  );
}
