import { logger } from '../config/logger.js';

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404, 'RESOURCE_NOT_FOUND');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    const message = 'Duplicate entry found';
    error = new AppError(message, 400, 'DUPLICATE_ENTRY');
  }

  if (err.code === '23503') { // Foreign key violation
    const message = 'Referenced resource not found';
    error = new AppError(message, 400, 'FOREIGN_KEY_VIOLATION');
  }

  if (err.code === '23502') { // Not null violation
    const message = 'Required field missing';
    error = new AppError(message, 400, 'REQUIRED_FIELD_MISSING');
  }

  // OpenAI API errors
  if (err.response && err.response.status) {
    if (err.response.status === 429) {
      const message = 'AI service rate limit exceeded. Please try again later.';
      error = new AppError(message, 429, 'AI_RATE_LIMIT');
    } else if (err.response.status === 401) {
      const message = 'AI service authentication failed';
      error = new AppError(message, 500, 'AI_AUTH_ERROR');
    } else if (err.response.status >= 500) {
      const message = 'AI service temporarily unavailable';
      error = new AppError(message, 503, 'AI_SERVICE_ERROR');
    }
  }

  // Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    let message = 'Payment processing error';
    let statusCode = 400;
    let code = 'PAYMENT_ERROR';

    switch (err.type) {
      case 'StripeCardError':
        message = err.message || 'Your card was declined';
        code = 'CARD_DECLINED';
        break;
      case 'StripeRateLimitError':
        message = 'Too many requests made to the payment processor';
        statusCode = 429;
        code = 'PAYMENT_RATE_LIMIT';
        break;
      case 'StripeInvalidRequestError':
        message = 'Invalid payment request';
        code = 'INVALID_PAYMENT_REQUEST';
        break;
      case 'StripeAPIError':
        message = 'Payment service temporarily unavailable';
        statusCode = 503;
        code = 'PAYMENT_SERVICE_ERROR';
        break;
      case 'StripeConnectionError':
        message = 'Network error with payment processor';
        statusCode = 503;
        code = 'PAYMENT_NETWORK_ERROR';
        break;
      case 'StripeAuthenticationError':
        message = 'Payment authentication failed';
        statusCode = 500;
        code = 'PAYMENT_AUTH_ERROR';
        break;
    }

    error = new AppError(message, statusCode, code);
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_ERROR';

  // Don't leak error details in production
  const response = {
    success: false,
    error: message,
    code: code
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = error;
  }

  // Add request ID for tracking
  if (req.id) {
    response.requestId = req.id;
  }

  res.status(statusCode).json(response);
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

// Validation error helper
export const validationError = (message, field = null) => {
  const error = new AppError(message, 400, 'VALIDATION_ERROR');
  if (field) {
    error.field = field;
  }
  return error;
};

// Authorization error helper
export const authorizationError = (message = 'Not authorized') => {
  return new AppError(message, 403, 'AUTHORIZATION_ERROR');
};

// Rate limit error helper
export const rateLimitError = (message = 'Too many requests') => {
  return new AppError(message, 429, 'RATE_LIMIT_ERROR');
};

// Service unavailable error helper
export const serviceUnavailableError = (message = 'Service temporarily unavailable') => {
  return new AppError(message, 503, 'SERVICE_UNAVAILABLE');
};
