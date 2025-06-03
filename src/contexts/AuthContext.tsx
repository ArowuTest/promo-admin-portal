// src/contexts/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getToken, setToken, clearToken, getUserInfoFromToken } from '@hooks/useAuth';

// Extend what `getUserInfoFromToken(...)` should return:
// (You’ll likely need to add `user_id` to that function’s returned shape.)
export interface DecodedUser {
  user_id:  string;
  username: string;
  role:     string;
}

export interface AuthContextType {
  token:    string | null;
  user_id:  string | null;
  role:     string | null;
  username: string | null;
  login:   (token: string) => void;
  logout:  () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token:    null,
  user_id:  null,
  role:     null,
  username: null,
  login:    () => {},
  logout:   () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State fields for all four values
  const [token,    setTokenState]    = useState<string | null>(null);
  const [user_id,  setUserId]        = useState<string | null>(null);
  const [role,     setRole]          = useState<string | null>(null);
  const [username, setUsernameState] = useState<string | null>(null);

  // On mount, read any existing JWT from storage, decode it, and populate the fields
  useEffect(() => {
    const raw = getToken();               // read `localStorage.getItem("token")`
    if (raw) {
      const info: DecodedUser = getUserInfoFromToken(raw);
      if (info) {
        setTokenState(raw);
        setUserId(info.user_id);
        setRole(info.role);
        setUsernameState(info.username);
      }
    }
  }, []);

  // call this after a successful login: stores token + decodes it
  const login = (newToken: string) => {
    // 1) Write the raw JWT into localStorage
    setToken(newToken);

    // 2) Decode out user_id / username / role
    const info: DecodedUser = getUserInfoFromToken(newToken);

    // 3) Store everything in React state
    setTokenState(newToken);
    setUserId(info.user_id);
    setRole(info.role);
    setUsernameState(info.username);
  };

  const logout = () => {
    clearToken();           // remove “token” from localStorage
    setTokenState(null);
    setUserId(null);
    setRole(null);
    setUsernameState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user_id,
        role,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
