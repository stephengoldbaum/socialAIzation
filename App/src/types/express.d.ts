import { User } from '../models/user.model'; // adjust path as needed

declare global {
  namespace Express {
    interface Request {
      user?: User;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

// No export needed for declaration files
