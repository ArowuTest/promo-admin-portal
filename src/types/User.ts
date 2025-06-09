/**
 * Represents an admin user as returned by the API.
 */
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'SENIORUSER' | 'WINNERREPORTS' | 'ALLREPORTS';
  status: 'Active' | 'Inactive' | 'Locked';
  created: string;
  updated: string;
}

/**
 * Payload for creating a new admin user.
 */
export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'SENIORUSER' | 'WINNERREPORTS' | 'ALLREPORTS';
  status: 'Active' | 'Inactive' | 'Locked';
}

/**
 * Payload for updating an existing admin user.
 * All fields are optional.
 */
export interface UpdateUserPayload extends Partial<CreateUserPayload> {}