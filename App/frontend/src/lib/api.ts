import axios from 'axios';

// Get API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies/auth
});

// Request interceptor for adding auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response?.status === 401) {
      // Handle unauthorized (could redirect to login)
      console.error('Authentication required');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // Users
  getCurrentUser: () => api.get('/api/users/me'),
  updateUserProfile: (data: any) => api.put('/api/users/profile', data),
  
  // Scenarios
  getScenarios: () => api.get('/api/scenarios'),
  getScenarioById: (id: string) => api.get(`/api/scenarios/${id}`),
  createScenario: (data: any) => api.post('/api/scenarios', data),
  
  // Sessions
  getSessions: () => api.get('/api/sessions'),
  getSessionById: (id: string) => api.get(`/api/sessions/${id}`),
  createSession: (data: any) => api.post('/api/sessions', data),
  
  // Other methods as needed...
};

export default apiClient;
