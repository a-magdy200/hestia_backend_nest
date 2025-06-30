import { HttpException } from '@nestjs/common';

import { BaseError } from '../utils/errors/base.error';

/**
 * Parse HTTP exception into standardized error information
 * @param exception - HTTP exception
 * @param sanitizeErrors - Whether to sanitize error details
 * @returns Parsed error information
 */
export const parseHttpException = (
  exception: HttpException,
  sanitizeErrors: boolean,
): {
  status: number;
  message: string;
  code: string;
  details: unknown;
} => {
  const status = exception.getStatus();
  const response = exception.getResponse();
  const message = extractMessage(response);
  const details = buildErrorDetails(exception);

  return {
    status,
    message,
    code: getErrorCode(status),
    details: sanitizeErrors ? sanitizeDetails(details) : details,
  };
};

/**
 * Parse base error into standardized error information
 * @param exception - Base error
 * @param sanitizeErrors - Whether to sanitize error details
 * @returns Parsed error information
 */
export const parseBaseError = (
  exception: BaseError,
  sanitizeErrors: boolean,
): {
  status: number;
  message: string;
  code: string;
  details: unknown;
} => {
  const details = buildErrorDetails(exception);

  return {
    status: exception.statusCode,
    message: exception.message,
    code: exception.code,
    details: sanitizeErrors ? sanitizeDetails(details) : details,
  };
};

/**
 * Parse standard error into standardized error information
 * @param exception - Standard error
 * @param sanitizeErrors - Whether to sanitize error details
 * @returns Parsed error information
 */
export const parseStandardError = (
  exception: Error,
  sanitizeErrors: boolean,
): {
  status: number;
  message: string;
  code: string;
  details: unknown;
} => {
  const details = buildErrorDetails(exception);

  return {
    status: 500,
    message: exception.message || 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    details: sanitizeErrors ? sanitizeDetails(details) : details,
  };
};

/**
 * Parse unknown exception into standardized error information
 * @param exception - Unknown exception
 * @param sanitizeErrors - Whether to sanitize error details
 * @returns Parsed error information
 */
export const parseUnknownException = (
  exception: unknown,
  sanitizeErrors: boolean,
): {
  status: number;
  message: string;
  code: string;
  details: unknown;
} => {
  return {
    status: 500,
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: sanitizeErrors ? { type: 'unknown' } : exception,
  };
};

/**
 * Extract message from HTTP exception response
 * @param response - HTTP exception response
 * @returns Error message
 */
const extractMessage = (response: unknown): string => {
  if (typeof response === 'string') {
    return response;
  }

  if (typeof response === 'object' && response !== null) {
    const responseObj = response as Record<string, unknown>;
    if (typeof responseObj['message'] === 'string') {
      return responseObj['message'];
    }
  }

  return 'An error occurred';
};

/**
 * Build error details object
 * @param error - Error object
 * @returns Error details
 */
const buildErrorDetails = (error: Error): unknown => {
  const details: Record<string, unknown> = {
    name: error.name,
    message: error.message,
  };

  return details;
};

/**
 * Sanitize error details for production
 * @param details - Error details to sanitize
 * @returns Sanitized details
 */
const sanitizeDetails = (details: unknown): unknown => {
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

/**
 * Get error code based on HTTP status
 * @param status - HTTP status code
 * @returns Error code string
 */
const getErrorCode = (status: number): string => {
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
