import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { ApiRequestLog } from '@/database/entities/monitoring.entity';
import { LoggingService } from '@/services/logging.service';

export interface IApiRequestLogData {
  requestId: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  tenantId?: string;
  userAgent?: string;
  ipAddress?: string;
  requestHeaders?: Record<string, unknown>;
  responseHeaders?: Record<string, unknown>;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  errorMessage?: string;
  errorStack?: string;
}

export interface ApiRequestStats {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
}

interface AverageResponseTimeResult {
  avgResponseTime: string;
}

interface TopEndpointResult {
  endpoint: string;
  count: string;
}

/**
 * API Request Monitoring Service
 * Handles logging and statistics for API requests
 */
@Injectable()
export class ApiRequestMonitoringService {
  /**
   * Constructor for ApiRequestMonitoringService
   * @param apiRequestLogRepository - API request log repository
   * @param loggingService - Logging service
   */
  constructor(
    @InjectRepository(ApiRequestLog)
    private readonly apiRequestLogRepository: Repository<ApiRequestLog>,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Log API request
   * @param data - API request log data
   * @returns Promise that resolves when logging is complete
   */
  async logApiRequest(data: IApiRequestLogData): Promise<void> {
    try {
      const log = this.apiRequestLogRepository.create({
        ...data,
        timestamp: new Date(),
      });

      await this.apiRequestLogRepository.save(log);
    } catch (error) {
      this.loggingService.error('Failed to log API request', {
        service: 'monitoring',
        operation: 'logApiRequest',
        requestId: data.requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get API request statistics
   * @param service - Service name filter
   * @param startDate - Start date for filtering
   * @param endDate - End date for filtering
   * @returns Promise that resolves to API request statistics
   */
  async getApiRequestStats(
    service?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ApiRequestStats> {
    try {
      const queryBuilder = this.buildApiRequestQuery(service, startDate, endDate);
      const stats = await this.calculateApiRequestStats(queryBuilder);
      return stats;
    } catch (error) {
      this.loggingService.error('Failed to get API request stats', {
        service: 'monitoring',
        operation: 'getApiRequestStats',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Build API request query
   * @param service - Service name filter
   * @param startDate - Start date filter
   * @param endDate - End date filter
   * @returns Query builder for API requests
   */
  private buildApiRequestQuery(
    service?: string,
    startDate?: Date,
    endDate?: Date,
  ): SelectQueryBuilder<ApiRequestLog> {
    const queryBuilder = this.apiRequestLogRepository.createQueryBuilder('log');

    if (service) {
      queryBuilder.andWhere('log.endpoint LIKE :service', { service: `%${service}%` });
    }

    if (startDate) {
      queryBuilder.andWhere('log.timestamp >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('log.timestamp <= :endDate', { endDate });
    }

    return queryBuilder;
  }

  /**
   * Calculate API request statistics
   * @param queryBuilder - Query builder for API requests
   * @returns Promise that resolves to API request statistics
   */
  private async calculateApiRequestStats(
    queryBuilder: SelectQueryBuilder<ApiRequestLog>,
  ): Promise<ApiRequestStats> {
    const totalRequests = await queryBuilder.getCount();
    const averageResponseTime = (await queryBuilder
      .select('AVG(log.responseTime)', 'avgResponseTime')
      .getRawOne()) as AverageResponseTimeResult;

    const errorCount = await queryBuilder.andWhere('log.statusCode >= 400').getCount();

    const topEndpoints = (await queryBuilder
      .select('log.endpoint', 'endpoint')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.endpoint')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany()) as TopEndpointResult[];

    return {
      totalRequests,
      averageResponseTime: parseFloat(averageResponseTime?.avgResponseTime || '0'),
      errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
      topEndpoints: topEndpoints.map(item => ({
        endpoint: item.endpoint,
        count: parseInt(item.count),
      })),
    };
  }
}
