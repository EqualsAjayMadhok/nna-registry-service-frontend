import api, { apiConfig } from './api';
import { User } from '../../contexts/AuthContext';
import { ApiResponse } from '../../types/api.types';

interface AuthResponse {
  user: User;
  token: string;
}

// For debugging - dump local storage
function dumpLocalStorage() {
  console.log('--------- localStorage DUMP ---------');
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      keys.push({ key, value: key.includes('token') ? '****' : value });
    }
  }
  console.log('All localStorage keys:', keys);
  console.log('-----------------------------------');
}

class AuthService {
  // Mock user data for development and demo
  private mockUser: User = {
    id: 'user-1',
    username: 'demouser',
    email: 'demo@example.com',
    role: 'user'
  };

  // Simple login that works with both username and email
  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    try {
      // Log input and dump localStorage for debugging
      console.log('🔐 LOGIN ATTEMPT:', { emailOrUsername, password: '****' });
      dumpLocalStorage();
      
      if (apiConfig.useMockData) {
        console.log('Using mock authentication - accepting any credentials');
        
        // Special case for testuser - always works
        if (emailOrUsername === 'testuser') {
          const user = {
            id: 'testuser-id',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          };
          console.log('✅ Login successful with testuser');
          return { user, token: 'mock-token-' + Date.now() };
        }
        
        // For any other username/email, create a user on the fly
        const isEmail = emailOrUsername.includes('@');
        const username = isEmail ? emailOrUsername.split('@')[0] : emailOrUsername;
        const email = isEmail ? emailOrUsername : `${emailOrUsername}@example.com`;
        
        const user = {
          id: 'user-' + Date.now(),
          username,
          email,
          role: 'user'
        };
        
        // Store for future use
        localStorage.setItem(`mock_user_${username}`, JSON.stringify(user));
        console.log('✅ Login successful with generated user:', user);
        return { user, token: 'mock-token-' + Date.now() };
      }

      // Real API call based on whether it's email or username
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
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  // Simple registration that stores the user in localStorage
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('📝 REGISTRATION:', { username, email, password: '****' });
      
      if (apiConfig.useMockData) {
        // Create a simple user
        const user = {
          id: 'user-' + Date.now(),
          username,
          email,
          role: 'user'
        };
        
        // Store in localStorage for future logins
        localStorage.setItem(`mock_user_${username}`, JSON.stringify(user));
        console.log('✅ Registration successful:', user);
        dumpLocalStorage();
        
        return {
          user,
          token: 'mock-token-' + Date.now()
        };
      }

      // Real API call
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
        username,
        email,
        password
      });
      return response.data.data as AuthResponse;
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Registration failed');
      }
    }
  }

  // Get current user data
  async getCurrentUser(): Promise<User> {
    try {
      if (apiConfig.useMockData) {
        // Try to get user from token
        const token = localStorage.getItem('accessToken');
        if (token && token.includes('mock-token-')) {
          // This is a mock token, try to find the user
          const allUsers = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('mock_user_')) {
              try {
                const userData = localStorage.getItem(key);
                if (userData) {
                  allUsers.push(JSON.parse(userData));
                }
              } catch (e) {
                console.error('Error parsing user data:', e);
              }
            }
          }
          
          // Return the first user or the default
          if (allUsers.length > 0) {
            console.log('Found stored user:', allUsers[0]);
            return allUsers[0];
          }
        }
        
        // Fall back to default mock user
        return this.mockUser;
      }

      // Real API call
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      return response.data.data as User;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error('Failed to fetch user profile');
    }
  }
  
  // Helper to toggle mock data mode
  toggleMockData(useMock: boolean): void {
    apiConfig.setUseMockData(useMock);
    console.log('Mock data mode:', useMock ? 'ON' : 'OFF');
  }
  
  // Clear all mock data from localStorage
  clearMockStorage(): void {
    console.log('🧹 Clearing mock storage...');
    
    // Find and remove all mock keys
    const mockKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mock_')) {
        mockKeys.push(key);
        localStorage.removeItem(key);
      }
    }
    
    console.log(`✅ Cleared ${mockKeys.length} mock items:`, mockKeys);
    dumpLocalStorage();
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;