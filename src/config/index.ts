// Configuration module
export { ConfigModule } from './config.module';

// Configuration service
export { MainConfigService } from './config.service';

// Configuration factories
export {
  appConfig,
  databaseConfig,
  authConfig,
  cacheConfig,
  rateLimitConfig,
  awsConfig,
  emailConfig,
} from './configuration';

// Environment validation
export { validateEnv } from './environment.validation';

// Enums
export * from './enums/environment.enum';

// Interfaces
export * from './interfaces/app.config.interface';
export * from './interfaces/auth.config.interface';
export * from './interfaces/cache.config.interface';
export * from './interfaces/database.config.interface';
export * from './interfaces/external.config.interface';
