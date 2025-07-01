import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { ErrorLog } from '@/database/entities/monitoring.entity';
import { LoggingService } from '@/services/logging.service';

/**
 *
 */
export interface IErrorLogData {
  errorCode: string;
  message: string;
  service: string;
  operation?: string;
  requestId?: string;
  userId?: string;
  tenantId?: string;
  stackTrace?: string;
  context?: Record<string, unknown>;
}

/**
 * Error monitoring service
 * Handles logging and tracking of application errors
 */
@Injectable()
export class ErrorMonitoringService {
  /**
   * Constructor for ErrorMonitoringService
   * @param errorLogRepository - Error log repository
   * @param loggingService - Logging service
   */
  constructor(
    @InjectRepository(ErrorLog)
    private readonly errorLogRepository: Repository<ErrorLog>,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Log error
   * @param data - Error log data
   * @returns Promise that resolves when logging is complete
   */
  async logError(data: IErrorLogData): Promise<void> {
    try {
      const existingError = await this.findExistingError(data);

      if (existingError && this.isRecentError(existingError.createdAt)) {
        await this.updateExistingError(existingError);
      } else {
        await this.createNewErrorLog(data);
      }
    } catch (error) {
      this.loggingService.error('Failed to log error', {
        service: 'monitoring',
        operation: 'logError',
        errorCode: data.errorCode,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Find existing error
   * @param data - Error log data
   * @returns Promise that resolves to existing error or null
   */
  private async findExistingError(data: IErrorLogData): Promise<ErrorLog | null> {
    const whereCondition: FindOptionsWhere<ErrorLog> = {
      errorCode: data.errorCode,
      service: data.service,
    };

    if (data.operation) {
      whereCondition.operation = data.operation;
    }

    return await this.errorLogRepository.findOne({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update existing error
   * @param existingError - Existing error to update
   * @returns Promise that resolves when update is complete
   */
  private async updateExistingError(existingError: ErrorLog): Promise<void> {
    existingError.occurrenceCount += 1;
    existingError.updatedAt = new Date();

    await this.errorLogRepository.save(existingError);
  }

  /**
   * Create new error log
   * @param data - Error log data
   * @returns Promise that resolves when creation is complete
   */
  private async createNewErrorLog(data: IErrorLogData): Promise<void> {
    const errorLog = this.errorLogRepository.create({
      ...data,
      timestamp: new Date(),
      occurrenceCount: 1,
    });
    await this.errorLogRepository.save(errorLog);
  }

  /**
   * Check if error is recent (within last hour)
   * @param createdAt - Creation timestamp
   * @returns True if error is recent
   */
  private isRecentError(createdAt: Date): boolean {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return createdAt > oneHourAgo;
  }

  /**
   * Get error statistics
   * @param startDate - Start date for filtering
   * @param endDate - End date for filtering
   * @returns Promise that resolves to error statistics
   */
  async getErrorStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalErrors: number;
    errorRate: number;
    topErrorTypes: { errorType: string; count: number }[];
  }> {
    try {
      const queryBuilder = this.buildErrorStatsQuery(startDate, endDate);
      const totalErrors = await queryBuilder.getCount();
      const topErrorTypes = await this.getTopErrorTypes(queryBuilder);

      return {
        totalErrors,
        errorRate: 0, // This would need to be calculated based on total requests
        topErrorTypes,
      };
    } catch (error) {
      this.loggingService.error('Failed to get error stats', {
        service: 'monitoring',
        operation: 'getErrorStats',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Build error stats query with date filters
   * @param startDate - Start date for filtering
   * @param endDate - End date for filtering
   * @returns Query builder with filters applied
   */
  private buildErrorStatsQuery(
    startDate?: Date,
    endDate?: Date,
  ): ReturnType<typeof this.errorLogRepository.createQueryBuilder> {
    const queryBuilder = this.errorLogRepository.createQueryBuilder('error');

    if (startDate) {
      queryBuilder.andWhere('error.timestamp >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('error.timestamp <= :endDate', { endDate });
    }

    return queryBuilder;
  }

  /**
   * Get top error types from query builder
   * @param queryBuilder - Query builder with filters applied
   * @returns Promise that resolves to top error types
   */
  private async getTopErrorTypes(
    queryBuilder: ReturnType<typeof this.errorLogRepository.createQueryBuilder>,
  ) {
    const topErrorTypes = await queryBuilder
      .select('error.errorType', 'errorType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('error.errorType')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return topErrorTypes.map((item: { errorType: string; count: string }) => ({
      errorType: item.errorType,
      count: parseInt(item.count),
    }));
  }
}
