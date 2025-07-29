import { User, LoginCredentials } from './types';

const AUTH_STORAGE_KEY = 'trucking_auth';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'; 

export const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message || 'Login failed');
    }

    const data = await response.json();

    const user: User = {
      id: data.user?.id || '', 
      email: data.user?.email,
      name: `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim(),
      token: data.token, 
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUser();
  },

  getToken: (): string | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const user = JSON.parse(stored);
    return user.token || null;
  } catch {
    return null;
  }
}
};