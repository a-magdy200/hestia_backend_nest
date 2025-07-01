import { Controller, Get, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthGuard } from '../../guards/auth.guard';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles get current user endpoint
 * Provides current user information for authenticated users
 */
@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('api/v1/auth')
export class GetCurrentUserController {
  /**
   * Constructor for GetCurrentUserController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Get current authenticated user
   * @param req - Request object
   * @param req.requestId
   * @param req.user
   * @param req.user.id
   * @returns Current user info
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get the currently authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Current user info returned' })
  async getCurrentUser(
    @Request() req: { requestId: string; user: { id: string } },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    const userId = req.user?.id;
    this.logGetCurrentUserAttempt(requestId, userId);
    try {
      const user = await this.authenticationService.getUserFromToken(req.user.id, requestId);
      this.logGetCurrentUserSuccess(requestId, userId);
      return this.createSuccessResponse(user, 'Current user info returned', requestId);
    } catch (error: unknown) {
      this.logGetCurrentUserError(requestId, userId, error);
      throw error;
    }
  }

  private logGetCurrentUserAttempt(requestId: string, userId: string): void {
    this.loggingService.log('Get current user attempt', { requestId, userId });
  }

  private logGetCurrentUserSuccess(requestId: string, userId: string): void {
    this.loggingService.log('Get current user successful', { requestId, userId });
  }

  private logGetCurrentUserError(requestId: string, userId: string, error: unknown): void {
    this.loggingService.error('Get current user failed', {
      requestId,
      userId,
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
