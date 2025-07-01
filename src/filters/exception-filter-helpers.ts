import { IRequest } from '../interfaces/express.interface';

/**
 * Add user-related fields to log context
 * @param logContext - Log context object
 * @param request - Express request object
 */
export const addUserFields = (logContext: Record<string, unknown>, request: IRequest): void => {
  if (request.user) {
    logContext['userId'] = request.user.id;
  }
  if (request.tenantId || request.user?.tenantId) {
    logContext['tenantId'] = request.tenantId || request.user?.tenantId;
  }
};

/**
 * Add network-related fields to log context
 * @param logContext - Log context object
 * @param request - Express request object
 */
export const addNetworkFields = (logContext: Record<string, unknown>, request: IRequest): void => {
  if (request.headers?.['x-forwarded-for']) {
    logContext['forwardedFor'] = request.headers['x-forwarded-for'];
  }
  if (request.headers?.['x-real-ip']) {
    logContext['realIp'] = request.headers['x-real-ip'];
  }
};

/**
 * Truncate error details to prevent oversized logs
 * @param details - Error details to truncate
 * @param maxSize - Maximum allowed size
 * @returns Truncated details
 */
export const truncateDetails = (details: unknown, maxSize = 1024): unknown => {
  if (typeof details === 'string') {
    return details.length > maxSize ? `${details.substring(0, maxSize)}...` : details;
  }
  if (typeof details === 'object' && details !== null) {
    const detailsStr = JSON.stringify(details);
    if (detailsStr.length > maxSize) {
      return {
        truncated: true,
        size: detailsStr.length,
        maxSize,
        preview: `${detailsStr.substring(0, maxSize)}...`,
      };
    }
  }
  return details;
};

/**
 * Sanitize error details for production
 * @param details - Error details to sanitize
 * @returns Sanitized details
 */
export const sanitizeDetails = (details: unknown): unknown => {
  if (typeof details === 'object' && details !== null) {
    const sanitized: Record<string, unknown> = {};
    const detailsObj = details as Record<string, unknown>;
    // Only include safe fields
    const safeFields = ['name', 'message', 'code', 'statusCode'];
    for (const field of safeFields) {
      if (detailsObj[field] !== undefined) {
        sanitized[field] = detailsObj[field];
      }
    }
    return sanitized;
  }
  return { type: 'sanitized' };
};
