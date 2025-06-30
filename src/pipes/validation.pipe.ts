import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * Validation pipe with comprehensive error handling
 * Validates DTOs and provides structured error responses
 */
@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
  /**
   * Transform and validate input
   * @param value - Input value to validate
   * @param metadata - Argument metadata
   * @param metadata.metatype
   * @returns Validated and transformed value
   */
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const validationErrors = this.formatValidationErrors(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    return object;
  }

  /**
   * Check if the value should be validated
   * @param metatype - Type to check
   * @returns True if should be validated
   */
  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types: Array<new (...args: unknown[]) => unknown> = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !types.includes(metatype);
  }

  /**
   * Format validation errors for structured response
   * @param errors - Validation errors from class-validator
   * @returns Formatted error array
   */
  private formatValidationErrors(errors: ValidationError[]): Array<{
    field: string;
    value: unknown;
    constraints: string[];
  }> {
    const formattedErrors: Array<{
      field: string;
      value: unknown;
      constraints: string[];
    }> = [];

    for (const error of errors) {
      this.processValidationError(error, formattedErrors);
    }

    return formattedErrors;
  }

  /**
   * Process individual validation error
   * @param error - Validation error to process
   * @param formattedErrors - Array to collect formatted errors
   */
  private processValidationError(
    error: ValidationError,
    formattedErrors: Array<{
      field: string;
      value: unknown;
      constraints: string[];
    }>,
  ): void {
    if (error.constraints) {
      formattedErrors.push({
        field: error.property,
        value: error.value,
        constraints: Object.values(error.constraints),
      });
    }

    // Handle nested validation errors
    if (error.children && error.children.length > 0) {
      this.processNestedErrors(error, formattedErrors);
    }
  }

  /**
   * Process nested validation errors
   * @param error - Parent validation error
   * @param formattedErrors - Array to collect formatted errors
   */
  private processNestedErrors(
    error: ValidationError,
    formattedErrors: Array<{
      field: string;
      value: unknown;
      constraints: string[];
    }>,
  ): void {
    if (!error.children) {
      return;
    }

    const nestedErrors = this.formatValidationErrors(error.children);
    for (const nestedError of nestedErrors) {
      formattedErrors.push({
        field: `${error.property}.${nestedError.field}`,
        value: nestedError.value,
        constraints: nestedError.constraints,
      });
    }
  }
}
