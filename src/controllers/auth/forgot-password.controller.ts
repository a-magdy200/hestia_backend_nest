import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ForgotPasswordDto } from '../../dto/auth/forgot-password.dto';
import { AuthenticationService } from '../../services/authentication.service';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles forgot password endpoint
 * Provides password reset request functionality
 */
@ApiTags('Authentication')
@Controller('api/v1/auth')
export class ForgotPasswordController {
  /**
   * Constructor for ForgotPasswordController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Request password reset
   * @param forgotPasswordDto - Forgot password data
   * @returns Forgot password result
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot password', description: 'Request a password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
  async forgotPassword(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<Record<string, unknown>> {
    this.loggingService.log('Forgot password attempt', { email: forgotPasswordDto.email });
    try {
      const result = await this.authenticationService.requestPasswordReset(forgotPasswordDto, '');
      this.loggingService.log('Forgot password processed', { email: forgotPasswordDto.email });
      return {
        success: true,
        data: { requested: result },
        message: 'Password reset email sent if user exists',
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      this.loggingService.error('Forgot password failed', {
        email: forgotPasswordDto.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
