// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getToken, setToken as storeToken, clearToken, getUserInfoFromToken } from '@hooks/useAuth';

// We expect login() to receive an object containing { token, role, username }.
// That way we don't need to re‐decode the token; we can just trust the backend response.
export interface AuthContextType {
  token: string | null;
  role: string | null;
  username: string | null;
  login: (payload: { token: string; role: string; username: string }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  username: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // On mount, check localStorage to see if we already have a token.
  // If so, decode it or rehydrate from it (since backend response returns role + username in token).
  useEffect(() => {
    const saved = getToken();
    if (saved) {
      // decode the info from token in case user reloads page
      const info = getUserInfoFromToken(saved);
      if (info && info.username && info.role) {
        setTokenState(saved);
        setRole(info.role);
        setUsername(info.username);
      }
    }
  }, []);

  /**
   * login() now expects the full payload from the login endpoint,
   * which contains token, role, and username.
   **/
  const login = (payload: { token: string; role: string; username: string }) => {
    const { token: newToken, role: newRole, username: newUsername } = payload;
    // persist raw JWT
    storeToken(newToken);
    // store in React state
    setTokenState(newToken);
    setRole(newRole);
    setUsername(newUsername);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
