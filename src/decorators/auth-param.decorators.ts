import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Get current user from request
 * @param _data - Decorator data (unused)
 * @param ctx - Execution context
 * @returns Current user object
 */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

/**
 * Get user ID from request
 * @param _data - Decorator data (unused)
 * @param ctx - Execution context
 * @returns User ID
 */
export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user?.id;
});

/**
 * Get user email from request
 * @param _data - Decorator data (unused)
 * @param ctx - Execution context
 * @returns User email
 */
export const CurrentUserEmail = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user?.email;
});

/**
 * Get user role from request
 * @param _data - Decorator data (unused)
 * @param ctx - Execution context
 * @returns User role
 */
export const CurrentUserRole = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user?.role;
});

/**
 * Get tenant ID from request
 * @param _data - Decorator data (unused)
 * @param ctx - Execution context
 * @returns Tenant ID
 */
export const CurrentTenantId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.tenantId || request.user?.tenantId;
});

/**
 * Get request ID from request
 * @param _data - Decorator data (unused)
 * @param ctx - Execution context
 * @returns Request ID
 */
export const RequestId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers['x-request-id'] || 'unknown';
});
