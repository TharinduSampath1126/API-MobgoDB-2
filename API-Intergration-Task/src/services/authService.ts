import { userStorage } from '../utils/userStorage';

// JWT Authentication Service
export interface AuthResponse {
  token: string;
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

// Simulate API calls - replace with actual backend endpoints
class AuthService {
  // Store token in localStorage
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // First try to verify with local user storage
    const storedUser = userStorage.verifyUser(credentials.email, credentials.password);

    if (storedUser) {
      const fakeToken = this.createFakeToken({ name: storedUser.name, email: storedUser.email });
      const authResponse: AuthResponse = {
        token: fakeToken,
        user: {
          id: Date.now().toString(),
          name: storedUser.name,
          email: storedUser.email,
        },
      };

      this.setToken(fakeToken);
      return authResponse;
    }

    // If not found locally, try DummyJSON API for demonstration
    try {
      const response = await fetch('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'kminchelle', // DummyJSON demo user
          password: '0lelplR', // DummyJSON demo password
          expiresInMins: 30,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const authResponse: AuthResponse = {
          token: data.token,
          user: {
            id: data.id?.toString() ?? Date.now().toString(),
            name: credentials.name ?? data.firstName ?? 'User',
            email: credentials.email ?? data.email ?? 'unknown@example.com',
          },
        };

        this.setToken(authResponse.token);
        return authResponse;
      }
    } catch (err) {
      // ignore and fallthrough to error below
      console.warn('DummyJSON login failed (demo):', err);
    }

    throw new Error('Invalid email or password');
  }

  // Register user - store locally for demo usage
  async register(credentials: RegisterCredentials): Promise<{ success: boolean; message: string }> {
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    try {
      userStorage.addUser({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });

      return {
        success: true,
        message: 'Registration successful! Please login with your credentials.',
      };
    } catch (error: any) {
      throw new Error(error?.message || 'Registration failed');
    }
  }

  // Logout user
  logout(): void {
    this.removeToken();
  }

  // Create fake JWT token for demo purposes
  private createFakeToken(user: { name: string; email: string; password?: string }): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload = {
      sub: Date.now().toString(),
      name: user.name,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'fake-signature-for-demo';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}

export const authService = new AuthService();