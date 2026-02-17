import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Admin, AdminLoginDto } from '../types';
import { adminApi } from '../services/api';

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (credentials: AdminLoginDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedAdmin = localStorage.getItem('adminUser');
    const accessToken = localStorage.getItem('accessToken');
    
    if (storedAdmin && accessToken) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: AdminLoginDto) => {
    try {
      console.log('Attempting login with:', { identifier: credentials.identifier });
      const response = await adminApi.login(credentials);
      console.log('Login response received:', response);
      
      // Handle both direct response and nested data
      const authData = response;
      const accessToken = authData.accessToken;
      const refreshToken = authData.refreshToken;
      const user = authData.user;
      
      console.log('Parsed auth data:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken, hasUser: !!user });
      
      if (!accessToken) {
        console.error('No access token in response:', response);
        throw new Error('No access token received from server');
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      console.log('Tokens stored, setting admin state');
      setAdmin(user);
      console.log('Login successful, admin state updated');
    } catch (error: any) {
      console.error('Login error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminUser');
    sessionStorage.clear();
    setAdmin(null);
    window.location.href = '/login';
  };

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated: !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
