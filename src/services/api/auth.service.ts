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

  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    try {
      console.log('AuthService: Login attempt with:', emailOrUsername);
      
      // Check if input is email or username
      const isEmail = emailOrUsername.includes('@');
      console.log('AuthService: Detected input as:', isEmail ? 'email' : 'username');
      
      if (apiConfig.useMockData) {
        console.log('AuthService: Using mock authentication data');
        
        // For demo purposes, attempt to find a registered user
        // First check if there's a direct match with a username
        const usernameKey = `mock_username_${emailOrUsername}`;
        const userDataKey = `mock_user_${emailOrUsername}`;
        
        // Alternative - check if it's an email
        const emailKey = isEmail ? `mock_email_${emailOrUsername}` : null;
        
        console.log('AuthService: Checking localStorage keys:', {
          usernameKey, 
          userDataKey, 
          emailKey, 
          usernameExists: localStorage.getItem(usernameKey),
          userDataExists: localStorage.getItem(userDataKey),
          emailExists: emailKey ? localStorage.getItem(emailKey) : null
        });
        
        // First try to get stored user data by username
        let mockUser = null;
        
        // First, try the exact username match
        const storedUserData = localStorage.getItem(userDataKey);
        if (storedUserData) {
          try {
            mockUser = JSON.parse(storedUserData);
            console.log('AuthService: Found stored user data for username:', emailOrUsername);
          } catch (e) {
            console.error('Error parsing stored user data:', e);
          }
        }
        
        // If no stored user data and it's an email, try username lookup
        if (!mockUser && isEmail) {
          const username = emailOrUsername.split('@')[0];
          const altUserDataKey = `mock_user_${username}`;
          const altStoredUserData = localStorage.getItem(altUserDataKey);
          
          if (altStoredUserData) {
            try {
              mockUser = JSON.parse(altStoredUserData);
              console.log('AuthService: Found stored user data by extracting username from email:', username);
            } catch (e) {
              console.error('Error parsing alternative stored user data:', e);
            }
          }
        }
        
        // If still no user, generate a mock one
        if (!mockUser) {
          // Create a custom user based on the provided credentials
          mockUser = {
            id: `user-${Date.now()}`,
            username: isEmail ? emailOrUsername.split('@')[0] : emailOrUsername,
            email: isEmail ? emailOrUsername : `${emailOrUsername}@example.com`,
            role: 'user'
          };
          console.log('AuthService: Created new mock user as no stored data found:', mockUser);
          
          // Store this user for future logins
          localStorage.setItem(`mock_username_${mockUser.username}`, 'registered');
          localStorage.setItem(`mock_email_${mockUser.email}`, 'registered');
          localStorage.setItem(`mock_user_${mockUser.username}`, JSON.stringify(mockUser));
        }
        
        console.log('AuthService: Successfully authenticated as user:', mockUser);
        
        return {
          user: mockUser,
          token: `mock-jwt-token-${Date.now()}`
        };
      }

      // For real API, try to determine if it's an email or username
      if (isEmail) {
        console.log('AuthService: Using email authentication with real API');
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
          email: emailOrUsername,
          password
        });
        return response.data.data as AuthResponse;
      } else {
        console.log('AuthService: Using username authentication with real API');
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
          username: emailOrUsername,
          password
        });
        return response.data.data as AuthResponse;
      }
    } catch (error) {
      console.error('AuthService: Login error:', error);
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
      
      // Store registration in localStorage for later login
      localStorage.setItem(`mock_email_${email}`, 'registered');
      localStorage.setItem(`mock_username_${username}`, 'registered');
      
      // Also store the full user data for later retrieval
      const userKey = `mock_user_${username}`;
      localStorage.setItem(userKey, JSON.stringify(mockUser));
      
      // Log success
      console.log('AuthService: Successfully registered mock user:', mockUser);
      console.log('AuthService: Stored mock user data for future logins');
      
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
      if (key && (
        key.startsWith('mock_email_') || 
        key.startsWith('mock_username_') ||
        key.startsWith('mock_user_')
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all the keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('AuthService: Removed key from storage:', key);
    });
    
    console.log('AuthService: Cleared mock storage, found and removed', keysToRemove.length, 'keys');
    
    // Also dump all localStorage keys after clearing
    const remainingKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        remainingKeys.push(key);
      }
    }
    console.log('AuthService: Remaining localStorage keys:', remainingKeys);
  }
}

// Export a singleton instance
export default new AuthService();