import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    user_type: string;
    phone_number: string | null;
    address: string | null;
    bio: string | null;
    profile_image: string | null;
    date_joined: string;
    last_updated: string;
  };
  date_joined: string;
  is_active: boolean;
}

export interface AuthResponse {
  user: UserData;
  token: string;
}

// Authentication services
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/core/login/', credentials);
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // Register a new user
  async register(data: SignupData): Promise<AuthResponse> {
    const response = await api.post('/core/register/', data);
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // Request password reset
  async forgotPassword(data: ForgotPasswordData): Promise<{ success: string }> {
    const response = await api.post('/core/forgot-password/', data);
    return response.data;
  },
  
  // Change password (authenticated)
  async changePassword(data: ChangePasswordData): Promise<{ success: string, token: string }> {
    const response = await api.post('/core/change-password/', data);
    
    // Update token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },
  
  // Get current user profile
  async getProfile(): Promise<UserData> {
    const response = await api.get('/core/profile/');
    return response.data;
  },
  
  // Logout
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page if needed
    window.location.href = '/login';
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
  
  // Get current user from localStorage
  getCurrentUser(): UserData | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};

export default authService; 