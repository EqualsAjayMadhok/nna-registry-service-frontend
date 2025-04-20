import { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../../types/auth.types';
import createApiClient from './axios';

const api = createApiClient(process.env.REACT_APP_API_URL || 'http://localhost:3000');

const AuthService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
      
      if (!response.data.data) {
        throw new Error('Invalid response format');
      }
      
      const authData = response.data.data;
      
      if (authData?.access_token && authData?.user) {
        // Store token consistently as 'accessToken'
        localStorage.setItem('accessToken', authData.access_token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        return authData;
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Login failed. Please try again.');
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      
      if (!response.data.data) {
        throw new Error('Invalid response format');
      }
      
      const authData = response.data.data;
      
      if (authData?.access_token && authData?.user) {
        // Store token consistently as 'accessToken'
        localStorage.setItem('accessToken', authData.access_token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        return authData;
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  logout: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): any => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  isAdmin: (): boolean => {
    const user = AuthService.getCurrentUser();
    return user ? (user.role === 'admin' || (user.roles && user.roles.includes('admin'))) : false;
  },

  clearStorage: (): void => {
    localStorage.removeItem('accessToken');
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

export default AuthService;