import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { logger } from '../config/logger.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new AppError('User already exists with this email', 400, 'USER_EXISTS');
  }

  // Create new user
  const user = await User.create({ email, password });
  
  // Generate JWT token
  const token = generateToken(user);

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      token
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Check password
  const isPasswordValid = await user.verifyPassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Generate JWT token
  const token = generateToken(user);

  logger.info(`User logged in: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token
    }
  });
}));

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toJSON()
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', authenticateToken, [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email } = req.body;
  const updates = {};

  // Check if email is being updated and if it's already taken
  if (email && email !== req.user.email) {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use', 400, 'EMAIL_TAKEN');
    }
    updates.email = email;
  }

  // Update user
  await req.user.update(updates);

  logger.info(`User profile updated: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: req.user.toJSON()
    }
  });
}));

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { currentPassword, newPassword } = req.body;

  // Verify current password
  const isCurrentPasswordValid = await req.user.verifyPassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
  }

  // Hash and update new password
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  await req.user.update({ password_hash: hashedPassword });

  logger.info(`Password changed for user: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', authenticateToken, asyncHandler(async (req, res) => {
  // Generate new token with updated user data
  const token = generateToken(req.user);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      user: req.user.toJSON(),
      token
    }
  });
}));

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
router.delete('/account', authenticateToken, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account'),
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { password } = req.body;

  // Verify password
  const isPasswordValid = await req.user.verifyPassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid password', 400, 'INVALID_PASSWORD');
  }

  // Soft delete user account
  await req.user.delete();

  logger.info(`User account deleted: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

// @desc    Request password reset (placeholder for email integration)
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if email exists or not for security
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // TODO: Implement email sending logic
  // For now, just log the request
  logger.info(`Password reset requested for: ${email}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
}));

export default router;
