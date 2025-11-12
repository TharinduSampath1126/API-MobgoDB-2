import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthResponse, LoginCredentials, RegisterCredentials } from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const initializeAuth = () => {
      try {
        const savedToken = authService.getToken();
        if (savedToken && authService.isAuthenticated()) {
          const userData = authService.getUserFromToken();
          if (userData) {
            setUser(userData);
            setToken(savedToken);
          } else {
            authService.removeToken();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.removeToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      const response: AuthResponse = await authService.login(credentials);
      
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);
      const result = await authService.register(credentials);
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};