import { SetMetadata } from '@nestjs/common';

import { UserRole, Permission } from '../interfaces/enums/user.enum';

/**
 * Decorator to mark a route as public (no authentication required)
 * @returns Metadata for public route
 */
export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata('isPublic', true);

/**
 * Decorator to require specific roles for access
 * @param roles - Array of required user roles
 * @returns Metadata for role requirements
 */
export const Roles = (...roles: UserRole[]): ReturnType<typeof SetMetadata> =>
  SetMetadata('roles', roles);

/**
 * Decorator to require specific permissions for access
 * @param permissions - Array of required permissions
 * @returns Metadata for permission requirements
 */
export const Permissions = (...permissions: Permission[]): ReturnType<typeof SetMetadata> =>
  SetMetadata('permissions', permissions);

/**
 * Decorator to require email verification for access
 * @returns Metadata for email verification requirement
 */
export const RequireEmailVerification = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('requireEmailVerification', true);

/**
 * Decorator to allow admin bypass for certain operations
 * @returns Metadata for admin bypass
 */
export const AdminBypass = (): ReturnType<typeof SetMetadata> => SetMetadata('adminBypass', true);

/**
 * Decorator to check resource ownership
 * @returns Metadata for ownership check
 */
export const CheckOwnership = (): ReturnType<typeof SetMetadata> =>
  SetMetadata('checkOwnership', true);

/**
 * Decorator to mark a route as requiring authentication
 * @returns Metadata for authentication requirement
 */
export const Authenticated = (): ReturnType<typeof SetMetadata> => SetMetadata('isPublic', false);

/**
 * Decorator to require admin role
 * @returns Metadata for admin role requirement
 */
export const AdminOnly = (): ReturnType<typeof SetMetadata> =>
  Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/**
 * Decorator to require super admin role
 * @returns Metadata for super admin role requirement
 */
export const SuperAdminOnly = (): ReturnType<typeof SetMetadata> => Roles(UserRole.SUPER_ADMIN);
