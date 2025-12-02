import React, { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { sendContactEmail } from '@/utils/emailjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { Send, Mail, User, Phone, MessageSquare } from 'lucide-react';

// Zod validation schema for contact form
const ContactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  mobile: z.string()
    .min(1, 'Mobile number is required')
    .refine((phone) => {
      // Remove all spaces, dashes, and parentheses for validation
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      // Check if it's a valid phone number format
      return /^\+?[1-9]\d{7,14}$/.test(cleanPhone);
    }, 'Please enter a valid mobile number'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

// Type definitions using Zod
type ContactFormData = z.infer<typeof ContactFormSchema>;

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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // Key to force form reset

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = (): boolean => {
    try {
      // Validate using Zod schema
      ContactFormSchema.parse(formData);
      // Clear any existing errors if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format
        const fieldErrors: FormErrors = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof FormErrors;
          if (field) {
            fieldErrors[field] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await sendContactEmail({
        from_name: formData.name,
        from_email: formData.email,
        from_mobile: formData.mobile,
        message: formData.message,
      });
      
      
      toast.success(`Thank you ${formData.name}! Your message has been sent successfully.`, {
        description: 'We will get back to you soon.',
        duration: 5000,
      });
      
      
      setFormData({
        name: '',
        email: '',
        mobile: '',
        message: ''
      });
      
      // Clear any form errors
      setErrors({});
      setSubmitError(null);
      
      
      setFormKey(prev => prev + 1);
      
    } catch (error: any) {
      console.error('Failed to send email:', error);
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.status === 400) {
        if (error.text && error.text.includes('template ID not found')) {
          errorMessage = 'EmailJS template not configured properly. Please contact the administrator.';
        } else if (error.text && error.text.includes('service ID not found')) {
          errorMessage = 'EmailJS service not configured properly. Please contact the administrator.';
        } else {
          errorMessage = 'Invalid EmailJS configuration. Please check your setup.';
        }
      }
      
      // Show error toast
      toast.error('Message Failed to Send', {
        description: errorMessage,
        duration: 8000,
      });
      
      setSubmitError(errorMessage);
      
      // Hide error message after 10 seconds
      setTimeout(() => {
        setSubmitError(null);
      }, 10000);
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

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {submitError}
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
                key={`phone-${formKey}`}
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

        
      </div>
    </div>
  );
};

export default Contact;
