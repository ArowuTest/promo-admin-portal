import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authService from '@services/authService';

interface DecodedToken {
  user_id: string;
  username: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'SENIORUSER' | 'WINNERREPORTS' | 'ALLREPORTS';
  exp: number;
}

interface AuthUser {
  id: string;
  username: string;
  role: DecodedToken['role'];
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  login: (payload: authService.LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const bootstrapAuth = () => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            try {
                const decoded = jwtDecode<DecodedToken>(storedToken);
                if (decoded.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    setUser({ id: decoded.user_id, username: decoded.username, role: decoded.role });
                } else {
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error('Failed to decode token:', error);
                localStorage.removeItem('authToken');
            }
        }
        setIsLoading(false);
    };
    bootstrapAuth();
  }, []);

  const login = async (payload: authService.LoginRequest) => {
    const response = await authService.login(payload);
    const decoded = jwtDecode<DecodedToken>(response.token);
    
    localStorage.setItem('authToken', response.token);
    setToken(response.token);
    setUser({ id: decoded.user_id, username: decoded.username, role: decoded.role });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const value = { token, user, login, logout, isLoading };

  if (isLoading) {
    return <div>Loading Application...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};