import { Injectable, LoggerService } from '@nestjs/common';

/**
 * Log level enumeration
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Log context interface
 */
export interface ILogContext {
  requestId?: string;
  userId?: string;
  tenantId?: string;
  service?: string;
  operation?: string;
  [key: string]: unknown;
}

/**
 * Log entry interface
 */
export interface ILogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string | undefined;
  userId?: string | undefined;
  tenantId?: string | undefined;
  service?: string | undefined;
  operation?: string | undefined;
  trace?: string | undefined;
  [key: string]: unknown;
}

/**
 * Structured logging service
 * Provides comprehensive logging with request tracking and context
 */
@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger = console;

  /**
   * Log error message with context
   * @param message - Error message
   * @param context - Log context including request ID
   * @param trace - Error stack trace
   */
  error(message: string, context?: ILogContext, trace?: string): void {
    this.logInternal(LogLevel.ERROR, message, context, trace);
  }

  /**
   * Log warning message with context
   * @param message - Warning message
   * @param context - Log context including request ID
   */
  warn(message: string, context?: ILogContext): void {
    this.logInternal(LogLevel.WARN, message, context);
  }

  /**
   * Log info message with context
   * @param message - Info message
   * @param context - Log context including request ID
   */
  log(message: string, context?: ILogContext): void {
    this.logInternal(LogLevel.INFO, message, context);
  }

  /**
   * Log info message with context (alias for log)
   * @param message - Info message
   * @param context - Additional context information
   */
  info(message: string, context?: ILogContext): void {
    this.logInternal(LogLevel.INFO, message, context);
  }

  /**
   * Log debug message with context
   * @param message - Debug message
   * @param context - Log context including request ID
   */
  debug(message: string, context?: ILogContext): void {
    this.logInternal(LogLevel.DEBUG, message, context);
  }

  /**
   * Log verbose message with context
   * @param message - Verbose message
   * @param context - Log context including request ID
   */
  verbose(message: string, context?: ILogContext): void {
    this.logInternal(LogLevel.DEBUG, message, context);
  }

  /**
   * Internal logging method
   * @param level - Log level
   * @param message - Log message
   * @param context - Log context
   * @param trace - Error stack trace
   */
  private logInternal(
    level: LogLevel,
    message: string,
    context?: ILogContext,
    trace?: string,
  ): void {
    const logEntry = this.createLogEntry(level, message, context, trace);
    const logString = JSON.stringify(logEntry);
    this.outputLog(level, logString);
  }

  /**
   * Create log entry object
   * @param level - Log level
   * @param message - Log message
   * @param context - Log context
   * @param trace - Error stack trace
   * @returns Log entry object
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: ILogContext,
    trace?: string,
  ): ILogEntry {
    const timestamp = new Date().toISOString();
    const logEntry: ILogEntry = {
      timestamp,
      level,
      message,
      requestId: context?.requestId,
      userId: context?.userId,
      tenantId: context?.tenantId,
      service: context?.service,
      operation: context?.operation,
      ...context,
    };

    if (trace) {
      logEntry.trace = trace;
    }

    return logEntry;
  }

  /**
   * Output log based on level
   * @param level - Log level
   * @param logString - Formatted log string
   */
  private outputLog(level: LogLevel, logString: string): void {
    switch (level) {
      case LogLevel.ERROR:
        this.logger.error(logString);
        break;
      case LogLevel.WARN:
        this.logger.warn(logString);
        break;
      case LogLevel.INFO:
        this.logger.info(logString);
        break;
      case LogLevel.DEBUG:
        this.logger.debug(logString);
        break;
      default:
        this.logger.log(logString);
    }
  }
}
