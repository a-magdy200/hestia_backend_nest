/**
 * Base error class for application-specific errors
 * Provides standardized error structure with status codes and context
 */
export abstract class BaseError extends Error {
  /**
   * Error name
   */
  override readonly name: string;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  /**
   * Create a new base error instance
   * Initializes error with message, status code, and optional context
   * @param message - Error message
   * @param code
   * @param statusCode - HTTP status code
   * @param context - Optional error context data
   */
  constructor(message: string, code: string, statusCode = 500, context?: Record<string, unknown>) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    this.context = context || {};

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON representation
   * @returns Error object suitable for API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}
