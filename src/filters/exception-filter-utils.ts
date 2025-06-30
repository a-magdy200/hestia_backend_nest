import { Response } from 'express';

import { IRequest } from '../interfaces/express.interface';

/**
 * Extract client IP from request
 * @param request - Express request object
 * @returns Client IP address
 */
export const extractClientIp = (request: IRequest): string => {
  return getForwardedForIp(request) || getRealIp(request) || getConnectionIp(request) || 'unknown';
};

/**
 * Get IP from X-Forwarded-For header
 * @param request - Express request object
 * @returns IP address or undefined
 */
const getForwardedForIp = (request: IRequest): string | undefined => {
  const forwardedFor = request.headers?.['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor) {
    return forwardedFor.split(',')[0]?.trim();
  }
  return undefined;
};

/**
 * Get IP from X-Real-IP header
 * @param request - Express request object
 * @returns IP address or undefined
 */
const getRealIp = (request: IRequest): string | undefined => {
  const realIp = request.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp) {
    return realIp;
  }
  return undefined;
};

/**
 * Get IP from connection or socket
 * @param request - Express request object
 * @returns IP address or undefined
 */
const getConnectionIp = (request: IRequest): string | undefined => {
  if (request.connection?.remoteAddress) {
    return request.connection.remoteAddress;
  }
  if (request.socket?.remoteAddress) {
    return request.socket.remoteAddress;
  }
  return undefined;
};

/**
 * Get error code based on HTTP status
 * @param status - HTTP status code
 * @returns Error code string
 */
export const getErrorCode = (status: number): string => {
  const errorCodes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    405: 'METHOD_NOT_ALLOWED',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE_ENTITY',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_SERVER_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
    504: 'GATEWAY_TIMEOUT',
  };

  return errorCodes[status] || 'UNKNOWN_ERROR';
};

/**
 * Send error response to client
 * @param response - Express response object
 * @param errorInfo - Error information
 * @param errorInfo.status
 * @param requestId - Request ID
 * @param errorInfo.message
 * @param includeStackTraces - Whether to include stack traces
 * @param errorInfo.code
 * @param errorInfo.details
 * @returns void
 */
export const sendErrorResponse = (
  response: Response,
  errorInfo: { status: number; message: string; code: string; details: unknown },
  requestId: string,
  includeStackTraces: boolean,
): void => {
  const errorResponse = {
    success: false,
    error: {
      code: errorInfo.code,
      message: errorInfo.message,
      ...(includeStackTraces && { details: errorInfo.details }),
    },
    requestId,
    timestamp: new Date().toISOString(),
  };

  response.status(errorInfo.status).json(errorResponse);
};
