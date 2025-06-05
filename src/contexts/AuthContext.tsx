// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import jwt_decode from 'jwt-decode';
import { login as apiLogin } from '../services/authService'; // assume you have an authService that POSTs to /admin/login
import { useNavigate } from 'react-router-dom';

interface AuthUser {
  username: string;
  role: string;
  user_id: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (data: AuthUser) => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('promoAuth');
    return stored ? JSON.parse(stored) : null;
  });

  const navigate = useNavigate();

  function login(data: AuthUser) {
    // data contains { token, username, role, user_id }
    setUser(data);
    localStorage.setItem('promoAuth', JSON.stringify(data));
    // After login, redirect into dashboard home (e.g. /draws)
    navigate('/draws');
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('promoAuth');
    navigate('/login');
  }

  function getToken() {
    return user?.token || null;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
