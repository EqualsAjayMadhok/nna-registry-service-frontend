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
    id: 'default-user',
    username: 'demouser',
    email: 'demo@example.com',
    role: 'user'
  };

  // ULTRA SIMPLIFIED LOGIN - ACCEPTS ANY CREDENTIALS
  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    console.log('LOGIN ATTEMPT WITH:', emailOrUsername);
    
    try {
      // If we're in mock mode, create a user based on the login
      if (apiConfig.useMockData) {
        console.log('Using mock authentication - ACCEPTING ANY LOGIN');
        
        // Special case for testuser - always works
        if (emailOrUsername === 'testuser') {
          // Look for hardcoded test user
          const storedTestUser = localStorage.getItem('hardcoded_test_user');
          if (storedTestUser) {
            try {
              const user = JSON.parse(storedTestUser);
              console.log('FOUND HARDCODED TEST USER:', user);
              return { 
                user, 
                token: 'simple-mock-token' 
              };
            } catch (e) {
              console.error('Error parsing test user:', e);
            }
          }
          
          // Create generic test user
          return {
            user: {
              id: 'test-user-id',
              username: 'testuser',
              email: 'test@example.com',
              role: 'user'
            },
            token: 'simple-mock-token'
          };
        }
        
        // For any login, generate a user
        // First determine if it's an email or username
        const isEmail = emailOrUsername.includes('@');
        const username = isEmail ? emailOrUsername.split('@')[0] : emailOrUsername;
        const email = isEmail ? emailOrUsername : `${emailOrUsername}@example.com`;
        
        return {
          user: {
            id: `user-${Date.now()}`,
            username,
            email,
            role: 'user'
          },
          token: 'simple-mock-token'
        };
      } else {
        // Real API calls
        const isEmail = emailOrUsername.includes('@');
        if (isEmail) {
          const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
            email: emailOrUsername,
            password
          });
          return response.data.data as AuthResponse;
        } else {
          const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
            username: emailOrUsername,
            password
          });
          return response.data.data as AuthResponse;
        }
      }
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  // ULTRA SIMPLIFIED REGISTRATION - ALWAYS SUCCEEDS
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    console.log('REGISTRATION ATTEMPT:', username, email);
    
    try {
      if (apiConfig.useMockData) {
        // Always succeed in mock mode
        const user = {
          id: `user-${Date.now()}`,
          username,
          email,
          role: 'user'
        };
        
        return {
          user,
          token: 'simple-mock-token'
        };
      } else {
        // Real API call
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
          username,
          email,
          password
        });
        return response.data.data as AuthResponse;
      }
    } catch (error) {
      console.error('REGISTRATION ERROR:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  // Get current user data
  async getCurrentUser(): Promise<User> {
    try {
      if (apiConfig.useMockData) {
        // In mock mode, return the hardcoded test user if available
        const storedTestUser = localStorage.getItem('hardcoded_test_user');
        if (storedTestUser) {
          try {
            return JSON.parse(storedTestUser);
          } catch (e) {
            console.error('Error parsing test user:', e);
          }
        }
        
        // Otherwise return default mock user
        return this.mockUser;
      }

      // Real API call for production
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      return response.data.data as User;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error('Failed to fetch user profile');
    }
  }
  
  // Toggle mock data mode
  toggleMockData(useMock: boolean): void {
    apiConfig.setUseMockData(useMock);
    console.log('Mock data mode:', useMock ? 'ON' : 'OFF');
  }
  
  // Clear all localStorage data
  clearStorage(): void {
    console.log('Clearing storage...');
    localStorage.clear();
    console.log('All storage cleared');
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;