import express from 'express';
import AuthUser from '../Models/AuthUserModels.js';
import { generateToken, refreshToken } from '../Middleware/authMiddleware.js';
import { transporter } from '../config/nodemailer.js';

const router = express.Router();

// Generate 6-digit password
const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, role = 'student' } = req.body;
    
    console.log('Registration request:', { name, email });
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Generate 6-digit password
    const generatedPassword = generatePassword();
    
    // Create new user
    const newUser = new AuthUser({
      name,
      email,
      password: generatedPassword,
      role
    });
    
    await newUser.save();
    
    // Send password via email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Login Password',
      html: `
        <h2>Welcome ${name}!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Your login password is:</strong> <h3>${generatedPassword}</h3></p>
        <p>Please use this password to login to your account.</p>
      `
    });
    
    console.log('User registered successfully:', newUser.name);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Password sent to your email.'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Refresh token
router.post('/refresh', refreshToken);

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login request:', { email });
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user by email
    const user = await AuthUser.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set token as httpOnly cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    console.log('User logged in successfully:', user.name);
    
    res.json({
      success: true,
      message: 'Login successful',
      token: token, // Send token for frontend decoding
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;