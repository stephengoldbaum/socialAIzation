import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { IUser } from '../models/user.model';

/**
 * Token payload interface
 */
interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
  tokenType: 'access' | 'refresh'; // Added to distinguish token types
}

/**
 * Generate a JWT token for a user
 * @param user User document
 * @returns JWT token
 */
export function generateToken(user: IUser): string {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenType: 'access',
  };

  // Use a more direct type assertion to fix the expiresIn type issue
  // This is necessary because config.auth.tokenExpiry is a string from environment variables
  // but the JWT library expects a specific string format or number
  const options: SignOptions = {
    expiresIn: config.auth.tokenExpiry as any
  };

  return jwt.sign(payload, config.auth.jwtSecret, options);
}

/**
 * Generate a refresh token for a user
 * @param user User document
 * @returns Refresh token
 */
export function generateRefreshToken(user: IUser): string {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    tokenType: 'refresh',
  };

  const options: SignOptions = {
    expiresIn: '7d' // 7 days
  };

  const secret = config.auth.refreshTokenSecret || config.auth.jwtSecret;
  return jwt.sign(payload, secret, options);
}

/**
 * Verify a JWT token
 * @param token JWT token
 * @param isRefreshToken Whether this is a refresh token
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string, isRefreshToken = false): TokenPayload | null {
  try {
    const secret = isRefreshToken && config.auth.refreshTokenSecret 
      ? config.auth.refreshTokenSecret 
      : config.auth.jwtSecret;
    
    const decoded = jwt.verify(token, secret) as TokenPayload;
    
    // Validate token type - always enforce token type check
    const expectedType = isRefreshToken ? 'refresh' : 'access';
    
    // If tokenType is missing or doesn't match expected type, reject the token
    if (!decoded.tokenType || decoded.tokenType !== expectedType) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from authorization header
 * @param authHeader Authorization header
 * @returns Token or null if not found
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}