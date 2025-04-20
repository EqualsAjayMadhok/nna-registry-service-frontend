import { LoginRequest, RegisterRequest, User, AuthResponse } from '../../types/auth.types';
import { ApiResponse } from '../../types/api.types';
import api from './api';

export class AuthService {
  private storage: Storage;

  constructor(storage: Storage = window.localStorage) {
    this.storage = storage;
  }

  async login(loginRequest: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', loginRequest);
      const { token, user } = response.data.data;
      this.storage.setItem('accessToken', token);
      this.storage.setItem('user', JSON.stringify(user));
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  async register(registerRequest: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', registerRequest);
      const { token, user } = response.data.data;
      this.storage.setItem('accessToken', token);
      this.storage.setItem('user', JSON.stringify(user));
      return response.data.data;
    } catch (error: any) {
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
    this.storage.removeItem('accessToken');
    this.storage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = this.storage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.storage.getItem('accessToken');
    return token !== null;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.includes('admin');
    }
    
    return false;
  }

  clearStorage(): void {
    this.storage.removeItem('accessToken');
    this.storage.removeItem('user');
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

const authService = new AuthService();
export default authService;