import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { MainConfigService } from './config.service';
import {
  appConfig,
  databaseConfig,
  authConfig,
  cacheConfig,
  rateLimitConfig,
  awsConfig,
  emailConfig,
} from './configuration';
import { validateEnv } from './environment.validation';

/**
 * Configuration module
 * Provides centralized configuration management for the application
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.development', '.env.production', '.env'],
      validate: validateEnv,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        cacheConfig,
        rateLimitConfig,
        awsConfig,
        emailConfig,
      ],
      cache: true,
      expandVariables: true,
    }),
  ],
  providers: [MainConfigService],
  exports: [MainConfigService],
})
export class ConfigModule {}
