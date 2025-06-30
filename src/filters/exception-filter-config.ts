/**
 * Configuration interface for the global exception filter
 */
export interface ExceptionFilterConfig {
  /** Whether to include stack traces in error responses */
  includeStackTraces: boolean;
  /** Maximum size of error details in characters */
  maxErrorDetailsSize: number;
  /** Whether to sanitize error details for production */
  sanitizeErrors: boolean;
  /** Maximum number of errors to log per reset interval */
  logErrorThreshold: number;
}
