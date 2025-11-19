import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, AuthResponse, LoginCredentials, RegisterCredentials } from '../services/authService';
import { cookieManager } from '../utils/cookieManager';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
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
  const navigate = useNavigate();

  // Auto-logout function
  const performAutoLogout = useCallback(async () => {
    console.log('Token expired - performing auto logout');
    try {
      await authService.logout();
    } catch (error) {
      console.error('Auto logout error:', error);
    } finally {
      setUser(null);
      setTokenData(null);
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Check token expiration
  const checkTokenExpiration = useCallback(() => {
    const currentTokenData = authService.getTokenData();
    if (currentTokenData && user) {
      const currentTime = Date.now() / 1000;
      const tokenExp = currentTokenData.exp;
      
      // If token is expired, auto logout
      if (tokenExp && currentTime >= tokenExp) {
        performAutoLogout();
        return true; // Token expired
      }
    }
    return false; // Token valid or no token
  }, [user, performAutoLogout]);

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
        } else if (currentTokenData) {
          // Token exists but expired, clear it
          authService.removeTokenData();
        }
      } catch (error) {
        // Silently handle auth errors
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Token expiration and cookie monitoring
  useEffect(() => {
    if (!user || !tokenData) {
      // Stop cookie monitoring when not authenticated
      cookieManager.stopCookieMonitoring();
      return;
    }

    console.log('🔐 Starting enhanced authentication monitoring...');

    // Enhanced token expiration checking - check every 30 seconds for better responsiveness
    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiration();
    }, 30 * 1000);

    // Real-time cookie monitoring - check auth status every 10 seconds
    const cookieCheckInterval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:5000/api/protected/profile', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 401) {
          console.log('🚨 Real-time check: auth_token missing or expired - auto logout');
          performAutoLogout();
        }
      } catch (error) {
        console.log('Auth check network error:', error);
      }
    }, 10 * 1000); // Check every 10 seconds

    // Immediate check on window focus
    const handleWindowFocus = async () => {
      console.log('🔍 Window focused - checking authentication status');
      
      // First check token expiration
      const isExpired = checkTokenExpiration();
      
      // If token not expired, check cookie status
      if (!isExpired) {
        try {
          const response = await fetch('http://localhost:5000/api/protected/profile', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.status === 401) {
            console.log('🚨 Focus check: auth_token missing or expired - auto logout');
            performAutoLogout();
          }
        } catch (error) {
          console.log('Focus auth check error:', error);
        }
      }
    };

    // Start legacy cookie monitoring as backup
    cookieManager.startCookieMonitoring(() => {
      console.log('🚨 Cookie monitor detected deletion - logging out');
      performAutoLogout();
    });

    window.addEventListener('focus', handleWindowFocus);

    // Cleanup
    return () => {
      clearInterval(tokenCheckInterval);
      clearInterval(cookieCheckInterval);
      window.removeEventListener('focus', handleWindowFocus);
      cookieManager.stopCookieMonitoring();
    };
  }, [user, tokenData, checkTokenExpiration, performAutoLogout]);

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
      // Stop cookie monitoring before logout
      cookieManager.stopCookieMonitoring();
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