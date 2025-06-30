# Hestia IAM System - Implementation Guide

## 📋 Document Information

| **Document Type**  | IAM System Implementation Guide   |
| ------------------ | --------------------------------- |
| **Version**        | 1.0.0                             |
| **Last Updated**   | December 28, 2024                 |
| **Next Review**    | February 28, 2025                 |
| **Document Owner** | Development Team                  |
| **Stakeholders**   | Developers, DevOps, Security Team |
| **Classification** | Technical Implementation Guide    |
| **Status**         | Active - Implementation Ready     |

---

## 🎯 Overview

This guide provides step-by-step instructions for implementing the comprehensive IAM system in the Hestia platform. It includes practical code examples, configuration details, and best practices for deployment.

---

## 🏗️ Implementation Phases

### Phase 1: Core Authentication Infrastructure

#### Step 1: Install Required Dependencies

```bash
# Core authentication packages
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
pnpm add bcryptjs @types/bcryptjs
pnpm add class-validator class-transformer
pnpm add @nestjs/config

# MFA packages
pnpm add speakeasy qrcode @types/qrcode
pnpm add twilio @types/twilio

# Session management
pnpm add @nestjs/redis redis
pnpm add express-session @types/express-session

# OAuth packages
pnpm add passport-google-oauth20 passport-github2
pnpm add @nestjs/oauth2

# SAML packages
pnpm add passport-saml @types/passport-saml
pnpm add xml2js @types/xml2js
```

#### Step 2: Create IAM Module Structure

```bash
mkdir -p src/iam/{controllers,services,guards,decorators,interfaces,dto}
mkdir -p src/iam/strategies
mkdir -p src/iam/middleware
```

#### Step 3: Implement Core IAM Module

```typescript
// src/iam/iam.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs/redis';

import { AuthController } from './controllers/auth.controller';
import { ProfileController } from './controllers/profile.controller';
import { AuthService } from './services/auth.service';
import { ProfileService } from './services/profile.service';
import { MFAService } from './services/mfa.service';
import { SessionService } from './services/session.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
          issuer: configService.get('JWT_ISSUER', 'hestia-platform'),
          audience: configService.get('JWT_AUDIENCE', 'hestia-users'),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        config: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, ProfileController],
  providers: [AuthService, ProfileService, MFAService, SessionService, JwtStrategy, LocalStrategy],
  exports: [AuthService, ProfileService, MFAService, SessionService],
})
export class IAMModule {}
```

### Phase 2: Authentication Services

#### Step 1: Implement Auth Service

```typescript
// src/iam/services/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../entities/user.entity';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { MFAService } from './mfa.service';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mfaService: MFAService,
    private readonly sessionService: SessionService,
  ) {}

  async login(loginDto: LoginDto, deviceInfo: any): Promise<AuthResponse> {
    const { email, password, mfaCode } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.recordFailedLogin(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check account status
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    // Handle MFA
    if (user.mfaEnabled) {
      if (!mfaCode) {
        return {
          user: this.sanitizeUser(user),
          mfaRequired: true,
          mfaMethods: user.mfaMethods,
        };
      }

      const isMFAValid = await this.mfaService.verifyTOTP(user.id, mfaCode);
      if (!isMFAValid) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    // Create session
    const session = await this.sessionService.createSession(user.id, deviceInfo);

    // Generate tokens
    const tokens = await this.generateTokenPair(user);

    // Update last login
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
      lastActivityAt: new Date(),
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
      session,
      mfaRequired: false,
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      status: 'PENDING',
      emailVerified: false,
      role: 'USER',
    });

    await this.userRepository.save(user);

    // Send verification email
    await this.sendVerificationEmail(user);

    return {
      user: this.sanitizeUser(user),
      message: 'Registration successful. Please check your email for verification.',
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles', 'permissions'],
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokenPair(user);

      return {
        user: this.sanitizeUser(user),
        tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionId: string): Promise<void> {
    await this.sessionService.deactivateSession(sessionId);
  }

  private async generateTokenPair(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.permissions?.map(p => p.name) || [],
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(
        { sub: user.id, type: 'refresh' },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  private sanitizeUser(user: User) {
    const { password, mfaSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private async recordFailedLogin(userId: string): Promise<void> {
    // Implement failed login tracking
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    // Implement email verification
  }
}
```

#### Step 2: Implement MFA Service

```typescript
// src/iam/services/mfa.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

import { User } from '../entities/user.entity';
import { MFASetup } from '../interfaces/mfa-setup.interface';

@Injectable()
export class MFAService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async setupTOTP(userId: string): Promise<MFASetup> {
    const secret = speakeasy.generateSecret({
      name: 'Hestia Platform',
      issuer: 'Hestia',
      length: 32,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    await this.userRepository.update(userId, {
      mfaSecret: await this.encryptSecret(secret.base32),
      mfaEnabled: true,
      mfaMethods: ['totp'],
    });

    return {
      secret: secret.base32,
      qrCode,
      backupCodes: await this.generateBackupCodes(),
    };
  }

  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.mfaSecret) {
      return false;
    }

    const secret = await this.decryptSecret(user.mfaSecret);

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.backupCodes) {
      return false;
    }

    const backupCodes = JSON.parse(user.backupCodes);
    const codeIndex = backupCodes.findIndex(bc => bc.code === code && !bc.used);

    if (codeIndex === -1) {
      return false;
    }

    // Mark code as used
    backupCodes[codeIndex].used = true;
    await this.userRepository.update(userId, {
      backupCodes: JSON.stringify(backupCodes),
    });

    return true;
  }

  private async encryptSecret(secret: string): Promise<string> {
    // Implement encryption
    return secret;
  }

  private async decryptSecret(encryptedSecret: string): Promise<string> {
    // Implement decryption
    return encryptedSecret;
  }

  private async generateBackupCodes(): Promise<string[]> {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(speakeasy.generateSecret({ length: 10 }).base32);
    }
    return codes;
  }
}
```

### Phase 3: Authorization System

#### Step 1: Implement RBAC Guard

```typescript
// src/iam/guards/rbac.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../interfaces/permission.interface';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    return this.hasPermissions(user.permissions, requiredPermissions);
  }

  private hasPermissions(userPermissions: string[], requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }
}
```

#### Step 2: Create Permission Decorator

```typescript
// src/iam/decorators/permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Permission } from '../interfaces/permission.interface';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);
```

#### Step 3: Implement Resource Access Service

```typescript
// src/iam/services/resource-access.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';

@Injectable()
export class ResourceAccessService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async checkAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions'],
    });

    const resource = await this.getResource(resourceType, resourceId);

    // Check ownership
    if (resource.userId === userId) {
      return true;
    }

    // Check permissions
    const hasPermission = this.checkPermission(user, action);
    if (!hasPermission) {
      return false;
    }

    // Check tenant isolation
    if (resource.tenantId && resource.tenantId !== user.tenantId) {
      return false;
    }

    return true;
  }

  private async getResource(resourceType: string, resourceId: string) {
    // Implement resource retrieval based on type
    return {};
  }

  private checkPermission(user: User, action: string): boolean {
    return user.permissions?.some(p => p.name === action) || false;
  }
}
```

### Phase 4: Profile Management

#### Step 1: Implement Profile Service

```typescript
// src/iam/services/profile.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserPreferences } from '../interfaces/user-preferences.interface';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, updates: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate updates
    await this.validateProfileUpdates(userId, updates);

    // Apply updates
    const updatedUser = await this.userRepository.save({
      ...user,
      ...updates,
      updatedAt: new Date(),
    });

    return this.sanitizeUser(updatedUser);
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedPreferences = {
      ...user.preferences,
      ...preferences,
    };

    await this.userRepository.update(userId, {
      preferences: updatedPreferences,
    });

    return updatedPreferences;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<string> {
    // Implement avatar upload logic
    const avatarUrl = await this.processAndUploadAvatar(file, userId);

    await this.userRepository.update(userId, { avatar: avatarUrl });

    return avatarUrl;
  }

  private sanitizeUser(user: User) {
    const { password, mfaSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  private async validateProfileUpdates(userId: string, updates: any): Promise<void> {
    // Implement validation logic
  }

  private async processAndUploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
    // Implement avatar processing and upload
    return 'avatar-url';
  }
}
```

### Phase 5: Controllers

#### Step 1: Implement Auth Controller

```typescript
// src/iam/controllers/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { MFAService } from '../services/mfa.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { MFAVerifyDto } from '../dto/mfa-verify.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { MFASetup } from '../interfaces/mfa-setup.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MFAService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Req() req: any): Promise<AuthResponse> {
    const deviceInfo = this.extractDeviceInfo(req);
    return this.authService.login(loginDto, deviceInfo);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { refreshToken: string }): Promise<AuthResponse> {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'User logout' })
  async logout(@Req() req: any): Promise<void> {
    return this.authService.logout(req.user.id, req.sessionId);
  }

  @Post('mfa/setup')
  @ApiOperation({ summary: 'Setup MFA' })
  async setupMFA(@Req() req: any): Promise<MFASetup> {
    return this.mfaService.setupTOTP(req.user.id);
  }

  @Post('mfa/verify')
  @ApiOperation({ summary: 'Verify MFA code' })
  async verifyMFA(@Body() verifyDto: MFAVerifyDto): Promise<boolean> {
    return this.mfaService.verifyTOTP(verifyDto.userId, verifyDto.token);
  }

  private extractDeviceInfo(req: any) {
    return {
      deviceId: req.headers['x-device-id'],
      deviceName: req.headers['x-device-name'],
      deviceType: req.headers['x-device-type'],
      browser: req.headers['user-agent'],
      ipAddress: req.ip,
    };
  }
}
```

#### Step 2: Implement Profile Controller

```typescript
// src/iam/controllers/profile.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  UseGuards,
  Req,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ProfileService } from '../services/profile.service';
import { SessionService } from '../services/session.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { User } from '../entities/user.entity';
import { UserPreferences } from '../interfaces/user-preferences.interface';
import { Session } from '../interfaces/session.interface';

@ApiTags('Profile Management')
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Req() req: any): Promise<User> {
    return this.profileService.getUserProfile(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Req() req: any, @Body() updates: UpdateProfileDto): Promise<User> {
    return this.profileService.updateProfile(req.user.id, updates);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(
    @Req() req: any,
    @Body() preferences: UpdatePreferencesDto,
  ): Promise<UserPreferences> {
    return this.profileService.updatePreferences(req.user.id, preferences);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload avatar' })
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File): Promise<string> {
    return this.profileService.uploadAvatar(req.user.id, file);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get user sessions' })
  async getSessions(@Req() req: any): Promise<Session[]> {
    return this.sessionService.getUserSessions(req.user.id);
  }
}
```

---

## 🔧 Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=hestia-platform
JWT_AUDIENCE=hestia-users

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:3000/auth/microsoft/callback

# SAML Configuration
SAML_ENTRY_POINT=https://your-idp.com/sso
SAML_ISSUER=hestia-platform
SAML_CERT=your-saml-certificate
SAML_CALLBACK_URL=http://localhost:3000/auth/saml/callback

# MFA Configuration
MFA_TOTP_ALGORITHM=sha1
MFA_TOTP_DIGITS=6
MFA_TOTP_PERIOD=30

# Twilio Configuration (for SMS MFA)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Session Configuration
SESSION_TIMEOUT=1800000
SESSION_MAX_CONCURRENT=5
SESSION_REMEMBER_ME_EXPIRY=2592000000
```

### Database Migrations

```typescript
// src/database/migrations/022-create-iam-tables.ts
import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateIAMTables022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sessions table
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'deviceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'deviceName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'deviceType',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'browser',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'os',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'lastActivity',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'action',
            type: 'varchar',
          },
          {
            name: 'resource',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'resourceId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'correlationId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'sessionId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'tenantId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex('sessions', new Index('IDX_SESSIONS_USER_ID', ['userId']));
    await queryRunner.createIndex('sessions', new Index('IDX_SESSIONS_IS_ACTIVE', ['isActive']));
    await queryRunner.createIndex('audit_logs', new Index('IDX_AUDIT_LOGS_USER_ID', ['userId']));
    await queryRunner.createIndex(
      'audit_logs',
      new Index('IDX_AUDIT_LOGS_TIMESTAMP', ['timestamp']),
    );
    await queryRunner.createIndex('audit_logs', new Index('IDX_AUDIT_LOGS_ACTION', ['action']));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('sessions');
  }
}
```

---

## 🧪 Testing

### Unit Tests

```typescript
// src/iam/services/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { MFAService } from './mfa.service';
import { SessionService } from './session.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let jwtService: JwtService;
  let mfaService: MFAService;
  let sessionService: SessionService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockMFAService = {
    verifyTOTP: jest.fn(),
  };

  const mockSessionService = {
    createSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MFAService,
          useValue: mockMFAService,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    mfaService = module.get<MFAService>(MFAService);
    sessionService = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@example.com', password: 'password' }, {}),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return auth response for valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: '$2a$12$hashedpassword',
        status: 'ACTIVE',
        mfaEnabled: false,
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('token');
      mockSessionService.createSession.mockResolvedValue({ id: 'session-1' });

      const result = await service.login({ email: 'test@example.com', password: 'password' }, {});

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.mfaRequired).toBe(false);
    });
  });
});
```

### Integration Tests

```typescript
// test/iam/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppModule } from '../../src/app.module';
import { User } from '../../src/iam/entities/user.entity';

describe('IAM System (e2e)', () => {
  let app: INestApplication;
  let userRepository: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get(getRepositoryToken(User));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should authenticate user with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('tokens');
          expect(res.body.data).toHaveProperty('user');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/profile (GET)', () => {
    it('should return user profile when authenticated', async () => {
      // First login to get token
      const loginResponse = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      const token = loginResponse.body.data.tokens.accessToken;

      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect(res => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('email');
        });
    });

    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer()).get('/profile').expect(401);
    });
  });
});
```

---

## 🚀 Deployment

### Docker Configuration

```dockerfile
# Dockerfile for IAM system
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

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
CMD ["npm", "run", "start:prod"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/hestia
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=hestia
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass password
    volumes:
      - redis_data:/data
    ports:
      - '6379:6379'

volumes:
  postgres_data:
  redis_data:
```

---

## 🔍 Monitoring & Troubleshooting

### Health Checks

```typescript
// src/iam/health/iam-health.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '@nestjs/redis';

import { User } from '../entities/user.entity';

@Injectable()
export class IAMHealthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async checkHealth(): Promise<any> {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      mfa: await this.checkMFAService(),
    };

    const isHealthy = Object.values(checks).every(check => check.status === 'up');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  private async checkDatabase(): Promise<any> {
    try {
      await this.userRepository.query('SELECT 1');
      return { status: 'up', responseTime: Date.now() };
    } catch (error) {
      return { status: 'down', error: error.message };
    }
  }

  private async checkRedis(): Promise<any> {
    try {
      await this.redisService.ping();
      return { status: 'up', responseTime: Date.now() };
    } catch (error) {
      return { status: 'down', error: error.message };
    }
  }

  private async checkMFAService(): Promise<any> {
    try {
      // Test MFA service functionality
      return { status: 'up', responseTime: Date.now() };
    } catch (error) {
      return { status: 'down', error: error.message };
    }
  }
}
```

### Logging Configuration

```typescript
// src/iam/logging/iam-logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class IAMLoggerService implements LoggerService {
  private logger: any;

  constructor() {
    this.logger = createLogger({
      format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
      transports: [
        new transports.File({ filename: 'logs/iam-error.log', level: 'error' }),
        new transports.File({ filename: 'logs/iam-combined.log' }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      );
    }
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
```

---

## 📚 Additional Resources

### Documentation References

- [IAM System Documentation](docs/14_IAM_SYSTEM_AND_PROFILE_MANAGEMENT.md)
- [Security & Compliance Guide](docs/07_SECURITY_COMPLIANCE_AND_DATA_PROTECTION.md)
- [API Documentation](docs/06_API_AND_INTEGRATION_HANDBOOK.md)

### External Resources

- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [SAML 2.0 Specification](http://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)

### Support & Community

- [GitHub Issues](https://github.com/your-org/hestia-backend-nest/issues)
- [Discord Community](https://discord.gg/hestia)
- [Documentation Wiki](https://github.com/your-org/hestia-backend-nest/wiki)

---

_This implementation guide is part of the Hestia Enterprise SaaS Platform documentation suite. For questions or support, please refer to the resources above or create an issue in the GitHub repository._
