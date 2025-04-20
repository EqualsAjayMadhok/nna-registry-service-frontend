import { LoginRequest, RegisterRequest, User } from '../../types/auth.types';
import { ApiResponse } from '../../types/api.types';
import createApiClient from './axios';

const api = createApiClient(process.env.REACT_APP_API_URL || 'http://localhost:3000/api');

export interface AuthResponse {
  access_token: string;
  user: User;
}

class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Login failed');
      }
      
      const { access_token, user } = response.data.data;
      
      // Store token and user data consistently
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data.data;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Registration failed');
      }
      
      const { access_token, user } = response.data.data;
      
      // Store token and user data consistently
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  async getProfile(): Promise<User> {
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
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      this.logout(); // Clear invalid data
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === 'admin' || (user.roles && user.roles.includes('admin')) : false;
  }

  clearStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.clear();
  }

  async createTestUser(): Promise<void> {
    const testUser = {
      username: `test_user_${Date.now()}`,
      email: `test_user_${Date.now()}@example.com`,
      password: 'Test123!@#'
    };
    
    try {
      await this.register(testUser);
    } catch (error) {
      console.error('Error creating test user:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;