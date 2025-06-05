// src/hooks/useAuth.ts

// We will store three separate values in localStorage:
//  - raw JWT under "token"
//  - username under "username"
//  - role under "role"

const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';
const ROLE_KEY = 'role';

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
 * Remove JWT, username, and role from localStorage.
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
}

/**
 * Save username and role in localStorage.
 */
export function setUserInfo(username: string, role: string) {
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(ROLE_KEY, role);
}

/**
 * Read the stored username from localStorage.
 */
export function getStoredUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

/**
 * Read the stored role from localStorage.
 */
export function getStoredRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}
