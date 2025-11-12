const API_BASE_URL = 'http://localhost:5000/api';

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LoginCredentials {
  name: string;
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

class AuthService {
  // Check if user is authenticated by calling backend
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/protected/profile`, {
        method: 'GET',
        credentials: 'include'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get user data from backend
  async getUserFromToken(): Promise<{ id: string; name: string; email: string } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/protected/profile`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      
      // 401 is expected when not authenticated - return null silently
      return null;
    } catch (error) {
      // Silently handle network errors during auth check
      return null;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return {
        user: data.user
      };
    } catch (error: any) {
      throw new Error(error.message || 'Network error');
    }
  }

  async register(credentials: RegisterCredentials): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error: any) {
      throw new Error(error.message || 'Network error');
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      return {
        user: data.user
      };
    } catch (error: any) {
      throw new Error(error.message || 'Network error');
    }
  }

  async getProfile(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/protected/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile');
      }

      return data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Network error');
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Helper method to make authenticated requests
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }
}

export const authService = new AuthService();