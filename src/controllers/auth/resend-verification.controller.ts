import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ResendVerificationDto } from '../../dto/auth/resend-verification.dto';
import { AuthenticationService } from '../../services/authentication.service';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles resend verification endpoint
 * Provides email verification resend functionality
 */
@ApiTags('Authentication')
@Controller('api/v1/auth')
export class ResendVerificationController {
  /**
   * Constructor for ResendVerificationController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Resend email verification
   * @param resendVerificationDto - Resend verification data
   * @returns Resend verification result
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend email verification',
    description: 'Resend email verification link to user',
  })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({ status: 200, description: 'Verification email resent successfully' })
  async resendVerification(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    resendVerificationDto: ResendVerificationDto,
  ): Promise<Record<string, unknown>> {
    this.logResendVerificationAttempt(resendVerificationDto.email);
    try {
      const result = await this.authenticationService.resendEmailVerification(
        resendVerificationDto.email,
        '',
      );
      this.logResendVerificationSuccess(resendVerificationDto.email);
      return this.createSuccessResponse(
        { resent: result },
        'Verification email resent successfully',
      );
    } catch (error: unknown) {
      this.logResendVerificationError(resendVerificationDto.email, error);
      throw error;
    }
  }

  private logResendVerificationAttempt(email: string): void {
    this.loggingService.log('Resend verification attempt', { email });
  }

  private logResendVerificationSuccess(email: string): void {
    this.loggingService.log('Verification email resent successfully', { email });
  }

  private logResendVerificationError(email: string, error: unknown): void {
    this.loggingService.error('Resend verification failed', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  private createSuccessResponse(data: unknown, message: string): Record<string, unknown> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
