import { describe, it, expect, beforeEach } from '@jest/globals';
import { LoginRequest, RegisterRequest, User, AuthResponse } from '../../../types/auth.types';
import { ApiResponse } from '../../../types/api.types';
import { AuthService } from '../../../services/api/auth.service';
import api from '../../../services/api/api';

jest.mock('../../../services/api/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn()
  }
}));

// Mock storage
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

describe('AuthService', () => {
  let authService: AuthService;
  
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockReset();
    mockStorage.setItem.mockReset();
    mockStorage.removeItem.mockReset();
    mockStorage.clear.mockReset();
    authService = new AuthService(mockStorage as Storage);
  });

  describe('login', () => {
    const loginData: LoginRequest = {
      username: 'testuser',
      password: 'password123'
    };

    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: 'mock-token',
            user: mockUser
          }
        }
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.login(loginData);
      expect(result).toEqual(mockResponse.data.data);
      expect(api.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(mockStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-token');
      expect(mockStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should handle login failure', async () => {
      const errorResponse = {
        response: {
          data: {
            success: false,
            message: 'Invalid credentials'
          }
        }
      };

      (api.post as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    const registerData: RegisterRequest = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123'
    };

    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            token: 'mock-token',
            user: mockUser
          }
        }
      };

      (api.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await authService.register(registerData);
      expect(result).toEqual(mockResponse.data.data);
      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(mockStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-token');
      expect(mockStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should handle registration failure', async () => {
      const errorResponse = {
        response: {
          data: {
            success: false,
            message: 'Username already exists'
          }
        }
      };

      (api.post as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(authService.register(registerData)).rejects.toThrow('Username already exists');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when user exists in storage', () => {
      mockStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
      const result = authService.getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user exists in storage', () => {
      mockStorage.getItem.mockReturnValueOnce(null);
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear token and user from storage', () => {
      authService.logout();
      expect(mockStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      mockStorage.getItem.mockReturnValueOnce('mock-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      mockStorage.getItem.mockReturnValueOnce(null);
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
}); 