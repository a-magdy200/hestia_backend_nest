import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ResetPasswordDto } from '../../dto/auth/reset-password.dto';
import { AuthenticationService } from '../../services/authentication.service';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles reset password endpoint
 * Provides password reset functionality using tokens
 */
@ApiTags('Authentication')
@Controller('api/v1/auth')
export class ResetPasswordController {
  /**
   * Constructor for ResetPasswordController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Reset user password
   * @param resetPasswordDto - Reset password data
   * @returns Reset password result
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using a valid token',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    resetPasswordDto: ResetPasswordDto,
  ): Promise<Record<string, unknown>> {
    this.loggingService.log('Reset password attempt', { token: resetPasswordDto.token });
    try {
      const result = await this.authenticationService.confirmPasswordReset(resetPasswordDto, '');
      this.loggingService.log('Password reset successful', { token: resetPasswordDto.token });
      return {
        success: true,
        data: { reset: result },
        message: 'Password reset successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      this.loggingService.error('Reset password failed', {
        token: resetPasswordDto.token,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
