import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '../../config';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcryptjs';

/**
 * JWT refresh token payload interface with strict typing
 */
export interface JwtRefreshPayload {
  sub: string; // User ID
  email: string;
  tokenType: 'refresh';
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

/**
 * JWT Refresh strategy for token refresh
 * Implements strict validation with fail-fast approach
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Enforce token expiration
      secretOrKey: configService.jwtRefreshSecret,
      passReqToCallback: true, // Pass request to validate method
    });
  }

  /**
   * Validate JWT refresh token payload and return user
   * @param req Express request
   * @param payload JWT payload
   * @returns User object if valid
   * @throws UnauthorizedException if token is invalid or user not found
   */
  async validate(req: Request, payload: JwtRefreshPayload) {
    // Verify this is a refresh token, not an access token
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Extract token from request
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Find user by ID from token
    try {
      const user = await this.usersService.findById(payload.sub);
      
      // Verify stored refresh token matches
      if (!user.refreshToken) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }
      
      // Verify refresh token matches stored hash
      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      
      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
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
