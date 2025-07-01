import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, MainConfigService } from './config';
import { EXCEPTION_FILTER_CONFIG_PROVIDER } from './config/exception-filter.config';
import { DatabaseConfigService } from './config/services/database-config.service';
import { AppController } from './controllers/app.controller';
import { HealthController } from './controllers/health.controller';
import {
  ApiRequestLog,
  ApplicationMetric,
  ErrorLog,
  PerformanceMetric,
} from './database/entities/monitoring.entity';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { ValidationPipe } from './pipes/validation.pipe';
import { AppService } from './services/app.service';
import { LoggingService } from './services/logging.service';
import { MonitoringService } from './services/monitoring.service';
import { UserModule } from './modules/user.module';

/**
 * Database configuration interface
 */
interface DatabaseConfig {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: string[];
  synchronize: boolean;
  logging: boolean;
  url?: string;
  ssl?: boolean;
  maxConnections?: number;
  connectionTimeout?: number;
  acquireTimeout?: number;
  timeout?: number;
  poolSize?: number;
}

/**
 * Add basic database configuration
 * @param config - Configuration object
 * @param dbConfig - Database configuration
 */
const addBasicConfig = (config: Record<string, unknown>, dbConfig: DatabaseConfig): void => {
  config['type'] = dbConfig.type;
  config['host'] = dbConfig.host;
  config['port'] = dbConfig.port;
  config['username'] = dbConfig.username;
  config['password'] = dbConfig.password;
  config['database'] = dbConfig.database;
  config['entities'] = dbConfig.entities;
  config['synchronize'] = dbConfig.synchronize;
  config['logging'] = dbConfig.logging;
};

/**
 * Add optional database configuration
 * @param config - Configuration object
 * @param dbConfig - Database configuration
 */
const addOptionalConfig = (config: Record<string, unknown>, dbConfig: DatabaseConfig): void => {
  const optionalProps = [
    { key: 'url', value: dbConfig.url },
    { key: 'ssl', value: dbConfig.ssl },
    { key: 'connectTimeout', value: dbConfig.connectionTimeout },
    { key: 'acquireTimeout', value: dbConfig.acquireTimeout },
    { key: 'timeout', value: dbConfig.timeout },
  ];

  optionalProps.forEach(({ key, value }) => {
    if (value !== undefined) {
      config[key] = value;
    }
  });

  if (dbConfig.maxConnections) {
    config['extra'] = { max: dbConfig.maxConnections };
  }

  if (dbConfig.poolSize) {
    const extra = (config['extra'] as Record<string, unknown>) || {};
    config['extra'] = { ...extra, poolSize: dbConfig.poolSize };
  }
};

/**
 * Creates TypeORM configuration object from database config
 * @param dbConfig - Database configuration service
 * @returns TypeORM configuration object
 */
const createTypeOrmConfig = (dbConfig: DatabaseConfigService): Record<string, unknown> => {
  const config: Record<string, unknown> = {};

  const dbConfigObj: DatabaseConfig = {
    type: dbConfig.type,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.databaseName,
    entities: dbConfig.entities,
    synchronize: dbConfig.synchronize,
    logging: dbConfig.logging,
    ssl: dbConfig.ssl,
    maxConnections: dbConfig.maxConnections,
    connectionTimeout: dbConfig.connectionTimeout,
    acquireTimeout: dbConfig.acquireTimeout,
    timeout: dbConfig.timeout,
    poolSize: dbConfig.poolSize,
  };

  if (dbConfig.url) {
    dbConfigObj.url = dbConfig.url;
  }

  addBasicConfig(config, dbConfigObj);
  addOptionalConfig(config, dbConfigObj);

  return config;
};

/**
 * Root application module
 * Configures the main application components and dependencies
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: MainConfigService) => createTypeOrmConfig(configService.database),
      inject: [MainConfigService],
    }),
    TypeOrmModule.forFeature([ApiRequestLog, ApplicationMetric, ErrorLog, PerformanceMetric]),
    UserModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    LoggingService,
    MonitoringService,
    EXCEPTION_FILTER_CONFIG_PROVIDER,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule {
  /**
   * Configure middleware
   * @param consumer - Middleware consumer
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
