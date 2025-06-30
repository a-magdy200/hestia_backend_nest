import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { MainConfigService } from '@/config/config.service';
import { IRequest } from '@/interfaces/express.interface';
import { LoggingService } from '@/services/logging.service';
import { BaseError } from '@/utils/errors/base.error';

import { ExceptionFilterConfig } from './exception-filter-config';
import {
  parseHttpException,
  parseBaseError,
  parseStandardError,
  parseUnknownException,
} from './exception-filter-parsers';
import { extractClientIp, sendErrorResponse } from './exception-filter-utils';

/**
 * Global exception filter that handles all unhandled exceptions
 * Provides consistent error responses and logging
 */
@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly config: ExceptionFilterConfig;
  private errorLogCount = 0;
  private readonly errorLogResetInterval = 60000; // 1 minute

  /**
   * Constructor for GlobalExceptionFilter
   * @param loggingService - Service for structured logging
   * @param configService - Configuration service for environment settings
   * @param config - Optional custom configuration overrides
   */
  constructor(
    private readonly loggingService: LoggingService,
    private readonly configService: MainConfigService,
    @Inject('EXCEPTION_FILTER_CONFIG') config?: Partial<ExceptionFilterConfig>,
  ) {
    this.config = this.initializeConfig(config);
    this.setupErrorCountReset();
    this.logInitialization();
  }

  /**
   * Helper to check if environment is development
   * @returns {boolean} True if development environment
   */
  private isDevelopment(): boolean {
    return this.configService.app.environment === 'development';
  }

  /**
   * Helper to check if environment is production
   * @returns {boolean} True if production environment
   */
  private isProduction(): boolean {
    return this.configService.app.environment === 'production';
  }

  /**
   * Initialize configuration with defaults and environment overrides
   * @param config - Optional custom configuration overrides
   * @returns Initialized configuration
   */
  private initializeConfig(config?: Partial<ExceptionFilterConfig>): ExceptionFilterConfig {
    const defaults: ExceptionFilterConfig = {
      includeStackTraces: this.isDevelopment(),
      maxErrorDetailsSize: 1024,
      sanitizeErrors: this.isProduction(),
      logErrorThreshold: 100,
    };
    return Object.assign({}, defaults, config);
  }

  /**
   * Setup periodic reset of error count
   * @returns void
   */
  private setupErrorCountReset(): void {
    setInterval(() => {
      this.errorLogCount = 0;
    }, this.errorLogResetInterval);
  }

  /**
   * Log filter initialization
   * @returns void
   */
  private logInitialization(): void {
    this.loggingService.log('GlobalExceptionFilter initialized', {
      config: this.config,
      environment: this.configService.app.environment,
    });
  }

  /**
   * Main exception handling method
   * @param exception - The exception that was thrown
   * @param host - Arguments host containing request/response objects
   * @returns void
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<IRequest>();

    const requestId = this.extractRequestId(request);
    const errorInfo = this.parseException(exception);

    if (this.shouldLogError()) {
      this.logError(errorInfo, request, requestId);
    }

    const includeStackTraces = this.config?.includeStackTraces ?? false;
    sendErrorResponse(response, errorInfo, requestId, includeStackTraces);
  }

  /**
   * Extract request ID from request or generate new one
   * @param request - Express request object
   * @returns Request ID string
   */
  private extractRequestId(request: IRequest): string {
    const requestId = request.headers?.['x-request-id'] || request.headers?.['x-correlation-id'];
    if (typeof requestId === 'string' && requestId) {
      return requestId;
    }
    if (Array.isArray(requestId) && requestId.length > 0) {
      return requestId[0] as string;
    }
    return uuidv4();
  }

  /**
   * Parse exception into standardized error information
   * @param exception - The exception to parse
   * @returns Parsed error information
   */
  private parseException(exception: unknown): {
    status: number;
    message: string;
    code: string;
    details: unknown;
  } {
    if (exception instanceof HttpException) {
      return parseHttpException(exception, this.config.sanitizeErrors);
    }

    if (exception instanceof BaseError) {
      return parseBaseError(exception, this.config.sanitizeErrors);
    }

    if (exception instanceof Error) {
      return parseStandardError(exception, this.config.sanitizeErrors);
    }

    return parseUnknownException(exception, this.config.sanitizeErrors);
  }

  /**
   * Check if error should be logged based on threshold
   * @returns Whether to log the error
   */
  private shouldLogError(): boolean {
    this.errorLogCount++;
    return this.errorLogCount <= this.config.logErrorThreshold;
  }

  /**
   * Log error with context
   * @param errorInfo - Error information
   * @param errorInfo.status
   * @param request - Express request object
   * @param errorInfo.message
   * @param requestId - Request ID
   * @param errorInfo.code
   * @param errorInfo.details
   * @returns void
   */
  private logError(
    errorInfo: { status: number; message: string; code: string; details: unknown },
    request: IRequest,
    requestId: string,
  ): void {
    const logContext = this.buildLogContext(errorInfo, request, requestId);

    this.loggingService.error(errorInfo.message, {
      ...logContext,
      error: errorInfo,
    });
  }

  /**
   * Build log context object
   * @param errorInfo - Error information
   * @param errorInfo.status
   * @param request - Express request object
   * @param errorInfo.message
   * @param requestId - Request ID
   * @param errorInfo.code
   * @param errorInfo.details
   * @returns Log context object
   */
  private buildLogContext(
    errorInfo: { status: number; message: string; code: string; details: unknown },
    request: IRequest,
    requestId: string,
  ): Record<string, unknown> {
    const logContext: Record<string, unknown> = {
      requestId,
      method: request.method,
      url: request.url,
      status: errorInfo.status,
      code: errorInfo.code,
      clientIp: extractClientIp(request),
      userAgent: request.headers?.['user-agent'],
      timestamp: new Date().toISOString(),
    };

    this.addOptionalFields(logContext, request);

    return logContext;
  }

  /**
   * Add optional fields to log context
   * @param logContext - Log context object
   * @param request - Express request object
   * @returns void
   */
  private addOptionalFields(logContext: Record<string, unknown>, request: IRequest): void {
    if (request.user?.id) {
      logContext['userId'] = request.user.id;
    }
    if (request.tenantId) {
      logContext['tenantId'] = request.tenantId;
    }
  }
}
