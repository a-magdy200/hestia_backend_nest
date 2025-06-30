import { Controller, Get } from '@nestjs/common';

import { MainConfigService } from '../config/config.service';

/**
 * Health check controller
 * Provides application health status and monitoring endpoints for system monitoring
 */
@Controller('health')
export class HealthController {
  /**
   * Constructor for HealthController
   * @param configService - Configuration service for application settings
   */
  constructor(private readonly configService: MainConfigService) {}

  /**
   * Get application health status
   * Returns comprehensive health check information including system metrics
   * @returns Health check result with status and metrics
   */
  @Get()
  check(): HealthCheckResult {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: this.configService.app.version,
      environment: this.configService.app.environment,
    };
  }

  /**
   * Get detailed health status
   * @returns Detailed health check with all system metrics
   */
  @Get('detailed')
  detailedCheck(): DetailedHealthCheckResult {
    return {
      ...this.check(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      title: process.title,
    };
  }

  /**
   * Get readiness status
   * @returns Readiness check for Kubernetes
   */
  @Get('ready')
  ready(): ReadinessResult {
    // TODO: Add database connection check
    // TODO: Add external service checks
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get liveness status
   * @returns Liveness check for Kubernetes
   */
  @Get('live')
  live(): LivenessResult {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Health check result interface
 */
interface HealthCheckResult {
  status: string;
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  version: string;
  environment: string;
}

/**
 * Detailed health check result interface
 */
interface DetailedHealthCheckResult extends HealthCheckResult {
  cpu: NodeJS.CpuUsage;
  platform: string;
  nodeVersion: string;
  pid: number;
  title: string;
}

/**
 * Readiness result interface
 */
interface ReadinessResult {
  status: string;
  timestamp: string;
}

/**
 * Liveness result interface
 */
interface LivenessResult {
  status: string;
  timestamp: string;
}
