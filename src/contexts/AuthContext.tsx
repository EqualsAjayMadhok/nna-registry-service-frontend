import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/api/auth.service';
import { LoginRequest, RegisterRequest, User } from '../types/auth.types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = () => {
      const user = AuthService.getCurrentUser();
      if (user) {
        setUser(user);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginRequest): Promise<void> => {
    setLoading(true);
    try {
      const response = await AuthService.login(data);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    setLoading(true);
    try {
      const response = await AuthService.register(data);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    AuthService.logout();
    setUser(null);
  };

  const isAuthenticated = (): boolean => {
    return !!user;
  };

  const isAdmin = (): boolean => {
    return user ? user.roles.includes('admin') : false;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};