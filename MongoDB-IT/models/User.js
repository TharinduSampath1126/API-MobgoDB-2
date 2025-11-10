import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, 'ID is required'],
    unique: true,
    min: [1, 'ID must be greater than 0']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    maxlength: [50, 'First name must be less than 50 characters'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    maxlength: [50, 'Last name must be less than 50 characters'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be greater than 0'],
    max: [120, 'Age must be less than 120']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^(\+\d{1,3}[- ]?)?\(?\d{1,4}\)?[- ]?\d{1,4}[- ]?\d{1,9}$/, 'Please enter a valid phone number']
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Birth date cannot be in the future'
    }
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);

export default User;