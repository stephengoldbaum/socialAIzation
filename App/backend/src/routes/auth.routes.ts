import { Router, Request, Response } from 'express';
import { UserModel, IUser } from '../models/user.model';
import { generateToken, generateRefreshToken } from '../utils/jwt.utils';
import { ILoggerService } from '../services/logger.service';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import container from '../di/container';
import TYPES from '../di/types';
import { Container } from 'inversify';

/**
 * Create and return the auth routes
 * @param container Inversify container
 * @returns Express router with auth routes
 */
export function createAuthRoutes(container: Container) {
  // Create router
  const router = Router();

  // Create auth middleware
  const { authenticate } = createAuthMiddleware(container);
  
  // Get logger service function
  const getLogger = (): ILoggerService => {
    return container.get<ILoggerService>(TYPES.LoggerService);
  };

  /**
   * @route POST /api/auth/register
   * @desc Register a new user
   * @access Public
   */
  router.post('/register', async (req: Request, res: Response) => {
    const logger = getLogger();
    
    try {
      const { email, password, name, role } = req.body as any;

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return (res as any).status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const user = new UserModel({
        email,
        password,
        name,
        role: role || 'player', // Default to player if no role provided
      });

      await user.save();

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info('User registered successfully', { userId: user._id });

      // Return user data and tokens
      (res as any).status(201).json({
        user: user.toJSON(),
        token,
        refreshToken,
      });
    } catch (error) {
      const logger = getLogger();
      logger.error('Registration error', { error });
      (res as any).status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * @route POST /api/auth/login
   * @desc Login user and return tokens
   * @access Public
   */
  router.post('/login', async (req: Request, res: Response) => {
    const logger = getLogger();
    
    try {
      const { email, password } = req.body as any;

      // Find user
      const user = await UserModel.findOne({ email });
      if (!user) {
        return (res as any).status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user is active
      if (!user.isActive) {
        return (res as any).status(401).json({ message: 'Account is disabled' });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return (res as any).status(401).json({ message: 'Invalid credentials' });
      }

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.info('User logged in successfully', { userId: user._id });

      // Return user data and tokens
      (res as any).status(200).json({
        user: user.toJSON(),
        token,
        refreshToken,
      });
    } catch (error) {
      const logger = getLogger();
      logger.error('Login error', { error });
      (res as any).status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * @route POST /api/auth/refresh
   * @desc Refresh access token
   * @access Public
   */
  router.post('/refresh', async (req: Request, res: Response) => {
    const logger = getLogger();
    
    try {
      const { refreshToken } = req.body as any;

      if (!refreshToken) {
        return (res as any).status(400).json({ message: 'Refresh token is required' });
      }

      // Verify refresh token
      const decoded = require('../utils/jwt.utils').verifyToken(refreshToken);
      if (!decoded) {
        return (res as any).status(401).json({ message: 'Invalid or expired refresh token' });
      }

      // Find user
      const user = await UserModel.findById(decoded.userId);
      if (!user || !user.isActive) {
        return (res as any).status(401).json({ message: 'User not found or inactive' });
      }

      // Generate new tokens
      const token = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      logger.info('Token refreshed successfully', { userId: user._id });

      // Return new tokens
      (res as any).status(200).json({
        token,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      const logger = getLogger();
      logger.error('Token refresh error', { error });
      (res as any).status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * @route GET /api/auth/me
   * @desc Get current user
   * @access Private
   */
  router.get('/me', authenticate, async (req: Request, res: Response) => {
    const logger = getLogger();
    
    try {
      // User is attached to request by authenticate middleware
      (res as any).status(200).json({ user: (req as any).user.toJSON() });
    } catch (error) {
      logger.error('Get current user error', { error });
      (res as any).status(500).json({ message: 'Internal server error' });
    }
  });

  /**
   * @route POST /api/auth/logout
   * @desc Logout user (client-side only for JWT)
   * @access Public
   */
  router.post('/logout', (req: Request, res: Response) => {
    const logger = getLogger();
    
    // JWT is stateless, so logout is handled client-side
    // This endpoint is for logging purposes
    logger.info('User logged out', { userId: (req.body as any)?.userId });
    (res as any).status(200).json({ message: 'Logged out successfully' });
  });

  return router;
}

// Export the router
export const authRoutes = () => createAuthRoutes(container);
