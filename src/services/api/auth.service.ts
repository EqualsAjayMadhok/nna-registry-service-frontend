import { LoginRequest, RegisterRequest, User, AuthResponse } from '../../types/auth.types';
import { ApiResponse } from '../../types/api.types';
import api from './api';

export const AuthService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data;
      }
      throw new Error(response.data.error || 'Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Login failed');
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data;
      }
      // Handle error from successful response but with error data
      const responseError = response.data.error as { message: string } | string;
      if (typeof responseError === 'object' && responseError.message) {
        throw new Error(responseError.message);
      }
      throw new Error(typeof responseError === 'string' ? responseError : 'Registration failed');
    } catch (error: any) {
      console.error('Registration error:', error);
      // Log the full error response for debugging
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      // Extract error message from nested structure
      const errorData = error.response?.data;
      const errorMessage = 
        (errorData?.error && typeof errorData.error === 'object' ? errorData.error.message : null) ||  // New backend format
        errorData?.message ||         // Old format
        (typeof errorData?.error === 'string' ? errorData.error : null) ||           // String error
        error.message ||                         // Direct error message
        'Registration failed. Please try again.'; // Fallback
      
      throw new Error(errorMessage);
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): any => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  isAdmin: (): boolean => {
    const user = AuthService.getCurrentUser();
    return user ? user.roles.includes('admin') : false;
  },

  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get profile');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to get profile. Please try again.');
    }
  },

  clearStorage: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
  },

  createTestUser: async (): Promise<void> => {
    const testUser = {
      username: `test_user_${Date.now()}`,
      email: `test_user_${Date.now()}@example.com`,
      password: 'Test123!@#'
    };
    
    try {
      await AuthService.register(testUser);
    } catch (error) {
      console.error('Error creating test user:', error);
      throw error;
    }
  }
};

const authService = AuthService;
export default authService;