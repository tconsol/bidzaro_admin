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
    const storedAdmin = localStorage.getItem('adminUser');
    const accessToken = localStorage.getItem('accessToken');
    
    if (storedAdmin && accessToken) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: AdminLoginDto) => {
    try {
      const response = await adminApi.login(credentials);
      const authData = response;
      const accessToken = authData.accessToken;
      const refreshToken = authData.refreshToken;
      const user = authData.user;
      
      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('adminUser', JSON.stringify(user));
      setAdmin(user);
    } catch (error: any) {
      console.error('Login error:', error?.response?.data || error?.message);
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
