import { Injectable } from '@nestjs/common';

import {
  ApiRequestMonitoringService,
  ApiRequestStats,
  IApiRequestLogData,
} from './monitoring/api-request-monitoring.service';
import { ErrorMonitoringService, IErrorLogData } from './monitoring/error-monitoring.service';
import {
  PerformanceMonitoringService,
  IApplicationMetricData,
  IPerformanceMetricData,
} from './monitoring/performance-monitoring.service';

/**
 * Main monitoring service that delegates to specialized monitoring services
 * Provides a unified interface for all monitoring operations
 */
@Injectable()
export class MonitoringService {
  /**
   * Constructor for MonitoringService
   * @param apiRequest - API request monitoring service
   * @param error - Error monitoring service
   * @param performance - Performance monitoring service
   */
  constructor(
    public readonly apiRequest: ApiRequestMonitoringService,
    public readonly error: ErrorMonitoringService,
    public readonly performance: PerformanceMonitoringService,
  ) {}

  /**
   * Log API request (delegates to ApiRequestMonitoringService)
   * @param data - API request log data
   * @returns Promise that resolves when logging is complete
   */
  async logApiRequest(data: IApiRequestLogData): Promise<void> {
    return this.apiRequest.logApiRequest(data);
  }

  /**
   * Log error (delegates to ErrorMonitoringService)
   * @param data - Error log data
   * @returns Promise that resolves when logging is complete
   */
  async logError(data: IErrorLogData): Promise<void> {
    return this.error.logError(data);
  }

  /**
   * Record application metric (delegates to PerformanceMonitoringService)
   * @param data - Application metric data
   * @returns Promise that resolves when recording is complete
   */
  async recordApplicationMetric(data: IApplicationMetricData): Promise<void> {
    return this.performance.recordApplicationMetric(data);
  }

  /**
   * Record performance metric (delegates to PerformanceMonitoringService)
   * @param data - Performance metric data
   * @returns Promise that resolves when recording is complete
   */
  async recordPerformanceMetric(data: IPerformanceMetricData): Promise<void> {
    return this.performance.recordPerformanceMetric(data);
  }

  /**
   * Get API request statistics (delegates to ApiRequestMonitoringService)
   * @param service - Service name filter
   * @param startDate - Start date filter
   * @param endDate - End date filter
   * @returns Promise that resolves to API request statistics
   */
  async getApiRequestStats(
    service?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ApiRequestStats> {
    return this.apiRequest.getApiRequestStats(service, startDate, endDate);
  }
}
