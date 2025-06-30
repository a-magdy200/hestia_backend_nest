import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { IRequest } from '@/interfaces/express.interface';
import { LoggingService } from '@/services/logging.service';
import { MonitoringService } from '@/services/monitoring.service';

/**
 * Performance tracking context interface
 */
interface PerformanceContext {
  request: IRequest;
  response: Record<string, unknown>;
  duration: number;
  requestId: string;
  userId?: string | undefined;
  tenantId?: string | undefined;
}

/**
 * Performance interceptor
 * Monitors and logs request performance metrics for optimization and debugging
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  /**
   * Constructor for PerformanceInterceptor
   * @param monitoringService - Service for monitoring and metrics
   * @param loggingService - Service for logging operations
   */
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Intercept request and response for performance monitoring
   * Measures execution time and logs performance metrics
   * @param context - Execution context containing request and response
   * @param next - Call handler function
   * @returns Observable of the response with performance tracking
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<IRequest>();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next
      .handle()
      .pipe(tap(() => this.handlePerformanceTracking(request, response, startTime)));
  }

  /**
   * Handle performance tracking logic
   * @param request - HTTP request object
   * @param response - HTTP response object
   * @param startTime - Request start time
   */
  private handlePerformanceTracking(
    request: IRequest,
    response: Record<string, unknown>,
    startTime: number,
  ): void {
    const duration = Date.now() - startTime;
    const requestId = request.requestId || 'unknown';
    const userId = request.user?.id;
    const tenantId = request.tenantId;

    const context: PerformanceContext = {
      request,
      response,
      duration,
      requestId,
      userId,
      tenantId,
    };

    this.logPerformanceMetrics(context);
    this.recordPerformanceMetric(context);
    this.logApiRequest(context);
    this.checkSlowApiCall(context);
  }

  /**
   * Log performance metrics
   * @param context - Performance tracking context
   */
  private logPerformanceMetrics(context: PerformanceContext): void {
    this.loggingService.log('API Performance', {
      requestId: context.requestId,
      service: 'api',
      operation: `${context.request.method} ${context.request.url}`,
      ...(context.userId && { userId: context.userId }),
      ...(context.tenantId && { tenantId: context.tenantId }),
      duration: context.duration,
      statusCode: context.response['statusCode'] as number,
    });
  }

  /**
   * Record performance metric in database
   * @param context - Performance tracking context
   */
  private recordPerformanceMetric(context: PerformanceContext): void {
    this.monitoringService.recordPerformanceMetric({
      metricType: 'api_request',
      service: 'api',
      duration: context.duration,
      metadata: {
        method: context.request.method,
        endpoint: context.request.url,
        statusCode: context.response['statusCode'] as number,
        userAgent: context.request.headers['user-agent'],
        ipAddress: context.request.ip,
      },
      ...(context.userId && { userId: context.userId }),
      ...(context.tenantId && { tenantId: context.tenantId }),
    });
  }

  /**
   * Log API request to database
   * @param context - Performance tracking context
   */
  private logApiRequest(context: PerformanceContext): void {
    this.monitoringService.logApiRequest({
      requestId: context.requestId,
      method: context.request.method,
      endpoint: context.request.url,
      statusCode: context.response['statusCode'] as number,
      responseTime: context.duration,
      ...(context.userId && { userId: context.userId }),
      ...(context.tenantId && { tenantId: context.tenantId }),
      ...(context.request.headers['user-agent'] && {
        userAgent: context.request.headers['user-agent'] as string,
      }),
      ...(context.request.ip && { ipAddress: context.request.ip }),
      requestHeaders: this.sanitizeHeaders(context.request.headers),
      responseHeaders: this.sanitizeHeaders({}),
    });
  }

  /**
   * Check for slow API calls
   * @param context - Performance tracking context
   */
  private checkSlowApiCall(context: PerformanceContext): void {
    if (context.duration > 1000) {
      this.loggingService.warn('Slow API call detected', {
        requestId: context.requestId,
        service: 'api',
        operation: `${context.request.method} ${context.request.url}`,
        ...(context.userId && { userId: context.userId }),
        ...(context.tenantId && { tenantId: context.tenantId }),
        duration: context.duration,
        threshold: 1000,
      });
    }
  }

  /**
   * Sanitize headers for logging
   * @param headers - Headers to sanitize
   * @returns Sanitized headers
   */
  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

    for (const [key, value] of Object.entries(headers)) {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
