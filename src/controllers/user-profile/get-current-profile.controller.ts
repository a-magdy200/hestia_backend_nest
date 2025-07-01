import { Controller, Get, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';
import { UserProfileService } from '../../services/user-profile.service';

/**
 * Handles get current user profile endpoint
 * Provides current user profile retrieval functionality
 */
@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('api/v1/user-profiles')
export class GetCurrentProfileController {
  /**
   * Constructor for GetCurrentProfileController
   * @param userProfileService - User profile service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Get current user profile
   * @param req - Request object
   * @param req.requestId
   * @param req.user
   * @param req.user.id
   * @returns Current user profile
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Get the profile for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Current user profile returned' })
  async getCurrentUserProfile(
    @Request() req: { requestId: string; user: { id: string } },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    const userId = req.user?.id;
    this.logGetCurrentProfileAttempt(requestId, userId);
    const profile = await this.userProfileService.getProfileByUserId(userId, requestId);
    this.logGetCurrentProfileSuccess(requestId, userId);
    return this.createSuccessResponse(profile, 'Current user profile returned', requestId);
  }

  private logGetCurrentProfileAttempt(requestId: string, userId: string): void {
    this.loggingService.log('Get current profile attempt', { requestId, userId });
  }

  private logGetCurrentProfileSuccess(requestId: string, userId: string): void {
    this.loggingService.log('Get current profile successful', { requestId, userId });
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
