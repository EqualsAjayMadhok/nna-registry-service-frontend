import React, { createContext, useState, ReactNode, useEffect } from 'react';
import authService from '../services/api/auth.service';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check for existing session on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          // Verify token and get user data
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(userData.role === 'admin');
          } catch (err) {
            // Token is invalid or expired
            localStorage.removeItem('accessToken');
            setIsAuthenticated(false);
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: userData, token } = await authService.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('accessToken', token);
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log("AuthContext: Starting registration process");
      const { user: userData, token } = await authService.register(username, email, password);
      console.log("AuthContext: Registration successful, received user data", userData);
      
      // Store token in localStorage
      localStorage.setItem('accessToken', token);
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === 'admin');
    } catch (err) {
      console.error("AuthContext: Registration error:", err);
      
      // Improve error handling by preserving more details
      let errorMessage = 'Registration failed';
      
      // Try to get the most useful error information possible
      try {
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null) {
          // Try to extract error message from axios or other error objects
          if ('response' in err && err.response && typeof err.response === 'object') {
            const response = err.response as any;
            if (response.data && response.data.message) {
              errorMessage = response.data.message;
            } else if (response.data && response.data.error) {
              errorMessage = response.data.error;
            } else if (response.statusText) {
              errorMessage = `Server error: ${response.statusText}`;
            }
          } else if ('message' in err && typeof (err as any).message === 'string') {
            errorMessage = (err as any).message;
          } else {
            // Last resort: Try to convert to JSON string
            const errStr = JSON.stringify(err);
            if (errStr && errStr !== '{}' && errStr !== 'null') {
              errorMessage = errStr;
            }
          }
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
      } catch (e) {
        console.error('Error while parsing error object:', e);
      }
      
      setError(errorMessage);
      
      // Return the original error if it's already an Error instance
      if (err instanceof Error) {
        throw err;
      } else {
        // Otherwise create a new Error with the extracted message
        throw new Error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};