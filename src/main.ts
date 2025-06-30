import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

/**
 * Start MSW in development mode
 * @param configService - Configuration service
 */
const startMSWIfEnabled = async (configService: ConfigService): Promise<void> => {
  const isDevelopment = configService.get<string>('app.environment') === 'development';
  const isMSWEnabled = configService.get<string>('app.mswEnabled') === 'true';

  if (!isDevelopment || !isMSWEnabled) {
    return;
  }

  try {
    // Dynamic import to avoid issues in production
    const mswModule = await import('./mocks');
    await mswModule.startMSW();
    // MSW started successfully - no console output needed
  } catch {
    // MSW failed to start - this is expected in production
    // No console output needed
  }
};

/**
 * Bootstrap the application
 * Initializes and starts the NestJS application
 */
const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for frontend development
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  // Application started successfully - no console output needed

  // Start MSW in development mode
  await startMSWIfEnabled(configService);
};

bootstrap();
