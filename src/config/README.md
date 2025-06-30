# NestJS Configuration System

This directory contains a comprehensive configuration system for the Hestia backend application using NestJS Config Service with proper enums, type safety, and environment variable management.

## Features

- ✅ **Type-safe configuration** with TypeScript interfaces and enums
- ✅ **Environment variable validation** using envalid
- ✅ **Modular configuration** organized by domain
- ✅ **Default values** for all configuration options
- ✅ **Environment-specific** configuration loading
- ✅ **Configuration validation** and error handling
- ✅ **Easy access** through a centralized service

## Structure

```
src/config/
├── enums/
│   ├── environment.enum.ts     # Environment and feature enums
│   └── index.ts               # Enum exports
├── interfaces/
│   ├── app.config.interface.ts      # Application configuration
│   ├── auth.config.interface.ts     # Authentication configuration
│   ├── cache.config.interface.ts    # Cache configuration
│   ├── database.config.interface.ts # Database configuration
│   ├── external.config.interface.ts # External services configuration
│   └── index.ts                     # Interface exports
├── configuration.ts            # Configuration factories
├── config.service.ts          # Main configuration service
├── config.module.ts           # Configuration module
├── environment.validation.ts  # Environment validation
├── index.ts                   # Main exports
└── README.md                  # This file
```

## Quick Start

### 1. Import the Configuration Module

```typescript
import { ConfigModule } from './config';

@Module({
  imports: [ConfigModule],
  // ...
})
export class AppModule {}
```

### 2. Inject the Configuration Service

```typescript
import { Injectable } from '@nestjs/common';
import { AppConfigService } from './config';

@Injectable()
export class MyService {
  constructor(private readonly configService: AppConfigService) {}

  someMethod() {
    // Access configuration values
    const port = this.configService.port;
    const isDevelopment = this.configService.isDevelopment;
    const dbHost = this.configService.databaseHost;
  }
}
```

## Configuration Categories

### Application Configuration

```typescript
// Access application settings
const port = this.configService.port; // 3000
const environment = this.configService.environment; // Environment.DEVELOPMENT
const logLevel = this.configService.logLevel; // LogLevel.INFO
const enableSwagger = this.configService.enableSwagger; // true
```

**Environment Variables:**

- `NODE_ENV` - Environment (development, production, test, staging)
- `PORT` - Application port
- `HOST` - Application host
- `APP_NAME` - Application name
- `LOG_LEVEL` - Logging level (error, warn, info, debug, verbose)
- `ENABLE_SWAGGER` - Enable Swagger documentation
- `ENABLE_METRICS` - Enable metrics collection
- `ENABLE_CORS` - Enable CORS
- `CORS_ORIGIN` - CORS origin
- `GLOBAL_PREFIX` - API global prefix
- `TIMEOUT` - Request timeout
- `MAX_PAYLOAD_SIZE` - Maximum payload size

### Database Configuration

```typescript
// Access database settings
const dbType = this.configService.databaseType; // DatabaseType.POSTGRES
const dbHost = this.configService.databaseHost; // localhost
const dbPort = this.configService.databasePort; // 5432
const dbName = this.configService.databaseName; // hestia
const synchronize = this.configService.databaseSynchronize; // true (dev only)
```

**Environment Variables:**

- `DB_TYPE` - Database type (postgres, mysql, sqlite, mongodb)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name
- `DATABASE_URL` - Full database URL (optional)
- `DB_SSL` - Enable SSL connection
- `DB_MAX_CONNECTIONS` - Maximum connections
- `DB_CONNECTION_TIMEOUT` - Connection timeout
- `DB_ACQUIRE_TIMEOUT` - Acquire timeout
- `DB_TIMEOUT` - Query timeout
- `DB_POOL_SIZE` - Connection pool size

### Authentication Configuration

```typescript
// Access authentication settings
const authStrategy = this.configService.authStrategy; // AuthStrategy.JWT
const jwtSecret = this.configService.jwtSecret; // JWT secret key
const jwtExpiresIn = this.configService.jwtExpiresIn; // 15m
const saltRounds = this.configService.saltRounds; // 12
```

**Environment Variables:**

- `AUTH_STRATEGY` - Authentication strategy (jwt, session, api-key, oauth)
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time
- `JWT_REFRESH_EXPIRES_IN` - JWT refresh expiration time
- `SALT_ROUNDS` - Password hashing salt rounds
- `SESSION_SECRET` - Session secret (for session strategy)
- `SESSION_MAX_AGE` - Session max age
- `API_KEY_HEADER` - API key header name

### Cache Configuration

```typescript
// Access cache settings
const cacheType = this.configService.cacheType; // CacheType.MEMORY
const cacheTtl = this.configService.cacheTtl; // 3600
const cacheMaxItems = this.configService.cacheMaxItems; // 1000
```

**Environment Variables:**

- `CACHE_TYPE` - Cache type (redis, memory, none)
- `CACHE_TTL` - Cache TTL in seconds
- `CACHE_MAX_ITEMS` - Maximum cache items

**Redis-specific variables (when CACHE_TYPE=redis):**

- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `REDIS_PASSWORD` - Redis password
- `REDIS_DB` - Redis database number
- `REDIS_KEY_PREFIX` - Redis key prefix

### Rate Limiting Configuration

```typescript
// Access rate limiting settings
const rateLimitEnabled = this.configService.rateLimitEnabled; // true
const rateLimitStrategy = this.configService.rateLimitStrategy; // RateLimitStrategy.FIXED_WINDOW
const rateLimitTtl = this.configService.rateLimitTtl; // 60
const rateLimitLimit = this.configService.rateLimitLimit; // 100
```

**Environment Variables:**

- `RATE_LIMIT_ENABLED` - Enable rate limiting
- `RATE_LIMIT_STRATEGY` - Rate limiting strategy (fixed-window, sliding-window, token-bucket)
- `RATE_LIMIT_TTL` - Rate limiting TTL in seconds
- `RATE_LIMIT_LIMIT` - Rate limiting limit
- `RATE_LIMIT_SKIP_SUCCESS` - Skip successful requests
- `RATE_LIMIT_SKIP_FAILED` - Skip failed requests

### AWS Configuration

```typescript
// Access AWS settings
const awsRegion = this.configService.awsRegion; // us-east-1
const s3Bucket = this.configService.s3Bucket; // my-bucket
const s3Region = this.configService.s3Region; // us-east-1
```

**Environment Variables:**

- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key

**S3-specific variables:**

- `AWS_S3_BUCKET` - S3 bucket name
- `AWS_S3_REGION` - S3 region
- `AWS_S3_ENDPOINT` - S3 endpoint
- `AWS_S3_FORCE_PATH_STYLE` - Force path style
- `AWS_S3_SIGNATURE_VERSION` - Signature version
- `AWS_S3_MAX_FILE_SIZE` - Maximum file size
- `AWS_S3_ALLOWED_MIME_TYPES` - Allowed MIME types
- `AWS_S3_PUBLIC_URL` - Public URL

### Email Configuration

```typescript
// Access email settings
const emailProvider = this.configService.emailProvider; // aws-ses
const fromEmail = this.configService.fromEmail; // noreply@example.com
const smtpHost = this.configService.smtpHost; // smtp.example.com
```

**Environment Variables:**

- `EMAIL_PROVIDER` - Email provider (aws-ses, smtp, sendgrid, mailgun)
- `EMAIL_FROM` - From email address
- `EMAIL_REPLY_TO` - Reply-to email address

**SMTP-specific variables (when EMAIL_PROVIDER=smtp):**

- `SMTP_HOST` - SMTP host
- `SMTP_PORT` - SMTP port
- `SMTP_SECURE` - Use secure connection
- `SMTP_USERNAME` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `SMTP_FROM_NAME` - From name

## Enums

The configuration system uses several enums for type safety:

### Environment Enum

```typescript
enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
  STAGING = 'staging',
}
```

### Log Level Enum

```typescript
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}
```

### Database Type Enum

```typescript
enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  SQLITE = 'sqlite',
  MONGODB = 'mongodb',
}
```

### Cache Type Enum

```typescript
enum CacheType {
  REDIS = 'redis',
  MEMORY = 'memory',
  NONE = 'none',
}
```

### Auth Strategy Enum

```typescript
enum AuthStrategy {
  JWT = 'jwt',
  SESSION = 'session',
  API_KEY = 'api-key',
  OAUTH = 'oauth',
}
```

### Rate Limit Strategy Enum

```typescript
enum RateLimitStrategy {
  FIXED_WINDOW = 'fixed-window',
  SLIDING_WINDOW = 'sliding-window',
  TOKEN_BUCKET = 'token-bucket',
}
```

## Usage Examples

### Basic Usage

```typescript
@Injectable()
export class UserService {
  constructor(private readonly configService: AppConfigService) {}

  async createUser(userData: CreateUserDto) {
    // Use configuration in business logic
    const saltRounds = this.configService.saltRounds;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Environment-specific logic
    if (this.configService.isDevelopment) {
      console.log('Creating user in development mode');
    }

    return this.userRepository.create({ ...userData, password: hashedPassword });
  }
}
```

### Environment-Specific Configuration

```typescript
@Injectable()
export class DatabaseService {
  constructor(private readonly configService: AppConfigService) {}

  async connect() {
    const config = {
      host: this.configService.databaseHost,
      port: this.configService.databasePort,
      database: this.configService.databaseName,
    };

    // Development-specific settings
    if (this.configService.isDevelopment) {
      config.synchronize = true;
      config.logging = true;
    }

    return this.createConnection(config);
  }
}
```

### Configuration Validation

```typescript
@Injectable()
export class StartupService {
  constructor(private readonly configService: AppConfigService) {}

  async validateConfiguration() {
    const errors: string[] = [];

    // Validate required configuration
    if (
      !this.configService.jwtSecret ||
      this.configService.jwtSecret === 'your-super-secret-jwt-key'
    ) {
      errors.push('JWT_SECRET must be set to a secure value');
    }

    if (this.configService.isProduction && this.configService.databaseSynchronize) {
      errors.push('Database synchronization should be disabled in production');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }
}
```

### Full Configuration Access

```typescript
@Injectable()
export class ConfigDebugService {
  constructor(private readonly configService: AppConfigService) {}

  getConfigSummary() {
    return this.configService.getConfigSummary();
  }

  getAllConfig() {
    return this.configService.getAllConfig();
  }
}
```

## Environment Files

Create environment files in your project root:

### .env.development

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=hestia_dev
ENABLE_SWAGGER=true
ENABLE_METRICS=true
LOG_LEVEL=debug
```

### .env.production

```env
NODE_ENV=production
PORT=3000
DB_HOST=production-db-host
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=secure_password
DB_DATABASE=hestia_prod
ENABLE_SWAGGER=false
ENABLE_METRICS=true
LOG_LEVEL=info
JWT_SECRET=your-super-secure-jwt-secret
```

### .env.test

```env
NODE_ENV=test
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=hestia_test
ENABLE_SWAGGER=false
ENABLE_METRICS=false
LOG_LEVEL=error
```

## Best Practices

1. **Always use the AppConfigService** instead of accessing `process.env` directly
2. **Use enums** for type-safe configuration values
3. **Validate configuration** on application startup
4. **Use environment-specific** configuration files
5. **Never commit sensitive** configuration values to version control
6. **Use default values** for non-critical configuration
7. **Document all configuration** options in your README
8. **Test configuration** in different environments

## Troubleshooting

### Common Issues

1. **Configuration not loading**: Check that the ConfigModule is imported in your AppModule
2. **Environment variables not found**: Verify the environment file exists and variables are set
3. **Type errors**: Ensure you're using the correct enum values
4. **Validation errors**: Check the environment validation schema in `environment.validation.ts`

### Debug Configuration

```typescript
// Add this to your service to debug configuration
console.log('Config Summary:', this.configService.getConfigSummary());
console.log('All Config:', this.configService.getAllConfig());
```

## Migration from Direct Environment Access

If you're migrating from direct `process.env` access:

### Before

```typescript
const port = process.env.PORT || '3000';
const dbHost = process.env.DB_HOST || 'localhost';
```

### After

```typescript
const port = this.configService.port;
const dbHost = this.configService.databaseHost;
```

This provides type safety, validation, and centralized configuration management.
