import { LoginRequest, RegisterRequest, User, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest, ResetPasswordResponse } from '../../types/auth.types';
import { ApiResponse } from '../../types/api.types';
import api from './api';

export class AuthService {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
      if (response.data.success && response.data.data) {
        this.storage.setItem('accessToken', response.data.data.token);
        this.storage.setItem('user', JSON.stringify(response.data.data.user));
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
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      if (response.data.success && response.data.data) {
        this.storage.setItem('accessToken', response.data.data.token);
        this.storage.setItem('user', JSON.stringify(response.data.data.user));
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
  }

  logout(): void {
    this.storage.removeItem('accessToken');
    this.storage.removeItem('user');
  }

  getCurrentUser(): any {
    const userStr = this.storage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem('accessToken');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes('admin') : false;
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

  clearStorage(): void {
    this.storage.removeItem('accessToken');
    this.storage.removeItem('user');
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

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      const response = await api.post<ApiResponse<void>>('/auth/forgot-password', data);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to send reset instructions');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to send reset instructions. Please try again.');
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await api.post<ApiResponse<ResetPasswordResponse>>('/auth/reset-password', data);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to reset password');
      }
      return response.data.data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to reset password. Please try again.');
    }
  }
}

const authService = new AuthService();
export default authService;