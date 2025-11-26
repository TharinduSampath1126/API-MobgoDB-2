import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { Send, Mail, User, Phone, MessageSquare } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  mobile: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  mobile?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    mobile: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (formData.mobile.trim().length < 10) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Contact form submitted:', formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        mobile: '',
        message: ''
      });
      
      setSubmitSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Failed to submit contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    clearFieldError(field);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-lg text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Send className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Message sent successfully! We'll get back to you soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                className="w-full"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                className="w-full"
              />
            </div>

            {/* Mobile Number Field */}
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                Mobile Number
              </label>
              <PhoneInput
                value={formData.mobile}
                onChange={(value) => handleInputChange('mobile', value)}
                placeholder="Enter your mobile number"
                error={errors.mobile}
                className="w-full"
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Message
              </label>
              <textarea
                placeholder="Enter your message here..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                  errors.message ? 'border-red-500' : ''
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            You can also reach us directly at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800">
              support@example.com
            </a>{' '}
            or call us at{' '}
            <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-800">
              +1 (234) 567-8900
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
