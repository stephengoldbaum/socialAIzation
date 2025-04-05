import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 * Uses the 'jwt' strategy for access token validation
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
