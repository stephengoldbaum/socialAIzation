import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

/**
 * Roles decorator for role-based access control
 * @param roles Array of roles that can access the endpoint
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
