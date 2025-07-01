import { Controller, Post, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthenticationService } from '../../services/authentication.service';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles user logout endpoint
 * Provides logout functionality for authenticated users
 */
@ApiTags('Authentication')
@Controller('api/v1/auth')
export class LogoutController {
  /**
   * Constructor for LogoutController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Logout user
   * @param req - Request object
   * @param req.requestId
   * @param req.user
   * @param req.user.id
   * @returns Logout result
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user', description: 'Logout the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Request() req: { requestId: string; user: { id: string } },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    const userId = req.user?.id;
    this.loggingService.log('Logout attempt', { requestId, userId });
    try {
      const result = await this.authenticationService.logout(userId, requestId);
      this.loggingService.log('Logout successful', { requestId, userId });
      return {
        success: true,
        data: { loggedOut: result },
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
        requestId,
      };
    } catch (error: unknown) {
      this.loggingService.error('Logout failed', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
