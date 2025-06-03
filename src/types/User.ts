export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Locked';
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  role: string;
  status?: 'Active' | 'Inactive' | 'Locked';
}

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: 'Active' | 'Inactive' | 'Locked';
}
 
