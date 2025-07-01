import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicationMetric, PerformanceMetric } from '@/database/entities/monitoring.entity';
import { LoggingService } from '@/services/logging.service';

/**
 *
 */
export interface IApplicationMetricData {
  metricName: string;
  service: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  userId?: string;
  tenantId?: string;
}

/**
 *
 */
export interface IPerformanceMetricData {
  metricType: string;
  service: string;
  duration: number;
  metadata?: Record<string, unknown>;
  userId?: string;
  tenantId?: string;
}

/**
 * Performance monitoring service
 * Handles recording and tracking of application performance metrics
 */
@Injectable()
export class PerformanceMonitoringService {
  /**
   * Constructor for PerformanceMonitoringService
   * @param applicationMetricRepository - Application metric repository
   * @param performanceMetricRepository - Performance metric repository
   * @param loggingService - Logging service
   */
  constructor(
    @InjectRepository(ApplicationMetric)
    private readonly applicationMetricRepository: Repository<ApplicationMetric>,
    @InjectRepository(PerformanceMetric)
    private readonly performanceMetricRepository: Repository<PerformanceMetric>,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Record application metric
   * @param data - Application metric data
   * @returns Promise that resolves when recording is complete
   */
  async recordApplicationMetric(data: IApplicationMetricData): Promise<void> {
    try {
      const metric = this.createApplicationMetric(data);
      await this.applicationMetricRepository.save(metric);
    } catch (error) {
      this.loggingService.error('Failed to record application metric', {
        service: 'monitoring',
        operation: 'recordApplicationMetric',
        metricName: data.metricName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create application metric entity
   * @param data - Application metric data
   * @returns Application metric entity
   */
  private createApplicationMetric(data: IApplicationMetricData): ApplicationMetric {
    const metricData: Partial<ApplicationMetric> = {
      metricName: data.metricName,
      service: data.service,
      value: data.value,
      unit: data.unit || 'count',
      timestamp: new Date(),
    };

    if (data.tags) {
      metricData.tags = data.tags;
    }
    if (data.userId) {
      metricData.userId = data.userId;
    }
    if (data.tenantId) {
      metricData.tenantId = data.tenantId;
    }

    return this.applicationMetricRepository.create(metricData);
  }

  /**
   * Record performance metric
   * @param data - Performance metric data
   * @returns Promise that resolves when recording is complete
   */
  async recordPerformanceMetric(data: IPerformanceMetricData): Promise<void> {
    try {
      const existingMetric = await this.findExistingPerformanceMetric(data);

      if (existingMetric && this.isRecentMetric(existingMetric.createdAt)) {
        await this.updateExistingPerformanceMetric(existingMetric, data);
      } else {
        await this.createNewPerformanceMetric(data);
      }
    } catch (error) {
      this.loggingService.error('Failed to record performance metric', {
        service: 'monitoring',
        operation: 'recordPerformanceMetric',
        metricType: data.metricType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Find existing performance metric
   * @param data - Performance metric data
   * @returns Promise that resolves to existing metric or null
   */
  private async findExistingPerformanceMetric(
    data: IPerformanceMetricData,
  ): Promise<PerformanceMetric | null> {
    return this.performanceMetricRepository.findOne({
      where: {
        metricType: data.metricType,
        service: data.service,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update existing performance metric
   * @param existingMetric - Existing metric to update
   * @param data - New performance metric data
   * @returns Promise that resolves when update is complete
   */
  private async updateExistingPerformanceMetric(
    existingMetric: PerformanceMetric,
    data: IPerformanceMetricData,
  ): Promise<void> {
    existingMetric.count += 1;
    existingMetric.duration = data.duration;
    existingMetric.minDuration = Math.min(existingMetric.minDuration, data.duration);
    existingMetric.maxDuration = Math.max(existingMetric.maxDuration, data.duration);
    existingMetric.avgDuration = (existingMetric.avgDuration + data.duration) / 2;
    existingMetric.updatedAt = new Date();

    if (data.metadata) {
      existingMetric.metadata = { ...existingMetric.metadata, ...data.metadata };
    }

    await this.performanceMetricRepository.save(existingMetric);
  }

  /**
   * Create new performance metric
   * @param data - Performance metric data
   * @returns Promise that resolves when creation is complete
   */
  private async createNewPerformanceMetric(data: IPerformanceMetricData): Promise<void> {
    const metric = this.performanceMetricRepository.create({
      metricType: data.metricType,
      service: data.service,
      duration: data.duration,
      ...(data.metadata && { metadata: data.metadata }),
      ...(data.userId && { userId: data.userId }),
      ...(data.tenantId && { tenantId: data.tenantId }),
      timestamp: new Date(),
      count: 1,
      minDuration: data.duration,
      maxDuration: data.duration,
      avgDuration: data.duration,
    });

    await this.performanceMetricRepository.save(metric);
  }

  /**
   * Check if metric is recent (within last 5 minutes)
   * @param createdAt - Creation timestamp
   * @returns True if metric is recent
   */
  private isRecentMetric(createdAt: Date): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return createdAt > fiveMinutesAgo;
  }
}
