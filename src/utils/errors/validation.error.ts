import { BaseError } from './base.error';

/**
 * Validation error class
 * Represents validation failures with detailed field-specific error information
 */
export class ValidationError extends BaseError {
  public readonly field: string;
  public readonly value: unknown;

  /**
   * Error name
   */
  override readonly name = 'ValidationError';

  /**
   * Create a new validation error instance
   * Initializes validation error with field-specific information
   * @param message - Error message
   * @param field - Field that failed validation
   * @param value - Value that failed validation
   * @param context - Optional error context data
   */
  constructor(message: string, field: string, value?: unknown, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, context);

    this.field = field;
    this.value = value;
  }

  /**
   * Convert validation error to JSON representation
   * @returns Validation error object suitable for API responses
   */
  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
    };
  }
}
