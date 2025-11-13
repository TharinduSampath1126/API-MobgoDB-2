import express from 'express';
import User from '../models/UserModels.js';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id, // Use custom id field
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load users. Please check your connection and try again.',
      error: error.message
    });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id); // Convert to number
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid user ID (number)'
      });
    }
    
    const user = await User.findOne({ id: userId }); // Find by custom id field
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found. Please check the ID and try again.`
      });
    }
    
    res.json({
      success: true,
      id: user.id, // Use custom id field
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load user details. Please try again later.',
      error: error.message
    });
  }
});

// POST create new user
router.post('/add', async (req, res) => {
  try {
    const { id, firstName, lastName, age, email, phone, birthDate } = req.body;
    
    console.log('Create user request received:');
    console.log('Request body:', req.body);
    console.log('Auto-generated ID from frontend:', id);
    
    // Check if ID already exists
    if (id) {
      const existingUser = await User.findOne({ id: id });
      if (existingUser) {
        console.log('ID conflict detected:', id, 'already exists for user:', existingUser.firstName, existingUser.lastName);
        return res.status(400).json({
          success: false,
          message: `ID ${id} is already in use. Please try with a different ID.`,
          error: 'Duplicate ID',
          field: 'id',
          value: id
        });
      }
    }
    
    // Validate required fields
    const missingFields = [];
    if (!id) missingFields.push('ID');
    if (!firstName) missingFields.push('First Name');
    if (!lastName) missingFields.push('Last Name');
    if (!age) missingFields.push('Age');
    if (!email) missingFields.push('Email');
    if (!phone) missingFields.push('Phone');
    if (!birthDate) missingFields.push('Birth Date');
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', {
        id: !id ? 'missing' : 'present',
        firstName: !firstName ? 'missing' : 'present',
        lastName: !lastName ? 'missing' : 'present',
        age: !age ? 'missing' : 'present',
        email: !email ? 'missing' : 'present',
        phone: !phone ? 'missing' : 'present',
        birthDate: !birthDate ? 'missing' : 'present'
      });
      return res.status(400).json({
        success: false,
        message: `Please fill in all required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields,
        required: ['id', 'firstName', 'lastName', 'age', 'email', 'phone', 'birthDate']
      });
    }
    
    // Create new user
    const newUser = new User({
      id, // Use the auto-generated ID from frontend
      firstName,
      lastName,
      age,
      email,
      phone,
      birthDate: new Date(birthDate)
    });
    
    console.log('Attempting to save user to database with ID:', id);
    const savedUser = await newUser.save();
    console.log('✅ User saved successfully to database:', savedUser.firstName, savedUser.lastName, 'with ID:', savedUser.id);
    
    res.status(201).json({
      success: true,
      message: `User created successfully with ID ${savedUser.id}`,
      id: savedUser.id, // Confirm the saved ID
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      age: savedUser.age,
      email: savedUser.email,
      phone: savedUser.phone,
      birthDate: savedUser.birthDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      // Duplicate error (could be email or id)
      const field = Object.keys(error.keyPattern)[0];
      const duplicateValue = Object.values(error.keyValue)[0];
      console.log('Duplicate field error:', field, 'Value:', duplicateValue);
      
      let message;
      if (field === 'id') {
        message = `ID ${duplicateValue} is already in use. Please choose a different ID.`;
      } else if (field === 'email') {
        message = `Email ${duplicateValue} is already registered. Please use a different email address.`;
      } else {
        message = `${field} already exists. Please use a different value.`;
      }
      
      res.status(400).json({
        success: false,
        message: message,
        error: `Duplicate ${field}`,
        field: field,
        value: duplicateValue
      });
    } else if (error.name === 'ValidationError') {
      // Validation error
      const errors = Object.values(error.errors).map(err => err.message);
      const detailedErrors = Object.keys(error.errors).reduce((acc, field) => {
        acc[field] = error.errors[field].message;
        return acc;
      }, {});
      
      console.log('Validation errors:', errors);
      res.status(400).json({
        success: false,
        message: 'Please check your input and fix the validation errors',
        errors: errors,
        detailedErrors: detailedErrors
      });
    } else {
      console.log('General error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to create user. Please try again later.',
        error: error.message
      });
    }
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const paramId = parseInt(req.params.id); // Convert URL param to number
    const { id, firstName, lastName, age, email, phone, birthDate } = req.body;
    
    console.log('Update request - URL ID:', paramId, 'Body ID:', id);
    console.log('Update data:', { firstName, lastName, age, email, phone, birthDate });
    
    if (isNaN(paramId)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid user ID for updating'
      });
    }
    
    // Validate required fields for update
    const missingFields = [];
    if (!firstName) missingFields.push('First Name');
    if (!lastName) missingFields.push('Last Name');
    if (!age) missingFields.push('Age');
    if (!email) missingFields.push('Email');
    if (!phone) missingFields.push('Phone');
    if (!birthDate) missingFields.push('Birth Date');
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please fill in all required fields: ${missingFields.join(', ')}`,
        missingFields: missingFields
      });
    }
    
    const updatedUser = await User.findOneAndUpdate(
      { id: paramId }, // Find by URL parameter ID
      {
        id: id || paramId, // Update the custom id field if provided, otherwise keep existing
        firstName,
        lastName,
        age,
        email,
        phone,
        birthDate: new Date(birthDate)
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      console.log('User not found with ID:', paramId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('User updated successfully:', updatedUser.firstName, updatedUser.lastName);
    res.json({
      success: true,
      message: 'User updated successfully',
      id: updatedUser.id, // Use custom id field
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      age: updatedUser.age,
      email: updatedUser.email,
      phone: updatedUser.phone,
      birthDate: updatedUser.birthDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const duplicateValue = Object.values(error.keyValue)[0];
      
      let message;
      if (field === 'id') {
        message = `ID ${duplicateValue} is already in use by another user. Please choose a different ID.`;
      } else if (field === 'email') {
        message = `Email ${duplicateValue} is already registered by another user. Please use a different email address.`;
      } else {
        message = `${field} already exists. Please use a different value.`;
      }
      
      res.status(400).json({
        success: false,
        message: message,
        error: `Duplicate ${field}`,
        field: field,
        value: duplicateValue
      });
    } else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      const detailedErrors = Object.keys(error.errors).reduce((acc, field) => {
        acc[field] = error.errors[field].message;
        return acc;
      }, {});
      
      res.status(400).json({
        success: false,
        message: 'Please check your input and fix the validation errors',
        errors: errors,
        detailedErrors: detailedErrors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Unable to update user. Please try again later.',
        error: error.message
      });
    }
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id); // Convert to number
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid user ID for deletion'
      });
    }
    
    const deletedUser = await User.findOneAndDelete({ id: userId }); // Find by custom id field
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found. The user may have been already deleted.`
      });
    }
    
    res.json({
      success: true,
      message: `User ${deletedUser.firstName} ${deletedUser.lastName} has been deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to delete user. Please try again later.',
      error: error.message
    });
  }
});

export default router;