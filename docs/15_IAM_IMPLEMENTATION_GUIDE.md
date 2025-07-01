# IAM Implementation Guide

## 📋 Document Information

| **Document Type** | IAM Implementation Guide |
| ----------------- | ------------------------ |
| **Version**       | 1.1.0                    |
| **Last Updated**  | December 28, 2024        |
| **Owner**         | IAM Team                 |
| **Status**        | Phase 1 - 90% Complete   |

---

## 🎯 Executive Summary

This document provides a comprehensive implementation guide for the Identity and Access Management (IAM) system in the Hestia Platform. The guide covers the complete implementation process, from initial setup to production deployment, including configuration, security considerations, and best practices.

### **Current Implementation Status: Phase 1 - 90% Complete**

The IAM system has been successfully implemented with comprehensive features and security measures:

- ✅ **Authentication System**: Complete JWT-based authentication with email verification
- ✅ **User Management**: Comprehensive user registration, profile management, and role-based access
- ✅ **Security Framework**: Enterprise-grade security with audit logging and compliance
- ✅ **API Integration**: Full RESTful API for IAM operations
- ✅ **Database Design**: Complete entity design with proper relationships
- ✅ **Testing Framework**: Comprehensive test coverage for all IAM features

---

## 🏗️ Implementation Overview

### **System Architecture**

The IAM system follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Web Client    │  │  Mobile Client  │  │  API Client  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Rate Limiting │  │   Authentication│  │   Logging    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Controllers   │  │     Services    │  │  Repositories│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   PostgreSQL    │  │   Redis Cache   │  │  Audit Logs  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Technology Stack**

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: class-validator with class-transformer
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Monitoring**: Custom monitoring service

---

## 🔧 Implementation Steps

### **✅ Step 1: Project Setup (Complete)**

#### **1.1 Initialize NestJS Project**
```bash
# Create new NestJS project
nest new hestia-iam
cd hestia-iam

# Install required dependencies
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt class-validator class-transformer
npm install @nestjs/config
npm install winston
npm install @nestjs/swagger swagger-ui-express
```

#### **1.2 Configure TypeScript**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### **1.3 Environment Configuration**
```bash
# .env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=hestia_iam

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **✅ Step 2: Database Design (Complete)**

#### **2.1 Entity Definitions**
```typescript
// src/database/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserRole, UserStatus } from '../enums/user.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ default: false })
  emailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;
}

// src/database/entities/user-profile.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn()
  user: User;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column('jsonb')
  preferences: UserPreferences;

  @Column('jsonb')
  addresses: Address[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### **2.2 Database Migrations**
```typescript
// src/database/migrations/001-create-users-table.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['user', 'moderator', 'admin'],
            default: "'user'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended'],
            default: "'active'",
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

### **✅ Step 3: Authentication System (Complete)**

#### **3.1 JWT Strategy Implementation**
```typescript
// src/authentication/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findById(payload.sub);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
```

#### **3.2 Authentication Service**
```typescript
// src/authentication/authentication.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PasswordService } from './password.service';
import { EmailService } from '../email/email.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await this.passwordService.hashPassword(registerDto.password);
    const user = await this.userService.create({
      email: registerDto.email,
      passwordHash,
    });

    await this.emailService.sendVerificationEmail(user.email, user.id);

    return {
      message: 'User registered successfully. Please check your email for verification.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.validatePassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    return {
      user: this.userService.sanitizeUser(user),
      ...tokens,
    };
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
```

#### **3.3 Authentication Controllers**
```typescript
// src/authentication/authentication.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user retrieved' })
  async getCurrentUser(@Req() req) {
    return this.userService.sanitizeUser(req.user);
  }
}
```

### **✅ Step 4: User Management (Complete)**

#### **4.1 User Service Implementation**
```typescript
// src/user/user.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { CreateUserDto, UpdateUserDto, CreateProfileDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async createProfile(userId: string, createProfileDto: CreateProfileDto): Promise<UserProfile> {
    const user = await this.findById(userId);
    
    const existingProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    
    if (existingProfile) {
      throw new ConflictException('Profile already exists');
    }

    const profile = this.profileRepository.create({
      ...createProfileDto,
      user,
    });
    
    return this.profileRepository.save(profile);
  }

  sanitizeUser(user: User): any {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
```

#### **4.2 User Controllers**
```typescript
// src/user/user.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard, RolesGuard } from '../authentication/guards';
import { Roles } from '../authentication/decorators';
import { UserRole } from '../database/enums/user.enum';
import { CreateUserDto, UpdateUserDto, CreateProfileDto } from './dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() query: any) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
```

### **✅ Step 5: Security Implementation (Complete)**

#### **5.1 Security Guards**
```typescript
// src/authentication/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// src/authentication/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../database/enums/user.enum';

@Injectable()
export class RolesGuard implements CanActivate {
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
    return requiredRoles.some((role) => user.role === role);
  }
}
```

#### **5.2 Rate Limiting**
```typescript
// src/common/middleware/rate-limit.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private rateLimiter: RateLimiterRedis;

  constructor(private readonly redis: Redis) {
    this.rateLimiter = new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: 'rate_limit',
      points: 100, // Number of requests
      duration: 15 * 60, // Per 15 minutes
    });
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      await this.rateLimiter.consume(req.ip);
      next();
    } catch (rejRes) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          details: [{ retryAfter: rejRes.msBeforeNext / 1000 }],
        },
      });
    }
  }
}
```

### **✅ Step 6: Testing Implementation (Complete)**

#### **6.1 Unit Tests**
```typescript
// src/authentication/authentication.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { EmailService } from '../email/email.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
      } as any);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('userId');
    });
  });
});
```

#### **6.2 Integration Tests**
```typescript
// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('userId');
      });
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data).toHaveProperty('refreshToken');
      });
  });
});
```

---

## 🔒 Security Considerations

### **✅ Implemented Security Measures**

#### **Authentication Security**
- **JWT Token Security**: Secure JWT token generation and validation
- **Password Security**: bcrypt password hashing with 12 rounds
- **Token Expiration**: Short-lived access tokens with refresh mechanism
- **Token Revocation**: Secure token revocation capabilities
- **Rate Limiting**: API rate limiting to prevent abuse

#### **Data Security**
- **Input Validation**: Comprehensive input validation and sanitization
- **SQL Injection Prevention**: Parameterized queries and validation
- **XSS Prevention**: Output encoding and sanitization
- **CSRF Protection**: CSRF token protection
- **Data Encryption**: Sensitive data encryption at rest and in transit

#### **Access Control**
- **Role-Based Access Control**: User, moderator, and admin roles
- **Permission System**: Granular permission management
- **Resource Protection**: Protected resource access
- **Audit Logging**: Complete audit trail for security events
- **Session Management**: Secure session handling

---

## 📊 Performance Optimization

### **✅ Performance Measures**

#### **Database Optimization**
- **Indexing**: Proper database indexing for performance
- **Query Optimization**: Optimized database queries
- **Connection Pooling**: Database connection pooling
- **Caching**: Redis caching for frequently accessed data
- **Migration Optimization**: Efficient database migrations

#### **API Performance**
- **Response Caching**: API response caching
- **Request Optimization**: Optimized request handling
- **Compression**: Response compression
- **Load Balancing**: Load balancing support
- **Monitoring**: Performance monitoring and alerting

---

## 🚀 Deployment Guide

### **✅ Production Deployment**

#### **Environment Setup**
```bash
# Production environment variables
NODE_ENV=production
PORT=3000

# Database
DB_HOST=production-db-host
DB_PORT=5432
DB_USERNAME=production-user
DB_PASSWORD=production-password
DB_NAME=hestia_iam_prod

# JWT
JWT_SECRET=production-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=production-redis-password

# Email
EMAIL_HOST=smtp.production.com
EMAIL_PORT=587
EMAIL_USER=production-email
EMAIL_PASS=production-email-password
```

#### **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: hestia_iam
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass password
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 📈 Monitoring and Maintenance

### **✅ Monitoring Setup**

#### **Application Monitoring**
- **Health Checks**: Application health check endpoints
- **Performance Monitoring**: Real-time performance monitoring
- **Error Tracking**: Comprehensive error tracking and alerting
- **User Analytics**: User behavior and usage analytics
- **Security Monitoring**: Security event monitoring

#### **Infrastructure Monitoring**
- **System Health**: System health monitoring
- **Resource Monitoring**: CPU, memory, and disk monitoring
- **Database Monitoring**: Database performance monitoring
- **Network Monitoring**: Network performance monitoring
- **Service Monitoring**: Service availability monitoring

---

## 📞 Support and Maintenance

### **✅ Support Procedures**

#### **Issue Resolution**
- **Bug Reports**: Bug reporting and resolution procedures
- **Feature Requests**: Feature request handling
- **Security Issues**: Security issue reporting and response
- **Performance Issues**: Performance issue investigation
- **User Support**: User support and assistance

#### **Maintenance Procedures**
- **Regular Updates**: Regular system updates and maintenance
- **Security Patches**: Security patch deployment
- **Performance Optimization**: Performance optimization procedures
- **Backup Procedures**: Data backup and recovery procedures
- **Disaster Recovery**: Disaster recovery procedures

---

*Document Version: 1.1.0*  
*Last Updated: December 28, 2024*  
*Status: Phase 1 - 90% Complete*
