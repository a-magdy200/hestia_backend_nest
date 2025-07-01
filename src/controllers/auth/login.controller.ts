import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { LoginDto } from '../../dto/auth/login.dto';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles user login endpoint
 * Provides authentication functionality for user login
 */
@ApiTags('Authentication')
@Controller('api/v1/auth')
export class LoginController {
  /**
   * Constructor for LoginController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * User login
   * @param loginDto - Login credentials
   * @param req - Request object
   * @param req.requestId
   * @param req.ip
   * @param req.get
   * @returns Login result with tokens and user info
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'Authenticate user with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid credentials or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) loginDto: LoginDto,
    @Request() req: { requestId: string; ip: string; get(header: string): string },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    this.logLoginAttempt(requestId, loginDto.email, req);
    try {
      const result = await this.authenticationService.authenticate(loginDto, requestId);
      this.logLoginSuccess(requestId, result.user.id, result.user.email);
      return this.createSuccessResponse(result, 'Login successful', requestId);
    } catch (error: unknown) {
      this.logLoginError(requestId, loginDto.email, error);
      throw error;
    }
  }

  private logLoginAttempt(
    requestId: string,
    email: string,
    req: { ip: string; get(header: string): string },
  ): void {
    this.loggingService.log('Login attempt', {
      requestId,
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  private logLoginSuccess(requestId: string, userId: string, email: string): void {
    this.loggingService.log('Login successful', {
      requestId,
      userId,
      email,
    });
  }

  private logLoginError(requestId: string, email: string, error: unknown): void {
    this.loggingService.error('Login failed', {
      requestId,
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  private createSuccessResponse(
    data: unknown,
    message: string,
    requestId: string,
  ): Record<string, unknown> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId,
    };
  }
}
