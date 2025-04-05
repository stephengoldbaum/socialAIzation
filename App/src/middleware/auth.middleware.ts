import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export class AuthMiddleware {
  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers['authorization'] as string | undefined;

      // If no token is provided, return 401
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = decoded;
        next();
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  authorize = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}