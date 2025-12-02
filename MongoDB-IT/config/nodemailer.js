import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { registrationEmailTemplate } from '../utils/emailTemplates.js';

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASS,
  },
});

// Generate 6-digit password
export const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send registration password email
export const sendPasswordEmail = async (email, name, password) => {
  try {
    const template = registrationEmailTemplate(name, password);
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: template.subject,
      html: template.html
    });
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};

// Complete user registration with database and email
export const registerNewUser = async (name, email, role = 'student') => {
  try {
    // Import AuthUser model
    const { default: AuthUser } = await import('../Models/AuthUserModels.js');
    
    // Check if user already exists
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        message: 'User already exists with this email'
      };
    }
    
    // Generate password
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
    const emailResult = await sendPasswordEmail(email, name, generatedPassword);
    if (!emailResult.success) {
      throw new Error('Failed to send email');
    }
    
    return {
      success: true,
      message: 'User registered successfully. Password sent to your email.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.name === 'ValidationError' 
        ? 'Validation failed' 
        : 'Server error during registration',
      error
    };
  }
};

// Send password via email (kept for other uses)
export const registerUserWithEmail = async (name, email, password) => {
  try {
    const emailResult = await sendPasswordEmail(email, name, password);
    if (!emailResult.success) {
      throw new Error('Failed to send email');
    }
    return { success: true };
  } catch (error) {
    console.error('Registration email error:', error);
    return { success: false, error };
  }
};