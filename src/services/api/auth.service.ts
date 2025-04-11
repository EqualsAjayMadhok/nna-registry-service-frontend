import api from './api';
import { User } from '../../contexts/AuthContext';
import { ApiResponse } from '../../types/api.types';

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  // Mock user data for development
  private mockUser: User = {
    id: 'user-1',
    username: 'demouser',
    email: 'demo@example.com',
    role: 'user'
  };

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Login attempt with mock data flag:', process.env.REACT_APP_USE_MOCK_DATA);
      
      // For development or when explicitly requested, use mock data
      // The env var can come from different places (window.process.env or process.env)
      const useMockData = 
        process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
        (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('Using mock authentication data');
        
        // For demo purposes, accept any credentials
        // In a real app, you would validate email and password
        return {
          user: this.mockUser,
          token: 'mock-jwt-token'
        };
      }

      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password
      });
      
      return response.data.data as AuthResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      // For development or when explicitly requested, use mock data
      const useMockData = 
        process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
        (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('Using mock registration data');
        
        // For demo purposes, accept any registration
        return {
          user: {
            ...this.mockUser,
            username,
            email
          },
          token: 'mock-jwt-token'
        };
      }

      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
        username,
        email,
        password
      });
      
      return response.data.data as AuthResponse;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // For development or when explicitly requested, use mock data
      const useMockData = 
        process.env.REACT_APP_USE_MOCK_DATA === 'true' || 
        (window as any).process?.env?.REACT_APP_USE_MOCK_DATA === 'true';
      
      if (useMockData) {
        console.log('Using mock user data');
        return this.mockUser;
      }

      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.data as User;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user');
    }
  }
}

// Export a singleton instance
export default new AuthService();