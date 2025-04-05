import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/schemas/user.schema';

/**
 * Role-based authorization guard
 * Implements strict access control with fail-fast approach
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    // Get user from request
    const { user } = context.switchToHttp().getRequest();
    
    // Ensure user exists and has a role
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User has no role assigned');
    }
    
    // Check if user has required role
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    // If user doesn't have required role, throw exception
    if (!hasRequiredRole) {
      throw new ForbiddenException(`Access denied: Role '${user.role}' is not authorized to access this resource`);
    }
    
    return true;
  }
}
