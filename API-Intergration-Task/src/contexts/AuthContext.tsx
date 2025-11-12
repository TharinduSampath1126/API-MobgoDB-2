import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthResponse, LoginCredentials, RegisterCredentials } from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  tokenData: any;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  getTokenData: () => any;
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
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app start
    const initializeAuth = () => {
      try {
        const currentTokenData = authService.getTokenData();
        if (currentTokenData && authService.isAuthenticated()) {
          const userData = authService.getUserFromToken();
          if (userData) {
            setUser(userData);
            setTokenData(currentTokenData);
          }
        }
      } catch (error) {
        // Silently handle auth errors
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
      setTokenData(response.tokenData);
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

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setTokenData(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setTokenData(null);
    }
  };

  const getTokenData = () => {
    return authService.getTokenData();
  };

  const value: AuthContextType = {
    user,
    tokenData,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!tokenData,
    getTokenData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};