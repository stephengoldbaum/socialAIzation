/**
 * Type extensions for Express Request object
 * This adds custom properties to the Express Request type
 */

import { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

// This file needs to be a module
export {};
