import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { VerifyEmailDto } from '../../dto/auth/verify-email.dto';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles verify email endpoint
 * Provides email verification functionality using tokens
 */
@ApiTags('Authentication')
@Controller('api/v1/auth')
export class VerifyEmailController {
  /**
   * Constructor for VerifyEmailController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Verify user email
   * @param verifyEmailDto - Verify email data
   * @returns Verify email result
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email',
    description: 'Verify user email using a verification token',
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  async verifyEmail(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) verifyEmailDto: VerifyEmailDto,
  ): Promise<Record<string, unknown>> {
    this.loggingService.log('Verify email attempt', { token: verifyEmailDto.token });
    try {
      const result = await this.authenticationService.verifyEmail(verifyEmailDto.token, '');
      this.loggingService.log('Email verified successfully', { token: verifyEmailDto.token });
      return {
        success: true,
        data: { verified: result },
        message: 'Email verified successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      this.loggingService.error('Verify email failed', {
        token: verifyEmailDto.token,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
