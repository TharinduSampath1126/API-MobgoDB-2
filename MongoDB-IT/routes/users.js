import express from 'express';
import User from '../models/User.js';

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
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
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
        message: 'Invalid user ID'
      });
    }
    
    const user = await User.findOne({ id: userId }); // Find by custom id field
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
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
    console.log('Extracted data:', { id, firstName, lastName, age, email, phone, birthDate });
    
    // Validate required fields
    if (!id || !firstName || !lastName || !age || !email || !phone || !birthDate) {
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
        message: 'Missing required fields',
        required: ['id', 'firstName', 'lastName', 'age', 'email', 'phone', 'birthDate']
      });
    }
    
    // Create new user
    const newUser = new User({
      id, // Include the custom id field
      firstName,
      lastName,
      age,
      email,
      phone,
      birthDate: new Date(birthDate)
    });
    
    console.log('Attempting to save user to database...');
    const savedUser = await newUser.save();
    console.log('User saved successfully:', savedUser.firstName, savedUser.lastName);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      id: savedUser.id, // Use custom id field
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
      console.log('Duplicate field error:', field);
      res.status(400).json({
        success: false,
        message: `${field === 'id' ? 'ID' : 'Email'} already exists`,
        error: `Duplicate ${field}`
      });
    } else if (error.name === 'ValidationError') {
      // Validation error
      const errors = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', errors);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    } else {
      console.log('General error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error creating user',
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
        message: 'Invalid user ID in URL'
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
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        success: false,
        message: `${field === 'id' ? 'ID' : 'Email'} already exists`,
        error: `Duplicate ${field}`
      });
    } else if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
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
        message: 'Invalid user ID'
      });
    }
    
    const deletedUser = await User.findOneAndDelete({ id: userId }); // Find by custom id field
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

export default router;