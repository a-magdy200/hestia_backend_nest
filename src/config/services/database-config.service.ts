import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DatabaseType } from '../enums/environment.enum';
import { DatabaseConfig } from '../interfaces/database.config.interface';

/**
 * Database configuration service
 * Provides centralized access to database configuration values
 */
@Injectable()
export class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  /**
   * Get database configuration
   * @returns Database configuration object
   */
  get database(): DatabaseConfig {
    return this.configService.get<DatabaseConfig>('database')!;
  }

  /**
   * Get database type
   * @returns Database type
   */
  get type(): DatabaseType {
    return this.database.type;
  }

  /**
   * Get database host
   * @returns Database host
   */
  get host(): string {
    return this.database.host;
  }

  /**
   * Get database port
   * @returns Database port
   */
  get port(): number {
    return this.database.port;
  }

  /**
   * Get database name
   * @returns Database name
   */
  get databaseName(): string {
    return this.database.database;
  }

  /**
   * Check if database synchronization is enabled
   * @returns True if synchronization is enabled
   */
  get synchronize(): boolean {
    return this.database.synchronize;
  }

  /**
   * Check if database logging is enabled
   * @returns True if logging is enabled
   */
  get logging(): boolean {
    return this.database.logging;
  }

  /**
   * Get database entities path
   * @returns Database entities path
   */
  get entities(): string[] {
    return this.database.entities;
  }

  /**
   * Get database migrations path
   * @returns Database migrations path
   */
  get migrations(): string[] {
    return this.database.migrations;
  }

  /**
   * Get database subscribers path
   * @returns Database subscribers path
   */
  get subscribers(): string[] {
    return this.database.subscribers;
  }

  /**
   * Get database URL
   * @returns Database URL
   */
  get url(): string | undefined {
    return this.database.url;
  }

  /**
   * Check if SSL is enabled
   * @returns True if SSL is enabled
   */
  get ssl(): boolean {
    return this.database.ssl || false;
  }

  /**
   * Get database username
   * @returns Database username
   */
  get username(): string {
    return this.database.username;
  }

  /**
   * Get database password
   * @returns Database password
   */
  get password(): string {
    return this.database.password;
  }

  /**
   * Get maximum connections
   * @returns Maximum connections
   */
  get maxConnections(): number {
    return this.database.maxConnections || 10;
  }

  /**
   * Get connection timeout
   * @returns Connection timeout in milliseconds
   */
  get connectionTimeout(): number {
    return this.database.connectionTimeout || 60000;
  }

  /**
   * Get acquire timeout
   * @returns Acquire timeout in milliseconds
   */
  get acquireTimeout(): number {
    return this.database.acquireTimeout || 60000;
  }

  /**
   * Get database timeout
   * @returns Database timeout in milliseconds
   */
  get timeout(): number {
    return this.database.timeout || 60000;
  }

  /**
   * Get pool size
   * @returns Pool size
   */
  get poolSize(): number {
    return this.database.poolSize || 10;
  }
}
