# Technical Architecture and Design

## 📋 Document Information

| **Document Type** | Technical Architecture and Design |
| ----------------- | --------------------------------- |
| **Version**       | 1.1.0                             |
| **Last Updated**  | December 28, 2024                 |
| **Owner**         | Backend Development Team           |
| **Status**        | Phase 1 - 90% Complete            |

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Security Architecture](#security-architecture)
7. [Performance & Scalability](#performance--scalability)
8. [Monitoring & Observability](#monitoring--observability)
9. [Deployment Architecture](#deployment-architecture)
10. [Development Workflow](#development-workflow)

## System Overview

The Hestia Platform is built as a modern, scalable, and secure enterprise SaaS application using NestJS framework with TypeScript. The system follows a modular, microservices-ready architecture that can scale from single-tenant to multi-tenant deployments.

### Core Principles

- **Modularity**: Clean separation of concerns with well-defined module boundaries
- **Scalability**: Horizontal scaling capabilities with stateless design
- **Security**: Defense-in-depth security approach with multiple layers
- **Maintainability**: Clean code practices with comprehensive testing
- **Performance**: Optimized for high throughput and low latency
- **Observability**: Comprehensive monitoring and logging

## Architecture Patterns

### Layered Architecture

**Status**: ✅ **Implemented**

The application follows a clean layered architecture:

```
┌─────────────────────────────────────┐
│           Controllers               │  ← HTTP Request/Response Layer
├─────────────────────────────────────┤
│           Services                  │  ← Business Logic Layer
├─────────────────────────────────────┤
│         Repositories                │  ← Data Access Layer
├─────────────────────────────────────┤
│           Database                  │  ← Data Persistence Layer
└─────────────────────────────────────┘
```

### Repository Pattern

**Status**: ✅ **Implemented**

```typescript
// Repository Interface
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  update(id: string, userData: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

// Repository Implementation
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
```

### Service Layer Pattern

**Status**: ✅ **Implemented**

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Business logic validation
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Password hashing
    const hashedPassword = await this.passwordService.hash(createUserDto.password);

    // Create user
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email);

    return user;
  }
}
```

### Dependency Injection

**Status**: ✅ **Implemented**

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    ConfigModule,
    EmailModule,
  ],
  providers: [
    UserService,
    UserRepository,
    PasswordService,
    EmailService,
  ],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
```

## Technology Stack

### Backend Framework

**Status**: ✅ **Implemented**

- **NestJS**: Modern Node.js framework with TypeScript support
- **TypeScript**: Strongly typed JavaScript for better development experience
- **Node.js**: Runtime environment (v18+)

### Database

**Status**: ✅ **Implemented**

- **PostgreSQL**: Primary relational database
- **TypeORM**: Object-Relational Mapping (ORM)
- **Migrations**: Database schema versioning and management

### Authentication & Authorization

**Status**: ✅ **Implemented**

- **JWT**: JSON Web Tokens for stateless authentication
- **bcrypt**: Password hashing and verification
- **Passport**: Authentication middleware
- **RBAC**: Role-Based Access Control

### Caching

**Status**: ✅ **Implemented**

- **Redis**: In-memory data structure store
- **Cache Manager**: NestJS caching abstraction

### Email Service

**Status**: ✅ **Implemented**

- **Nodemailer**: Email sending library
- **SMTP**: Simple Mail Transfer Protocol
- **Template Engine**: Dynamic email templates

### Monitoring & Logging

**Status**: ✅ **Implemented**

- **Winston**: Logging library
- **Morgan**: HTTP request logger
- **Custom Metrics**: Application-specific monitoring

### Testing

**Status**: ✅ **Implemented**

- **Jest**: Testing framework
- **Supertest**: HTTP assertion library
- **MSW**: Mock Service Worker for API mocking

## Database Design

### Entity Relationships

**Status**: ✅ **Implemented**

```typescript
// User Entity
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;
}

// User Profile Entity
@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ type: 'jsonb', nullable: true })
  address: Address;

  @Column({ type: 'jsonb', nullable: true })
  preferences: UserPreferences;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @OneToOne(() => User, user => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;
}
```

### Database Migrations

**Status**: ✅ **Implemented**

```typescript
// Migration Example
export class CreateUsersTable1703721600000 implements MigrationInterface {
  name = 'CreateUsersTable1703721600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin', 'moderator')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'user',
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
```

## API Design

### RESTful API Design

**Status**: ✅ **Implemented**

```typescript
// Controller Example
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<User>> {
    const user = await this.authService.register(registerDto);
    return {
      success: true,
      data: { user },
      message: 'User registered successfully. Please check your email for verification.',
    };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result,
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async logout(@CurrentUser() user: User): Promise<ApiResponse<void>> {
    await this.authService.logout(user.id);
    return {
      success: true,
      data: null,
      message: 'Logged out successfully',
    };
  }
}
```

### DTOs and Validation

**Status**: ✅ **Implemented**

```typescript
// DTO Example
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;
}
```

### Response Format

**Status**: ✅ **Implemented**

```typescript
// Standard API Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  timestamp: string;
  requestId: string;
}

// Error Response
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
    timestamp: string;
    requestId: string;
  };
}
```

## Security Architecture

### Authentication Flow

**Status**: ✅ **Implemented**

```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
```

### Authorization Guards

**Status**: ✅ **Implemented**

```typescript
// RBAC Guard
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role === role);
  }
}

// Usage
@Get('admin-only')
@UseGuards(AuthGuard, RbacGuard)
@Roles(UserRole.ADMIN)
async adminOnlyEndpoint() {
  return 'Admin only content';
}
```

### Password Security

**Status**: ✅ **Implemented**

```typescript
@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }
}
```

## Performance & Scalability

### Caching Strategy

**Status**: ✅ **Implemented**

```typescript
// Cache Service
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }
}

// Cached Service Method
@Injectable()
export class UserService {
  async findById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;
    
    // Try cache first
    let user = await this.cacheService.get<User>(cacheKey);
    if (user) {
      return user;
    }

    // Fetch from database
    user = await this.userRepository.findById(id);
    if (user) {
      // Cache for 1 hour
      await this.cacheService.set(cacheKey, user, 3600);
    }

    return user;
  }
}
```

### Database Optimization

**Status**: ✅ **Implemented**

```typescript
// Indexed Queries
@Entity('users')
export class User {
  @Index()
  @Column({ unique: true })
  email: string;

  @Index()
  @Column()
  role: UserRole;

  @Index()
  @Column({ default: true })
  isActive: boolean;
}

// Optimized Repository Methods
@Injectable()
export class UserRepository {
  async findByEmailWithProfile(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isEmailVerified', 'isActive'],
    });
  }

  async findActiveUsers(page: number, limit: number): Promise<[User[], number]> {
    return this.userRepository.findAndCount({
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }
}
```

## Monitoring & Observability

### Logging Strategy

**Status**: ✅ **Implemented**

```typescript
// Logger Service
@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }
}

// Request Logging Interceptor
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, userAgent } = request;
    const userAgent = request.get('User-Agent') || '';

    this.logger.log(
      `${method} ${url} ${ip} ${userAgent}`,
      'HTTP Request',
    );

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(
          `${method} ${url} ${response.statusCode} ${delay}ms`,
          'HTTP Response',
        );
      }),
    );
  }
}
```

### Performance Monitoring

**Status**: ✅ **Implemented**

```typescript
// Performance Interceptor
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        
        // Log slow requests
        if (duration > 1000) {
          this.logger.warn(
            `Slow request: ${method} ${url} took ${duration}ms`,
            'Performance',
          );
        }

        // Send metrics to monitoring service
        this.metricsService.recordRequestDuration(method, url, duration);
      }),
    );
  }
}
```

## Deployment Architecture

### Containerization

**Status**: ✅ **Implemented**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Remove dev dependencies
RUN pnpm prune --prod

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/main"]
```

### Environment Configuration

**Status**: ✅ **Implemented**

```typescript
// Configuration Service
@Injectable()
export class ConfigService {
  constructor(private configService: ConfigService) {}

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '15m');
  }

  get redisUrl(): string {
    return this.configService.get<string>('REDIS_URL');
  }

  get smtpConfig(): SmtpConfig {
    return {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    };
  }
}
```

## Development Workflow

### Code Quality

**Status**: ✅ **Implemented**

```json
// ESLint Configuration
{
  "extends": [
    "@nestjs/eslint-config",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Testing Strategy

**Status**: ✅ **Implemented**

```typescript
// Unit Test Example
describe('UserService', () => {
  let service: UserService;
  let repository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<UserRepository>(UserRepository);
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createUserDto,
        role: UserRole.USER,
        isEmailVerified: false,
        isActive: true,
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(expectedUser);

      const result = await service.createUser(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      }));
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const existingUser = { id: '123', email: 'existing@example.com' };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(existingUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
```

### CI/CD Pipeline

**Status**: 🔄 **Planned for Phase 2**

```yaml
# GitHub Actions Workflow
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Build application
        run: npm run build
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | Dec 28, 2024 | Updated implementation status, added completed components |
| 1.0.0 | Dec 20, 2024 | Initial technical architecture documentation |

## Support & Contact

For technical architecture support and questions:
- **Email**: tech-support@hestia.com
- **Documentation**: https://docs.hestia.com/architecture
- **Status Page**: https://status.hestia.com
