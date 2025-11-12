const API_BASE_URL = 'http://localhost:5000/api';

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  tokenData: {
    userId: string;
    name: string;
    email: string;
    iat: number;
    exp: number;
  };
}

export interface LoginCredentials {
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
  // Store decoded token data in cookie
  setTokenData(tokenData: any): void {
    document.cookie = `token_data=${JSON.stringify(tokenData)}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
  }

  // Get decoded token data from cookie
  getTokenData(): any {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token_data') {
        try {
          return JSON.parse(decodeURIComponent(value));
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Remove token data cookie
  removeTokenData(): void {
    document.cookie = 'token_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokenData = this.getTokenData();
    if (!tokenData) return false;
    
    // Check if token is expired
    return tokenData.exp > Date.now() / 1000;
  }

  // Get user data from token data
  getUserFromToken(): { id: string; name: string; email: string } | null {
    const tokenData = this.getTokenData();
    if (!tokenData) return null;
    
    return {
      id: tokenData.userId,
      name: tokenData.name,
      email: tokenData.email
    };
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

      // Decode and store token data
      const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
      this.setTokenData(tokenPayload);
      
      return {
        user: data.user,
        tokenData: tokenPayload
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

      // Decode and update token data
      const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));
      this.setTokenData(tokenPayload);
      
      return {
        user: data.user,
        tokenData: tokenPayload
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
      // Remove token data cookie
      this.removeTokenData();
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token data cookie even if server call fails
      this.removeTokenData();
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