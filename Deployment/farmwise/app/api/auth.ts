import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create an axios instance with improved configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set timeout to avoid hanging requests
  timeout: 10000, // 10 seconds
  // For development, don't send credentials to avoid CSRF issues
  withCredentials: false,
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors gracefully
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server might be down');
    } else if (!error.response) {
      console.error('Network error - no response from server');
    }
    
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  username?: string;
  email?: string;
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
    onboarding_completed: boolean;
  };
  date_joined: string;
  is_active: boolean;
}

export interface AuthResponse {
  user: UserData;
  token: string;
  onboarding_required: boolean;
}

// Authentication services
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/core/login/', credentials);
    
    // Validate and store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Make sure we have valid user data with profile
      if (response.data.user && response.data.user.profile) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // If user data is missing or incomplete, fetch it directly
        try {
          const userData = await this.getProfile();
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to fetch user profile after login:', err);
        }
      }
    }
    
    return response.data;
  },
  
  // Check if username exists
  async checkUsername(username: string): Promise<{ exists: boolean }> {
    const response = await api.post('/core/check-username/', { username });
    return response.data;
  },
  
  // Check if email exists and is valid
  async checkEmail(email: string): Promise<{ exists: boolean, is_valid: boolean }> {
    const response = await api.post('/core/check-email/', { email });
    return response.data;
  },
  
  // Register a new user
  async register(data: SignupData): Promise<AuthResponse> {
    const response = await api.post('/core/register/', data);
    
    // Validate and store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Make sure we have valid user data with profile
      if (response.data.user && response.data.user.profile) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        // If user data is missing or incomplete, fetch it directly
        try {
          const userData = await this.getProfile();
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to fetch user profile after registration:', err);
        }
      }
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
  
  // Get current user profile with improved error handling
  async getProfile(): Promise<UserData> {
    try {
      // Check if we're in a browser environment before making a network request
      if (typeof window === 'undefined') {
        throw new Error('Cannot fetch profile in server environment');
      }
      
      const response = await api.get('/core/profile/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      
      // Handle network errors specifically
      if (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
        console.warn('Network connectivity issue - falling back to cached data');
      }
      
      // Check if we have cached user data to return instead
      const cachedUserData = this.getCurrentUser();
      if (cachedUserData) {
        console.info('Using cached profile data');
        return cachedUserData;
      }
      
      // Handle specific error cases
      if (error.response) {
        // Server returned an error response
        if (error.response.status === 401) {
          // Unauthorized - token might be invalid, clear it
          console.warn('Unauthorized access, clearing authentication data');
          this.logout();
          throw new Error('Authentication required');
        } else if (error.response.status === 500) {
          // Server error - likely an issue with the profile data
          // Return a minimal user object to prevent UI errors
          const token = localStorage.getItem('token');
          if (token) {
            try {
              // Try to decode basic info from token
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                const tokenPayload = JSON.parse(atob(tokenParts[1]));
                if (tokenPayload.user_id) {
                  console.info('Generated minimal profile from token');
                  return {
                    id: tokenPayload.user_id,
                    username: 'user',
                    email: '',
                    first_name: 'User',
                    last_name: '',
                    profile: {
                      user_type: 'FARMER',
                      phone_number: null,
                      address: null,
                      bio: null,
                      profile_image: null,
                      date_joined: new Date().toISOString(),
                      last_updated: new Date().toISOString(),
                      onboarding_completed: false
                    },
                    date_joined: new Date().toISOString(),
                    is_active: true
                  };
                }
              }
            } catch (decodeErr) {
              console.error('Error decoding token:', decodeErr);
            }
          }
        }
      }
      
      // If all else fails, throw the error to be handled by caller
      throw error;
    }
  },
  
  // Complete onboarding
  async completeOnboarding(): Promise<{ success: boolean }> {
    const response = await api.put('/core/complete-onboarding/');
    
    // Update user in localStorage
    await this.refreshUserData();
    
    return response.data;
  },
  
  // Refresh user data in localStorage with retry mechanism
  async refreshUserData(): Promise<void> {
    const maxRetries = 2;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount <= maxRetries) {
      try {
        // Only attempt refreshing if we're in a browser and have a token
        if (typeof window === 'undefined' || !localStorage.getItem('token')) {
          return;
        }
        
        const userData = await this.getProfile();
        localStorage.setItem('user', JSON.stringify(userData));
        return; // Success, exit the function
      } catch (error: any) {
        lastError = error;
        console.error(`Failed to refresh user data (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // Don't retry for auth errors (401) - no point
        if (error.response && error.response.status === 401) {
          break;
        }
        
        // Only retry for network-related errors
        if (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
          retryCount++;
          if (retryCount <= maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            continue;
          }
        }
        
        break; // Don't retry for other errors
      }
    }
    
    // All retries failed or we decided not to retry
    // Don't throw - allow the UI to continue with whatever data we have
    if (lastError) {
      console.warn('All refresh attempts failed, using cached data if available');
    }
  },
  
  // Logout with safer browser environment check
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // For cross-tab communication
    window.dispatchEvent(new Event('authlogout'));
    
    // Redirect to login page after logout
    window.location.href = '/login';
  },
  
  // Get authentication token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
  
  // Check if user needs to complete onboarding
  needsOnboarding(): boolean {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return false;
      }
      
      const user = JSON.parse(userStr) as UserData;
      
      // Safe access - check if profile exists and has onboarding_completed property
      if (!user || !user.profile) {
        return false;
      }
      
      return user.profile.onboarding_completed === false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
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