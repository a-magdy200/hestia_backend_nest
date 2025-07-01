import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as os from 'os';
import { MainConfigService } from '../config/config.service';
import { CacheService } from '../services/cache.service';
import { LoggingService } from '../services/logging.service';
import { RateLimitService } from '../services/rate-limit.service';

/**
 * Health check controller
 * Provides comprehensive application health status and monitoring endpoints
 * Includes system metrics, performance monitoring, and dependency health checks
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly configService: MainConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
    private readonly loggingService: LoggingService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  /**
   * Basic health check endpoint
   * @returns Standard health check response
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Returns basic health status for load balancers and basic monitoring.',
  })
  @ApiResponse({ status: 200, description: 'Health check result' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async health(@Req() req: Request): Promise<ApiResponseDto<HealthStatusDto>> {
    return this.wrapResponse(await this.getBasicHealth(), 'Health check successful', req);
  }

  /**
   * Detailed health check endpoint
   * @returns Detailed health check response
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detailed health check',
    description: 'Returns detailed health and system metrics for comprehensive monitoring.',
  })
  @ApiResponse({ status: 200, description: 'Detailed health check result' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async detailed(@Req() req: Request): Promise<ApiResponseDto<DetailedHealthStatusDto>> {
    return this.wrapResponse(
      await this.getDetailedHealth(),
      'Detailed health check successful',
      req,
    );
  }

  /**
   * Readiness check endpoint for orchestrators
   * @returns Readiness status
   */
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Readiness check',
    description: 'Checks if all critical dependencies are ready for traffic.',
  })
  @ApiResponse({ status: 200, description: 'Readiness check result' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async ready(@Req() req: Request): Promise<ApiResponseDto<ReadinessStatusDto>> {
    return this.wrapResponse(await this.getReadiness(), 'Readiness check successful', req);
  }

  /**
   * Liveness check endpoint for orchestrators
   * @returns Liveness status
   */
  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Liveness check',
    description: 'Checks if the application is alive and responsive.',
  })
  @ApiResponse({ status: 200, description: 'Liveness check result' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async live(@Req() req: Request): Promise<ApiResponseDto<LivenessStatusDto>> {
    return this.wrapResponse(this.getLiveness(), 'Liveness check successful', req);
  }

  /**
   * System metrics endpoint
   * @returns System metrics
   */
  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'System metrics',
    description: 'Returns comprehensive system and dependency metrics for monitoring.',
  })
  @ApiResponse({ status: 200, description: 'System metrics result' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async metrics(@Req() req: Request): Promise<ApiResponseDto<SystemMetricsDto>> {
    return this.wrapResponse(await this.getSystemMetrics(), 'System metrics collected', req);
  }

  // ===================== PRIVATE HELPERS =====================

  private async getBasicHealth(): Promise<HealthStatusDto> {
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    return {
      status: memoryUsagePercent < 90 ? 'ok' : 'warning',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: this.configService.app.version,
      environment: this.configService.app.environment,
      service: this.configService.app.name,
      memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
    };
  }

  private async getDetailedHealth(): Promise<DetailedHealthStatusDto> {
    const basicHealth = await this.getBasicHealth();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      ...basicHealth,
      memory: memoryUsage,
      cpu: cpuUsage,
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      system: this.getSystemInfo(),
      performance: this.getPerformanceMetrics(),
      security: this.getSecurityStatus(),
    };
  }

  private async getReadiness(): Promise<ReadinessStatusDto> {
    const startTime = Date.now();

    try {
      const results = await this.performReadinessChecks();
      const responseTime = Date.now() - startTime;
      const allReady = results.every(r => r.status === 'ready');

      return {
        status: allReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        responseTime,
        checks: this.buildReadinessChecks(results),
      };
    } catch (error) {
      this.logError('Readiness check failed', error);
      return this.buildErrorReadinessResult(startTime);
    }
  }

  private async performReadinessChecks(): Promise<DependencyCheckDto[]> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkCache(),
      this.checkExternalServices(),
      this.checkSystemHealth(),
    ]);

    return checks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      const checkNames = ['database', 'cache', 'external', 'system'];
      this.logError(`${checkNames[index]} check failed`, result.reason);
      return {
        status: 'not_ready' as const,
        error: 'Check failed',
        timestamp: new Date().toISOString(),
      };
    });
  }

  private buildReadinessChecks(results: DependencyCheckDto[]): ReadinessStatusDto['checks'] {
    if (!results || results.length !== 4) {
      // Return default error checks if we don't have exactly 4 results
      return {
        database: {
          status: 'not_ready',
          error: 'Check failed',
          timestamp: new Date().toISOString(),
        },
        cache: {
          status: 'not_ready',
          error: 'Check failed',
          timestamp: new Date().toISOString(),
        },
        external: {
          status: 'not_ready',
          error: 'Check failed',
          timestamp: new Date().toISOString(),
        },
        system: {
          status: 'not_ready',
          error: 'Check failed',
          timestamp: new Date().toISOString(),
        },
      };
    }

    // At this point, we know we have exactly 4 elements
    const [database, cache, external, system] = results as [
      DependencyCheckDto,
      DependencyCheckDto,
      DependencyCheckDto,
      DependencyCheckDto,
    ];

    return {
      database,
      cache,
      external,
      system,
    };
  }

  private buildErrorReadinessResult(startTime: number): ReadinessStatusDto {
    return {
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: 'Readiness check failed',
      checks: {
        database: {
          status: 'not_ready',
          error: 'Check failed',
          timestamp: new Date().toISOString(),
        },
        cache: {
          status: 'not_ready',
          error: 'Check failed',
          timestamp: new Date().toISOString(),
        },
        external: {
          status: 'not_ready',
          error: 'Check failed',
          timestamp: new Date().toISOString(),
        },
        system: {
          status: 'not_ready',
          error: 'Check failed',
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  private getLiveness(): LivenessStatusDto {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid,
      responseTime: Date.now() - this.startTime,
    };
  }

  private async getSystemMetrics(): Promise<SystemMetricsDto> {
    const [memoryUsage, cpuUsage, dependencyMetrics] = await Promise.all([
      Promise.resolve(process.memoryUsage()),
      Promise.resolve(process.cpuUsage()),
      this.getDependencyMetrics(),
    ]);

    return {
      memory: this.getDetailedMemoryUsage(memoryUsage),
      cpu: this.getDetailedCpuUsage(cpuUsage),
      system: this.getSystemInfo(),
      performance: this.getPerformanceMetrics(),
      dependencies: dependencyMetrics,
      network: this.getNetworkInfo(),
      process: this.getProcessInfo(),
    };
  }

  private getSystemInfo(): SystemInfoDto {
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      type: os.type(),
      release: os.release(),
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      loadAverage: os.loadavg(),
    };
  }

  private getPerformanceMetrics(): PerformanceMetricsDto {
    return {
      uptime: process.uptime(),
      startTime: this.startTime,
      responseTime: Date.now() - this.startTime,
      eventLoopLag: this.getEventLoopLag(),
      gcStats: this.getGarbageCollectionStats(),
    };
  }

  private getSecurityStatus(): SecurityStatusDto {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      isProduction: this.configService.app.environment === 'production',
      hasSecurityHeaders: true, // Would check actual headers in real implementation
    };
  }

  private async checkDatabase(): Promise<DependencyCheckDto> {
    const startTime = Date.now();

    try {
      await this.dataSource.query('SELECT 1 as health_check');
      const responseTime = Date.now() - startTime;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          type: this.dataSource.options.type || 'unknown',
          connected: this.dataSource.isInitialized,
        },
      };
    } catch (error) {
      this.logError('Database check failed', error);
      return {
        status: 'not_ready',
        error: 'Database unavailable',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkCache(): Promise<DependencyCheckDto> {
    const startTime = Date.now();

    try {
      const testKey = `health_check_${Date.now()}`;
      const testValue = { timestamp: Date.now(), test: true };

      await this.cacheService.set(testKey, testValue, 10);
      const retrieved = await this.cacheService.get(testKey);
      await this.cacheService.delete(testKey);

      if (!retrieved) {
        throw new Error('Cache read/write test failed');
      }

      const responseTime = Date.now() - startTime;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          type: 'redis',
          operation: 'read_write_test',
        },
      };
    } catch (error) {
      this.logError('Cache check failed', error);
      return {
        status: 'not_ready',
        error: 'Cache unavailable',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkExternalServices(): Promise<DependencyCheckDto> {
    const startTime = Date.now();

    try {
      const checks = [];

      // Check email configuration
      if (this.configService.email.smtpHost) {
        checks.push({ service: 'email', status: 'configured' });
      } else {
        checks.push({ service: 'email', status: 'not_configured' });
      }

      // Check AWS configuration
      if (this.configService.aws.accessKeyId) {
        checks.push({ service: 'aws', status: 'configured' });
      } else {
        checks.push({ service: 'aws', status: 'not_configured' });
      }

      const responseTime = Date.now() - startTime;
      const allConfigured = checks.every(check => check.status === 'configured');

      return {
        status: allConfigured ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        responseTime,
        details: { services: checks },
      };
    } catch (error) {
      this.logError('External service check failed', error);
      return {
        status: 'not_ready',
        error: 'External service check failed',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async checkSystemHealth(): Promise<DependencyCheckDto> {
    const startTime = Date.now();

    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      const cpuUsage = process.cpuUsage();

      const isHealthy = memoryUsagePercent < 90;
      const responseTime = Date.now() - startTime;

      return {
        status: isHealthy ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        responseTime,
        details: {
          memoryUsagePercent: Math.round(memoryUsagePercent * 100) / 100,
          cpuUsage: cpuUsage.user + cpuUsage.system,
          uptime: process.uptime(),
        },
      };
    } catch (error) {
      this.logError('System health check failed', error);
      return {
        status: 'not_ready',
        error: 'System health check failed',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async getDependencyMetrics(): Promise<DependencyMetricsDto> {
    try {
      const rateLimitStats = await this.rateLimitService.getStats();

      return {
        rateLimit: {
          totalKeys: rateLimitStats.totalKeys,
          blockedKeys: rateLimitStats.blockedKeys,
          activeKeys: rateLimitStats.activeKeys,
          config: rateLimitStats.config as unknown as Record<string, unknown>,
        },
        database: {
          connected: this.dataSource.isInitialized,
          type: this.dataSource.options.type,
        },
        cache: {
          connected: true,
          type: 'redis',
        },
      };
    } catch (error) {
      this.logError('Dependency metrics failed', error);
      return {
        rateLimit: {
          totalKeys: 0,
          blockedKeys: 0,
          activeKeys: 0,
          config: {},
        },
        database: {
          connected: false,
          type: 'unknown',
        },
        cache: {
          connected: false,
          type: 'unknown',
        },
      };
    }
  }

  private getDetailedMemoryUsage(memory: NodeJS.MemoryUsage): DetailedMemoryUsageDto {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    return {
      ...memory,
      system: {
        total: totalMemory,
        free: freeMemory,
        used: totalMemory - freeMemory,
        usagePercent: ((totalMemory - freeMemory) / totalMemory) * 100,
      },
      heap: {
        usagePercent: (memory.heapUsed / memory.heapTotal) * 100,
        fragmentation: ((memory.heapTotal - memory.heapUsed) / memory.heapTotal) * 100,
      },
    };
  }

  private getDetailedCpuUsage(cpu: NodeJS.CpuUsage): DetailedCpuUsageDto {
    const cpus = os.cpus();

    return {
      user: cpu.user,
      system: cpu.system,
      systemInfo: {
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        speed: cpus[0]?.speed || 0,
        loadAverage: os.loadavg(),
      },
      process: {
        userPercent: (cpu.user / 1000000) * 100,
        systemPercent: (cpu.system / 1000000) * 100,
      },
    };
  }

  private getNetworkInfo(): NetworkInfoDto {
    const networkInterfaces = os.networkInterfaces();
    const interfaces: Record<string, NetworkInterfaceDto[]> = {};

    for (const [name, nets] of Object.entries(networkInterfaces)) {
      if (nets) {
        interfaces[name] = nets.map(net => ({
          address: net.address,
          family: net.family,
          internal: net.internal,
        }));
      }
    }

    return {
      interfaces,
      hostname: os.hostname(),
    };
  }

  private getProcessInfo(): ProcessInfoDto {
    return {
      pid: process.pid,
      ppid: process.ppid,
      title: process.title,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    };
  }

  private getEventLoopLag(): number {
    const start = Date.now();
    setImmediate(() => {
      // This is a simplified measurement
    });
    return Date.now() - start;
  }

  private getGarbageCollectionStats(): GarbageCollectionStatsDto {
    // In a real implementation, you would use the v8 module to get GC stats
    return {
      collections: 0,
      duration: 0,
      memoryBefore: 0,
      memoryAfter: 0,
    };
  }

  private wrapResponse<T>(data: T, message: string, req: Request): ApiResponseDto<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId: (req.headers['x-request-id'] as string) || '',
    };
  }

  private logError(message: string, error: unknown): void {
    this.loggingService.error(message, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      operation: 'health_check',
    });
  }
}

// ===================== DTOs =====================

export interface ApiResponseDto<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  requestId: string;
}

export interface HealthStatusDto {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  service: string;
  memoryUsagePercent: number;
}

export interface DetailedHealthStatusDto extends HealthStatusDto {
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  platform: string;
  nodeVersion: string;
  pid: number;
  system: SystemInfoDto;
  performance: PerformanceMetricsDto;
  security: SecurityStatusDto;
}

export interface ReadinessStatusDto {
  status: string;
  timestamp: string;
  responseTime?: number;
  error?: string;
  checks: {
    database: DependencyCheckDto;
    cache: DependencyCheckDto;
    external: DependencyCheckDto;
    system: DependencyCheckDto;
  };
}

export interface LivenessStatusDto {
  status: string;
  timestamp: string;
  uptime: number;
  pid: number;
  responseTime: number;
}

export interface SystemMetricsDto {
  memory: DetailedMemoryUsageDto;
  cpu: DetailedCpuUsageDto;
  system: SystemInfoDto;
  performance: PerformanceMetricsDto;
  dependencies: DependencyMetricsDto;
  network: NetworkInfoDto;
  process: ProcessInfoDto;
}

export interface SystemInfoDto {
  platform: string;
  arch: string;
  hostname: string;
  type: string;
  release: string;
  uptime: number;
  totalMemory: number;
  freeMemory: number;
  cpus: number;
  loadAverage: number[];
}

export interface PerformanceMetricsDto {
  uptime: number;
  startTime: number;
  responseTime: number;
  eventLoopLag: number;
  gcStats: GarbageCollectionStatsDto;
}

export interface SecurityStatusDto {
  nodeVersion: string;
  platform: string;
  arch: string;
  isProduction: boolean;
  hasSecurityHeaders: boolean;
}

export interface DependencyCheckDto {
  status: 'ready' | 'not_ready';
  error?: string;
  timestamp: string;
  responseTime?: number;
  details?: Record<string, unknown>;
}

export interface DependencyMetricsDto {
  rateLimit: {
    totalKeys: number;
    blockedKeys: number;
    activeKeys: number;
    config: Record<string, unknown>;
  };
  database: {
    connected: boolean;
    type: string;
  };
  cache: {
    connected: boolean;
    type: string;
  };
}

export interface DetailedMemoryUsageDto extends NodeJS.MemoryUsage {
  system: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
  };
  heap: {
    usagePercent: number;
    fragmentation: number;
  };
}

export interface DetailedCpuUsageDto {
  user: number;
  system: number;
  systemInfo: {
    cores: number;
    model: string;
    speed: number;
    loadAverage: number[];
  };
  process: {
    userPercent: number;
    systemPercent: number;
  };
}

export interface NetworkInfoDto {
  interfaces: Record<string, NetworkInterfaceDto[]>;
  hostname: string;
}

export interface NetworkInterfaceDto {
  address: string;
  family: string;
  internal: boolean;
}

export interface ProcessInfoDto {
  pid: number;
  ppid: number;
  title: string;
  version: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

export interface GarbageCollectionStatsDto {
  collections: number;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
}
