import api, { apiConfig } from './api';
import { User } from '../../contexts/AuthContext';
import { ApiResponse } from '../../types/api.types';

interface AuthResponse {
  user: User;
  token: string;
}

// ULTRA SIMPLE AUTH SERVICE
// This is a minimal implementation that works reliably in mock mode
class AuthService {
  // Default mock user
  private defaultUser: User = {
    id: 'default-user',
    username: 'user',
    email: 'user@example.com',
    role: 'user'
  };

  // MINIMAL LOGIN - ALWAYS WORKS
  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    console.log('LOGIN ATTEMPT:', emailOrUsername);
    
    try {
      // MOCK MODE - Accept any credentials
      if (apiConfig.useMockData) {
        console.log('MOCK MODE: Accepting all logins');
        
        // Create a user based on the input
        const isEmail = emailOrUsername.includes('@');
        const username = isEmail ? emailOrUsername.split('@')[0] : emailOrUsername;
        const email = isEmail ? emailOrUsername : `${emailOrUsername}@example.com`;
        
        // Store the user in localStorage
        const user = { 
          id: `user-${Date.now()}`, 
          username, 
          email, 
          role: 'user' 
        };
        
        // Save user for session persistence
        localStorage.setItem('current_user', JSON.stringify(user));
        
        return {
          user,
          token: 'mock-token'
        };
      } 
      
      // REAL API MODE
      else {
        console.log('REAL API MODE: Attempting login');
        const isEmail = emailOrUsername.includes('@');
        
        // Prepare login data based on input type
        const loginData = isEmail 
          ? { email: emailOrUsername, password }
          : { username: emailOrUsername, password };
        
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', loginData);
        return response.data.data as AuthResponse;
      }
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  // SIMPLIFIED REGISTRATION
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    console.log('REGISTRATION ATTEMPT:', username, email);
    
    try {
      // MOCK MODE - Always succeed
      if (apiConfig.useMockData) {
        console.log('MOCK MODE: Registration always succeeds');
        
        // Basic validation
        if (username.length < 3) {
          throw new Error('Username must be at least 3 characters');
        }
        
        // Create new user
        const user = {
          id: `user-${Date.now()}`,
          username,
          email,
          role: 'user'
        };
        
        // Save user info
        localStorage.setItem('current_user', JSON.stringify(user));
        
        return {
          user,
          token: 'mock-token'
        };
      } 
      
      // REAL API MODE
      else {
        console.log('REAL API MODE: Registration request');
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

  // GET CURRENT USER
  async getCurrentUser(): Promise<User> {
    try {
      // Check for token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // MOCK MODE
      if (apiConfig.useMockData) {
        console.log('MOCK MODE: Getting current user');
        
        // Get stored user
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          try {
            return JSON.parse(storedUser);
          } catch (e) {
            console.error('Error parsing stored user');
          }
        }
        
        // Return default user if nothing else works
        return this.defaultUser;
      } 
      
      // REAL API MODE
      else {
        console.log('REAL API MODE: Getting user profile');
        const response = await api.get<ApiResponse<User>>('/auth/profile');
        return response.data.data as User;
      }
    } catch (error) {
      console.error('GET USER ERROR:', error);
      throw new Error('Failed to get user profile');
    }
  }
  
  // CLEAR STORAGE
  clearStorage(): void {
    console.log('Clearing all storage');
    localStorage.clear();
  }
  
  // TOGGLE MOCK MODE
  toggleMockData(useMock: boolean): void {
    apiConfig.setUseMockData(useMock);
    console.log('Mock mode:', useMock ? 'ON' : 'OFF');
  }
  
  // CREATE TEST USER
  createTestUser(): void {
    const testUser = {
      id: 'test-user',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };
    
    localStorage.setItem('current_user', JSON.stringify(testUser));
    console.log('Created test user');
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;