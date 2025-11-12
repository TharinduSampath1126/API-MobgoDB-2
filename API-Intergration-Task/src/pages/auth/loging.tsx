import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, User } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Zod schema for login validation
const loginSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters long'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

interface LoginData {
  name: string;
  email: string;
  password: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface LogingProps {
  onLogin?: (data: LoginData) => void;
}

function loging({ onLogin }: LogingProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginData>({
    name: '',
    email: '',
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data with Zod
    const result = loginSchema.safeParse(formData);
    
    if (!result.success) {
      const validationErrors: ValidationErrors = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ValidationErrors;
        validationErrors[fieldName] = issue.message;
      });
      setErrors(validationErrors);
      return;
    }
    
    // Clear any existing errors
    setErrors({});
    setIsLoading(true);
    
    try {
      // Call onLogin callback if provided
      if (onLogin) {
        await onLogin(formData);
      }
      
      // Use JWT authentication
      await login({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      // Show success message
      toast.success('Login successful!');
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-120">
        {/* Login Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-500 text-sm">Please sign in to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="relative">
              <div className={`flex items-center bg-gray-50 rounded-2xl px-4 py-4 border transition-all ${
                errors.name 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100' 
                  : 'border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
              }`}>
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              {errors.name && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name}
                </div>
              )}
            </div>
            
            {/* Email Input */}
            <div className="relative">
              <div className={`flex items-center bg-gray-50 rounded-2xl px-4 py-4 border transition-all ${
                errors.email 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100' 
                  : 'border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
              }`}>
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className={`flex items-center bg-gray-50 rounded-2xl px-4 py-4 border transition-all ${
                errors.password 
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100' 
                  : 'border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
              }`}>
                <Lock className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              {errors.password && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-left">
              <button 
                type="button"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white font-semibold py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Please wait...' : 'Login'}
            </button>

            {/* Register Link */}
            <div className="text-center pt-4">
              <span className="text-gray-600 text-sm">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default loging;
