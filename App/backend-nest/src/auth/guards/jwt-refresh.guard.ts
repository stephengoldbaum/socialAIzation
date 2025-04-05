import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Refresh Guard
 * Uses the 'jwt-refresh' strategy for refresh token validation
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
