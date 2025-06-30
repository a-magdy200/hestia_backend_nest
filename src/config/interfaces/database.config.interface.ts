import { DatabaseType } from '../enums/environment.enum';

/**
 * Database configuration interface
 * Defines the structure for database-related configuration
 */
export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  url?: string;
  synchronize: boolean;
  logging: boolean;
  ssl?: boolean;
  entities: string[];
  migrations: string[];
  subscribers: string[];
  maxConnections?: number;
  connectionTimeout?: number;
  acquireTimeout?: number;
  timeout?: number;
  poolSize?: number;
}
