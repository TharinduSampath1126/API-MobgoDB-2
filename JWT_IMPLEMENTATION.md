# JWT Process Implementation - Backend

## Overview
Complete JWT (JSON Web Token) authentication system implemented in the backend with token generation, verification, and refresh functionality.

## Backend JWT Structure

### 1. JWT Middleware (`middleware/auth.js`)

#### Token Generation
```javascript
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};
```

#### Token Verification
```javascript
export const verifyToken = async (req, res, next) => {
  // Extract token from Authorization header
  // Verify token validity
  // Attach user to request object
  // Handle expired/invalid tokens
};
```

#### Token Refresh
```javascript
export const refreshToken = async (req, res) => {
  // Verify existing token
  // Generate new token
  // Return new token with user data
};
```

### 2. Authentication Routes (`routes/auth.js`)

#### Registration Process
```
POST /api/auth/register
├── Validate input data
├── Check if user exists
├── Hash password
├── Save user to database
└── Return success message (no token)
```

#### Login Process
```
POST /api/auth/login
├── Validate credentials
├── Find user by email
├── Compare password hash
├── Generate JWT token
└── Return token + user data
```

#### Token Refresh
```
POST /api/auth/refresh
├── Verify current token
├── Generate new token
└── Return new token + user data
```

### 3. Protected Routes (`routes/protected.js`)

#### Profile Access
```
GET /api/protected/profile
├── Verify JWT token (middleware)
├── Extract user from token
└── Return user profile data
```

#### Profile Update
```
PUT /api/protected/profile
├── Verify JWT token (middleware)
├── Validate input data
├── Update user information
└── Return updated profile
```

## JWT Token Structure

### Token Payload
```json
{
  "userId": "user_mongodb_id",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Token Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

## Frontend Integration

### Updated AuthService Methods

#### Token Management
```typescript
setToken(token: string): void
getToken(): string | null
removeToken(): void
isAuthenticated(): boolean
getUserFromToken(): User | null
```

#### API Methods
```typescript
login(credentials): Promise<AuthResponse>
register(credentials): Promise<Response>
refreshToken(): Promise<AuthResponse>
getProfile(): Promise<User>
makeAuthenticatedRequest(url, options): Promise<any>
```

## Security Features

### Token Security
- **Expiration**: 24-hour token lifetime
- **Secret Key**: Environment variable for signing
- **Payload Encryption**: Base64 encoded payload
- **Header Validation**: Bearer token format

### Password Security
- **Hashing**: bcryptjs with salt rounds
- **No Plain Text**: Passwords never stored as plain text
- **Comparison**: Secure password comparison

### Request Security
- **Authorization Header**: `Bearer <token>`
- **Token Verification**: Middleware validates every protected request
- **User Context**: Authenticated user attached to request

## API Endpoints Summary

### Public Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Token Management
- `POST /api/auth/refresh` - Refresh JWT token

### Protected Endpoints
- `GET /api/protected/profile` - Get user profile
- `PUT /api/protected/profile` - Update user profile

## Error Handling

### Token Errors
- **Missing Token**: 401 - Access denied
- **Invalid Token**: 401 - Invalid token
- **Expired Token**: 401 - Token expired
- **User Not Found**: 401 - Invalid token

### Authentication Errors
- **Invalid Credentials**: 401 - Invalid email or password
- **Missing Fields**: 400 - Required fields missing
- **Server Error**: 500 - Internal server error

## Usage Examples

### Making Authenticated Requests
```javascript
// Frontend usage
const profile = await authService.getProfile();
const response = await authService.makeAuthenticatedRequest('/protected/profile');
```

### Backend Middleware Usage
```javascript
// Protect any route
router.get('/secure-data', verifyToken, (req, res) => {
  // req.user contains authenticated user
  res.json({ user: req.user });
});
```

## Environment Variables
```
JWT_SECRET=your_super_secret_jwt_key_here
MONGO_URI=mongodb://localhost:27017/your_database
PORT=5000
```

## Benefits

### Backend Benefits
- **Centralized JWT Logic**: All JWT operations in middleware
- **Reusable Components**: Token functions used across routes
- **Secure Implementation**: Industry-standard JWT practices
- **Error Handling**: Comprehensive error responses

### Frontend Benefits
- **Automatic Token Management**: Handle token storage/retrieval
- **Request Helpers**: Simplified authenticated API calls
- **Token Refresh**: Automatic token renewal capability
- **Type Safety**: TypeScript interfaces for all responses

### Security Benefits
- **Stateless Authentication**: No server-side session storage
- **Token Expiration**: Automatic security through time limits
- **Protected Routes**: Middleware-based route protection
- **Secure Headers**: Proper Authorization header handling