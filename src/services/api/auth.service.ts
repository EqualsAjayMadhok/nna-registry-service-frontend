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
      console.log('AuthService: Registration attempt with username:', username, 'email:', email);
      
      // Always use mock mode for quick testing
      console.log('AuthService: Using mock registration (forcing mock mode)');
      
      // Create mock user with provided details
      const mockUser = {
        id: `user-${Date.now()}`,
        username,
        email,
        role: 'user'
      };
      
      const token = `mock-jwt-token-${Date.now()}`;
      
      // Log success
      console.log('AuthService: Successfully registered mock user:', mockUser);
      
      return {
        user: mockUser,
        token
      };
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
  
  // Clean up any test data (for development and testing)
  clearMockStorage(): void {
    console.log('AuthService: Clearing mock storage');
    
    // Find all the mock storage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('mock_email_') || key.startsWith('mock_username_'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all the keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('AuthService: Removed key from storage:', key);
    });
    
    console.log('AuthService: Cleared mock storage');
  }
}

// Export a singleton instance
export default new AuthService();