import express from 'express';
import { verifyToken, requireRole } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Admin only routes
router.get('/admin/dashboard', verifyToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to admin dashboard',
    user: req.user
  });
});

// Student only routes
router.get('/student/dashboard', verifyToken, requireRole(['student']), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to student dashboard',
    user: req.user
  });
});

// Both admin and student can access
router.get('/profile', verifyToken, requireRole(['admin', 'student']), (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;