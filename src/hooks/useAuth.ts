// src/hooks/useAuth.ts

// ─── Import jwt-decode as a namespace ───────────────────────────────────────
import * as jwt_decode from 'jwt-decode';

// This is the key name in localStorage where we store the raw JWT string
const TOKEN_KEY = 'token';

export interface DecodedToken {
  user_id: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Save the raw JWT string under 'token' in localStorage.
 */
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retrieve the raw JWT string from localStorage.
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove the JWT from localStorage.
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Decode a JWT string and return { username, role }.
 * If decoding fails, return empty strings.
 */
export function getUserInfoFromToken(
  token: string
): { username: string; role: string } {
  try {
    // Because we imported entire module as a namespace, we must cast to any
    // in order to call it as a function:
    const decoded = (jwt_decode as any)(token) as DecodedToken;
    return { username: decoded.username, role: decoded.role };
  } catch {
    return { username: '', role: '' };
  }
}
