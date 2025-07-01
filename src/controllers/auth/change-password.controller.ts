import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthGuard } from '../../guards/auth.guard';
import { AuthenticationService } from '../../services/authentication.service';
import { LoggingService } from '../../services/logging.service';
import { ChangePasswordDto } from '../../dto/auth/change-password.dto';

/**
 * Change Password Controller
 * Handles password change operations
 */
@ApiTags('Authentication')
@Controller('auth/change-password')
export class ChangePasswordController {
  /**
   * Constructor for ChangePasswordController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Change user password
   * @param changePasswordDto - Password change data
   * @param request - Express request object
   * @returns Success message
   */
  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() request: any,
  ): Promise<{ message: string }> {
    const requestId = request.headers['x-request-id'] || 'unknown';
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      await this.authenticationService.changePassword(userId, changePasswordDto, requestId);

      return { message: 'Password changed successfully' };
    } catch (error) {
      this.loggingService.error('Password change failed', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
