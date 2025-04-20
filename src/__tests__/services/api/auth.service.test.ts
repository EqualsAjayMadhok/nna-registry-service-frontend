import authService from '../../../services/api/auth.service';
import createApiClient from '../../../services/api/axios';
import { LoginRequest, RegisterRequest, User, AuthResponse } from '../../../types/auth.types';
import { ApiResponse } from '../../../types/api.types';

// Mock the API client
jest.mock('../../../services/api/axios', () => {
  const mockAxios = {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  return jest.fn(() => mockAxios);
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
} as unknown as Storage;
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthService', () => {
  const mockApi = createApiClient('');
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    const mockLoginRequest: LoginRequest = {
      username: 'testuser',
      password: 'password123'
    };

    const mockUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      createdAt: '2024-03-20T00:00:00Z',
      updatedAt: '2024-03-20T00:00:00Z'
    };

    const mockResponse: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        token: 'mock_token',
        user: mockUser
      }
    };

    it('should successfully login and store token', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const response = await authService.login(mockLoginRequest);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', mockLoginRequest);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock_token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(response).toEqual(mockResponse.data);
    });

    it('should handle login failure', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };
      (mockApi.post as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(authService.login(mockLoginRequest)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    const mockRegisterRequest: RegisterRequest = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const mockUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      createdAt: '2024-03-20T00:00:00Z',
      updatedAt: '2024-03-20T00:00:00Z'
    };

    const mockResponse: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        token: 'mock_token',
        user: mockUser
      }
    };

    it('should successfully register and store token', async () => {
      (mockApi.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const response = await authService.register(mockRegisterRequest);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', mockRegisterRequest);
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock_token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(response).toEqual(mockResponse.data);
    });

    it('should handle registration failure', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Email already exists'
          }
        }
      };
      (mockApi.post as jest.Mock).mockRejectedValueOnce(errorResponse);

      await expect(authService.register(mockRegisterRequest)).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('should clear localStorage on logout', () => {
      authService.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getCurrentUser', () => {
    const mockUser: User = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      createdAt: '2024-03-20T00:00:00Z',
      updatedAt: '2024-03-20T00:00:00Z'
    };

    it('should return user from localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(JSON.stringify(mockUser));
      const user = authService.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null if no user in localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);
      const user = authService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValueOnce('mock_token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(null);
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
}); 