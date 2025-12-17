export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent';
  created_at: string;
  last_login?: string;
  status: 'active' | 'inactive';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'admin' | 'agent';
}