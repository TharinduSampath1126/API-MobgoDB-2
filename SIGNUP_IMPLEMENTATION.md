# MongoDB Signup Process Implementation

## Overview
Complete user registration system with MongoDB database integration, password hashing, and JWT authentication.

## Architecture

### Backend Structure
```
MongoDB-IT/
├── models/
│   ├── AuthUser.js          # Authentication user model
│   └── User.js              # Original user model (unchanged)
├── routes/
│   ├── auth.js              # Authentication routes
│   └── users.js             # Original user routes
└── server.js                # Main server file
```

### Frontend Structure
```
API-Integration-Task/src/
├── services/
│   └── authService.ts       # Updated authentication service
├── pages/auth/
│   └── signup.tsx           # Signup form component
└── contexts/
    └── AuthContext.tsx      # Authentication context
```

## Database Collections

### AuthUser Collection
- **Collection Name**: `authusers`
- **Purpose**: Store authentication credentials
- **Fields**:
  - `name`: String (required, max 50 chars)
  - `email`: String (required, unique, validated)
  - `password`: String (required, min 6 chars, hashed)
  - `createdAt`: Date (auto-generated)
  - `updatedAt`: Date (auto-generated)

### User Collection
- **Collection Name**: `users` 
- **Purpose**: Store detailed user information
- **Status**: Unchanged, separate from authentication

## API Endpoints

### POST /api/auth/register
**Purpose**: Register new user

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Error Responses**:
- 400: Missing fields, passwords don't match, user exists
- 500: Server error

### POST /api/auth/login
**Purpose**: Authenticate user

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Security Features

### Password Hashing
- Uses `bcryptjs` with salt rounds: 10
- Passwords never stored in plain text
- Automatic hashing on user save

### JWT Authentication
- Token expiration: 24 hours
- Payload includes: userId, email, name
- Secret key from environment variables

### Validation
- **Frontend**: Zod schema validation
- **Backend**: Mongoose schema validation
- **Email**: Regex pattern validation
- **Password**: Minimum 6 characters

## Implementation Flow

### 1. User Registration Process
```
Frontend Form → Validation → API Call → Backend Validation → 
Password Hash → Save to MongoDB → Success Response
```

### 2. User Login Process  
```
Frontend Form → API Call → Find User → Compare Password → 
Generate JWT → Return Token + User Data
```

### 3. Authentication Check
```
Get Token from localStorage → Decode JWT → Verify Expiration → 
Extract User Data → Set Authentication State
```

## Key Files Modified/Created

### New Files
- `MongoDB-IT/models/AuthUser.js` - Authentication user model
- `MongoDB-IT/routes/auth.js` - Authentication routes
- `test-signup.html` - Simple test interface

### Modified Files
- `MongoDB-IT/server.js` - Added auth routes
- `API-Integration-Task/src/services/authService.ts` - Updated for MongoDB API
- `API-Integration-Task/src/pages/auth/signup.tsx` - Enhanced error handling

## Dependencies Added
```json
{
  "bcryptjs": "^3.0.3",
  "jsonwebtoken": "^9.0.2"
}
```

## Environment Variables Required
```
MONGO_URI=mongodb://localhost:27017/your_database
JWT_SECRET=your_secret_key_here
PORT=5000
```

## Testing

### Manual Testing
1. Start MongoDB server
2. Run backend: `cd MongoDB-IT && npm run dev`
3. Run frontend: `cd API-Integration-Task && npm run dev`
4. Test signup form or use `test-signup.html`

### Test Cases
- ✅ Valid registration
- ✅ Duplicate email prevention
- ✅ Password mismatch validation
- ✅ Missing field validation
- ✅ JWT token generation
- ✅ Password hashing verification

## Benefits

### Separation of Concerns
- Authentication data separate from user profiles
- Clean API structure
- Modular design

### Security
- Encrypted password storage
- JWT-based authentication
- Input validation at multiple levels

### Scalability
- Easy to extend with additional auth features
- Separate collections for different data types
- RESTful API design