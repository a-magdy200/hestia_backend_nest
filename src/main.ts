import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { LoggingService } from './services/logging.service';

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
 * Bootstrap application with comprehensive configuration
 * Sets up all middleware, interceptors, filters, and documentation
 */
const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Get configuration service
  const configService = app.get(ConfigService);
  const loggingService = app.get(LoggingService);

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Enable CORS with security configurations
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
    ]),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Tenant-ID'],
    credentials: true,
    maxAge: 86400, // 24 hours
  });

  // Global validation pipe with comprehensive error handling
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: configService.get('NODE_ENV') === 'production',
      validateCustomDecorators: true,
      dismissDefaultMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  // Global performance interceptor
  app.useGlobalInterceptors(app.get(PerformanceInterceptor));

  // Security headers
  app.use((_req: any, res: any, next: any) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.header(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';",
    );
    next();
  });

  // Swagger API Documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Hestia Enterprise SaaS Platform API')
      .setDescription(
        `
        ## Comprehensive API Documentation for Hestia Platform

        The Hestia Enterprise SaaS Platform provides a complete solution for recipe management,
        ingredient tracking, shopping lists, and user management with enterprise-grade features.

        ### Features
        - 🔐 **Authentication & Authorization**: JWT-based auth with RBAC
        - 👥 **User Management**: Complete user lifecycle management
        - 👤 **Profile Management**: Rich user profiles with preferences
        - 🔍 **Advanced Search**: Full-text search with filtering
        - 📊 **Analytics**: Comprehensive monitoring and metrics
        - 🛡️ **Security**: Enterprise-grade security features
        - 🌍 **Multi-tenant**: Support for multiple organizations

        ### Authentication
        All protected endpoints require a valid JWT token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`

        ### Rate Limiting
        API requests are rate-limited to prevent abuse:
        - **Authenticated users**: 1000 requests per hour
        - **Anonymous users**: 100 requests per hour

        ### Error Handling
        All errors follow a consistent format with proper HTTP status codes and detailed messages.

        ### Pagination
        List endpoints support pagination with \`page\` and \`limit\` query parameters.
        Default page size is 20, maximum is 100.

        ### Filtering & Search
        Many endpoints support filtering and search parameters for efficient data retrieval.
      `,
      )
      .setVersion('1.0.0')
      .setContact('Hestia Development Team', 'https://hestia.example.com', 'dev@hestia.example.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer('http://localhost:3000', 'Development Server')
      .addServer('https://api-staging.hestia.example.com', 'Staging Server')
      .addServer('https://api.hestia.example.com', 'Production Server')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for server-to-server communication',
        },
        'API-Key',
      )
      .addTag('Authentication', 'User authentication and authorization endpoints')
      .addTag('Users', 'User management and profile operations')
      .addTag('User Profiles', 'User profile management and customization')
      .addTag('Health', 'System health and monitoring endpoints')
      .addTag('Admin', 'Administrative operations (admin only)')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
      deepScanRoutes: true,
    });

    // Customize Swagger UI
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        defaultModelRendering: 'model',
        docExpansion: 'none',
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'Hestia API Documentation',
      customfavIcon: '/favicon.ico',
    });

    loggingService.log('📚 API Documentation available at: http://localhost:3000/api/docs', {
      service: 'bootstrap',
      environment: configService.get('NODE_ENV'),
    });
  }

  // Health check endpoint
  app.use('/health', (_req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: configService.get('NODE_ENV'),
      version: process.env['npm_package_version'] || '1.0.0',
    });
  });

  // Start server
  const port = configService.get<number>('app.port', 3000);
  const host = configService.get('HOST', '0.0.0.0');

  await app.listen(port, host);

  loggingService.log(`🚀 Application is running on: http://${host}:${port}`, {
    service: 'bootstrap',
    environment: configService.get('NODE_ENV'),
    port,
    host,
  });

  loggingService.log(`🔍 Health check available at: http://${host}:${port}/health`, {
    service: 'bootstrap',
    environment: configService.get('NODE_ENV'),
  });

  // Start MSW in development mode
  await startMSWIfEnabled(configService);

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    loggingService.log('🛑 SIGTERM received, shutting down gracefully', {
      service: 'bootstrap',
    });
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    loggingService.log('🛑 SIGINT received, shutting down gracefully', {
      service: 'bootstrap',
    });
    await app.close();
    process.exit(0);
  });
};

bootstrap();
