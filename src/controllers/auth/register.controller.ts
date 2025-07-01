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

import { RegisterDto } from '../../dto/auth/register.dto';
import { AuthenticationService } from '../../services/authentication.service';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles user registration endpoint
 * Provides user registration functionality with profile creation
 */
@ApiTags('Authentication')
@Controller('api/v1/auth')
export class RegisterController {
  /**
   * Constructor for RegisterController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * User registration
   * @param registerDto - Registration data
   * @param req - Request object
   * @param req.requestId
   * @param req.ip
   * @param req.get
   * @returns Registration result with user and profile info
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration', description: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Validation error or email already exists' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) registerDto: RegisterDto,
    @Request() req: { requestId: string; ip: string; get(header: string): string },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    this.logRegistrationAttempt(requestId, registerDto.email, req);
    try {
      const user = await this.authenticationService.register(registerDto, requestId);
      this.logRegistrationSuccess(requestId, user.id, user.email);
      return this.createSuccessResponse(user, 'Registration successful', requestId);
    } catch (error: unknown) {
      this.logRegistrationError(requestId, registerDto.email, error);
      throw error;
    }
  }

  private logRegistrationAttempt(
    requestId: string,
    email: string,
    req: { ip: string; get(header: string): string },
  ): void {
    this.loggingService.log('Registration attempt', {
      requestId,
      email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  private logRegistrationSuccess(requestId: string, userId: string, email: string): void {
    this.loggingService.log('Registration successful', {
      requestId,
      userId,
      email,
    });
  }

  private logRegistrationError(requestId: string, email: string, error: unknown): void {
    this.loggingService.error('Registration failed', {
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
