import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt.utils';
import { UserModel } from '../models/user.model';
import { injectable, inject } from 'inversify';
import TYPES from '../di/types';
import { ILoggerService } from '../services/logger.service';
import { Container } from 'inversify';

// Note: Express Request type extensions are now in types/express-extensions.d.ts

/**
 * Authentication middleware factory
 * @param container Inversify container
 * @returns Authentication middleware functions
 */
export function createAuthMiddleware(container: Container) {
  /**
   * Get logger service from container when needed
   */
  const getLogger = (): ILoggerService => {
    return container.get<ILoggerService>(TYPES.LoggerService);
  };
  
  return {
    /**
     * Authentication middleware
     * Verifies JWT token and attaches user to request
     */
    authenticate: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const logger = getLogger();
        
        // Get token from authorization header
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
          return res.status(401).json({ message: 'Authentication required' });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
          return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Find user
        const user = await UserModel.findById(decoded.userId);
        if (!user || !user.isActive) {
          return res.status(401).json({ message: 'User not found or inactive' });
        }

        // Attach user to request
        req.user = user;
        next();
      } catch (error) {
        const logger = getLogger();
        logger.error('Authentication error', { error });
        return res.status(500).json({ message: 'Internal server error' });
      }
    },

    /**
     * Role-based authorization middleware
     * Requires authenticate middleware to be called first
     * @param roles Allowed roles
     */
    authorize: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
      try {
        const logger = getLogger();
        
        if (!req.user) {
          return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
          logger.warn('Unauthorized access attempt', { 
            userId: req.user._id, 
            requiredRoles: roles,
            userRole: req.user.role
          });
          return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
      } catch (error) {
        const logger = getLogger();
        logger.error('Authorization error', { error });
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
}
