import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { logger } from '../config/logger.js';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      subscriptionTier: user.subscription_tier 
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.warn('Invalid JWT token:', error.message);
    return null;
  }
};

// Authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }

    // Get user from database to ensure they still exist and get latest data
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
          req.userId = user.id;
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next(); // Continue even if auth fails
  }
};

// Admin authentication middleware
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user is admin (you can implement admin role logic here)
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());
    
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({ 
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin auth error:', error);
    res.status(500).json({ 
      error: 'Authorization failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Subscription tier middleware
export const requireSubscription = (requiredTier) => {
  const tierLevels = {
    'free': 0,
    'pro': 1,
    'premium': 2
  };

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const userTierLevel = tierLevels[req.user.subscription_tier] || 0;
      const requiredTierLevel = tierLevels[requiredTier] || 0;

      if (userTierLevel < requiredTierLevel) {
        return res.status(403).json({ 
          error: `${requiredTier} subscription required`,
          code: 'SUBSCRIPTION_REQUIRED',
          required_tier: requiredTier,
          current_tier: req.user.subscription_tier
        });
      }

      next();
    } catch (error) {
      logger.error('Subscription check error:', error);
      res.status(500).json({ 
        error: 'Subscription check failed',
        code: 'SUBSCRIPTION_ERROR'
      });
    }
  };
};

// Rate limiting for generations
export const checkGenerationLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!req.user.canGenerate()) {
      return res.status(429).json({ 
        error: 'Generation limit exceeded',
        code: 'GENERATION_LIMIT_EXCEEDED',
        generations_used: req.user.generations_used,
        generations_limit: req.user.generations_limit,
        subscription_tier: req.user.subscription_tier
      });
    }

    next();
  } catch (error) {
    logger.error('Generation limit check error:', error);
    res.status(500).json({ 
      error: 'Generation limit check failed',
      code: 'LIMIT_CHECK_ERROR'
    });
  }
};

// Refresh token middleware
export const refreshToken = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Generate new token with updated user data
    const newToken = generateToken(req.user);
    
    // Add new token to response headers
    res.setHeader('X-New-Token', newToken);
    
    next();
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(); // Continue even if refresh fails
  }
};
