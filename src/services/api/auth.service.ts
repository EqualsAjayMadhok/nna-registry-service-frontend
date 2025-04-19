import api, { apiConfig } from './api';
import { User } from '../../contexts/AuthContext';
import { ApiResponse } from '../../types/api.types';

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  // Mock user data for development and demo
  private mockUser: User = {
    id: 'user-1',
    username: 'demouser',
    email: 'demo@example.com',
    role: 'user'
  };

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Login attempt with mock data:', apiConfig.useMockData);
      
      if (apiConfig.useMockData) {
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
      console.log('AuthService: Registration attempt with mock data enabled:', apiConfig.useMockData);
      
      if (apiConfig.useMockData) {
        console.log('AuthService: Using mock registration data');
        
        // Check for existing email/username to simulate real-world validations
        const existingEmailKey = `mock_email_${email}`;
        const existingUsernameKey = `mock_username_${username}`;
        
        // Check if the email is already registered (using localStorage for mock persistence)
        if (localStorage.getItem(existingEmailKey)) {
          console.error('AuthService: Mock email already exists');
          throw new Error('Email already registered');
        }
        
        // Check if the username is already taken
        if (localStorage.getItem(existingUsernameKey)) {
          console.error('AuthService: Mock username already exists');
          throw new Error('Username already taken');
        }
        
        // Store the registration in mock storage
        localStorage.setItem(existingEmailKey, 'registered');
        localStorage.setItem(existingUsernameKey, 'registered');
        
        // For demo purposes, create a mock user
        const mockUser = {
          id: `user-${Date.now()}`,
          username,
          email,
          role: 'user'
        };
        
        return {
          user: mockUser,
          token: `mock-jwt-token-${Date.now()}`
        };
      }

      console.log('AuthService: Making real API call to register');
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
        username,
        email,
        password
      });
      
      console.log('AuthService: Registration API response:', response.data);
      return response.data.data as AuthResponse;
    } catch (error) {
      console.error('AuthService: Registration error:', error);
      
      // Enhanced error handling
      if (error && (error as any).response) {
        const response = (error as any).response;
        console.error('AuthService: Error response:', response);
        
        // Extract specific error messages from API response
        if (response.data && response.data.message) {
          throw new Error(response.data.message);
        } else if (response.data && response.data.error) {
          throw new Error(response.data.error);
        } else if (response.status === 409) {
          // Conflict - likely duplicate username/email
          throw new Error('Username or email already exists');
        } else if (response.status === 400) {
          // Bad request - validation error
          throw new Error('Invalid registration data. Please check your inputs.');
        } else if (response.status >= 500) {
          // Server error
          throw new Error('Server error. Please try again later.');
        }
      }
      
      // Fall back to generic error handling
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Registration failed');
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      if (apiConfig.useMockData) {
        console.log('Using mock user data');
        return this.mockUser;
      }

      const response = await api.get<ApiResponse<User>>('/auth/profile');
      return response.data.data as User;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user');
    }
  }
  
  // Helper to toggle between mock and real API
  toggleMockData(useMock: boolean): void {
    apiConfig.setUseMockData(useMock);
  }
}

// Export a singleton instance
export default new AuthService();