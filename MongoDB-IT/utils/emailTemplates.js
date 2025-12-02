// Email templates for different purposes

// Registration password email template
export const registrationEmailTemplate = (name, password) => {
  return {
    subject: 'Your Login Password',
    html: `
      <h2>Welcome ${name}!</h2>
      <p>Your account has been created successfully.</p>
      <p><strong>Your login password is:</strong> <h3>${password}</h3></p>
      <p>Please use this password to login to your account.</p>
    `
  };
};

// Password reset email template
export const passwordResetTemplate = (name, resetLink) => {
  return {
    subject: 'Password Reset Request',
    html: `
      <h2>Hello ${name}!</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };
};

// Welcome email template
export const welcomeEmailTemplate = (name) => {
  return {
    subject: 'Welcome to Our Platform',
    html: `
      <h2>Welcome ${name}!</h2>
      <p>Thank you for joining our platform.</p>
      <p>We're excited to have you on board!</p>
    `
  };
};