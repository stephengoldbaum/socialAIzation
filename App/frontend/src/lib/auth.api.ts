import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types/user';
import config from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies/auth
});

// Request interceptor for adding auth tokens
api.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem(config.auth.tokenStorageKey);
  if (token && reqConfig.headers) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

/**
 * Authentication API service
 * Handles all authentication-related API calls
 */
export const authApi = {
  /**
   * Register a new user
   * @param data Registration data
   * @returns AuthResponse containing user and tokens
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    // Store token in localStorage
    localStorage.setItem(config.auth.tokenStorageKey, response.data.token);
    return response.data;
  },

  /**
   * Login a user
   * @param credentials Login credentials
   * @returns AuthResponse containing user and tokens
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    // Store token in localStorage
    localStorage.setItem(config.auth.tokenStorageKey, response.data.token);
    return response.data;
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      // Always remove token from localStorage, even if API call fails
      localStorage.removeItem(config.auth.tokenStorageKey);
    }
  },

  /**
   * Get the current user
   * @returns User object
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/api/auth/me');
    return response.data.user;
  },

  /**
   * Refresh the access token
   * @param refreshToken Refresh token
   * @returns New tokens
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const response = await api.post<{ token: string; refreshToken: string }>('/api/auth/refresh', { refreshToken });
    // Store new token in localStorage
    localStorage.setItem(config.auth.tokenStorageKey, response.data.token);
    return response.data;
  }
};
