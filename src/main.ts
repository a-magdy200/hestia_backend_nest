import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import { INestApplication } from '@nestjs/common';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { LoggingService } from './services/logging.service';

interface SecurityMiddlewareRequest extends Request {
  headers: Request['headers'] & {
    'x-request-id'?: string | string[];
  };
}

interface HealthCheckRequest extends Request {
  headers: Request['headers'] & {
    'x-request-id'?: string | string[];
  };
}

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
 * Configure CORS for the application
 * @param app - NestJS application instance
 * @param configService - Configuration service
 */
const configureCors = (app: INestApplication, configService: ConfigService): void => {
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
};

/**
 * Configure global pipes for validation
 * @param app - NestJS application instance
 * @param configService - Configuration service
 */
const configureGlobalPipes = (app: INestApplication, configService: ConfigService): void => {
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
};

/**
 * Configure global filters and interceptors
 * @param app - NestJS application instance
 */
const configureGlobalFilters = (app: INestApplication): void => {
  app.useGlobalFilters(app.get(GlobalExceptionFilter));
  app.useGlobalInterceptors(app.get(PerformanceInterceptor));
};

/**
 * Configure security headers middleware
 * @param app - NestJS application instance
 */
const configureSecurityHeaders = (app: INestApplication): void => {
  app.use((_req: SecurityMiddlewareRequest, res: Response, next: NextFunction) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.header('Content-Security-Policy', "default-src 'self'");
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
};

/**
 * Create Swagger document builder with basic configuration
 * @returns DocumentBuilder instance
 */
const createBasicSwaggerConfig = (): DocumentBuilder => {
  return new DocumentBuilder()
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
    .setLicense('MIT', 'https://opensource.org/licenses/MIT');
};

/**
 * Add servers to Swagger configuration
 * @param config - DocumentBuilder instance
 * @returns DocumentBuilder instance
 */
const addSwaggerServers = (config: DocumentBuilder): DocumentBuilder => {
  return config
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://api-staging.hestia.example.com', 'Staging Server')
    .addServer('https://api.hestia.example.com', 'Production Server');
};

/**
 * Add authentication to Swagger configuration
 * @param config - DocumentBuilder instance
 * @returns DocumentBuilder instance
 */
const addSwaggerAuth = (config: DocumentBuilder): DocumentBuilder => {
  return config
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
    );
};

/**
 * Add tags to Swagger configuration
 * @param config - DocumentBuilder instance
 * @returns DocumentBuilder instance
 */
const addSwaggerTags = (config: DocumentBuilder): DocumentBuilder => {
  return config
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management and profile operations')
    .addTag('User Profiles', 'User profile management and customization')
    .addTag('Health', 'System health and monitoring endpoints')
    .addTag('Admin', 'Administrative operations (admin only)');
};

/**
 * Create Swagger document builder configuration
 * @returns DocumentBuilder instance
 */
const createSwaggerConfig = (): DocumentBuilder => {
  const config = createBasicSwaggerConfig();
  const configWithServers = addSwaggerServers(config);
  const configWithAuth = addSwaggerAuth(configWithServers);
  return addSwaggerTags(configWithAuth);
};

/**
 * Configure Swagger documentation
 * @param app - NestJS application instance
 * @param configService - Configuration service
 * @param loggingService - Logging service
 */
const configureSwagger = (
  app: INestApplication,
  configService: ConfigService,
  loggingService: LoggingService,
): void => {
  if (configService.get('NODE_ENV') === 'production') {
    return;
  }

  const config = createSwaggerConfig().build();

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
};

/**
 * Configure health check endpoint
 * @param app - NestJS application instance
 * @param configService - Configuration service
 */
const configureHealthCheck = (app: INestApplication, configService: ConfigService): void => {
  app.use('/health', (_req: HealthCheckRequest, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: configService.get('NODE_ENV'),
    });
  });
};

/**
 * Start the server and log startup information
 * @param app - NestJS application instance
 * @param configService - Configuration service
 * @param loggingService - Logging service
 */
const startServer = async (
  app: INestApplication,
  configService: ConfigService,
  loggingService: LoggingService,
): Promise<void> => {
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

  // Configure application components
  configureCors(app, configService);
  configureGlobalPipes(app, configService);
  configureGlobalFilters(app);
  configureSecurityHeaders(app);
  configureSwagger(app, configService, loggingService);
  configureHealthCheck(app, configService);

  // Start server
  await startServer(app, configService, loggingService);

  // Start MSW in development mode
  await startMSWIfEnabled(configService);
};

bootstrap();
