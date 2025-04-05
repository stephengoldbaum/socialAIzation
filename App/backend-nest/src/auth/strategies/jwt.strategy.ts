import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '../../config';
import { UsersService } from '../../users/users.service';

/**
 * JWT payload interface with strict typing
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  tokenType: 'access';
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

/**
 * JWT strategy for authentication
 * Implements strict validation with fail-fast approach
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Enforce token expiration
      secretOrKey: configService.jwtSecret,
    });
  }

  /**
   * Validate JWT payload and return user
   * @param payload JWT payload
   * @returns User object if valid
   * @throws UnauthorizedException if token is invalid or user not found
   */
  async validate(payload: JwtPayload) {
    // Verify this is an access token, not a refresh token
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Find user by ID from token
    try {
      const user = await this.usersService.findById(payload.sub);
      
      // Return user data for request context
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('User not found or invalid token');
    }
  }
}
