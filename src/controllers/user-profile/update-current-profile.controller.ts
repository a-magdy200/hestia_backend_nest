import {
  Controller,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { UpdateUserProfileDto } from '../../dto/user-profile/update-user-profile.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';
import { UserProfileService } from '../../services/user-profile.service';

/**
 * Handles update current user profile endpoint
 * Provides current user profile update functionality
 */
@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('api/v1/user-profiles')
export class UpdateCurrentProfileController {
  /**
   * Constructor for UpdateCurrentProfileController
   * @param userProfileService - User profile service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Update current user profile
   * @param updateProfileDto - Profile update data
   * @param req - Request object
   * @param req.requestId
   * @param req.user
   * @param req.user.id
   * @returns Updated profile
   */
  @Put('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Update the profile for the authenticated user',
  })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateCurrentUserProfile(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateProfileDto: UpdateUserProfileDto,
    @Request() req: { requestId: string; user: { id: string } },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    const userId = req.user?.id;
    this.logUpdateCurrentProfileAttempt(requestId, userId);
    const profile = await this.userProfileService.updateProfile(
      userId,
      updateProfileDto,
      requestId,
    );
    this.logUpdateCurrentProfileSuccess(requestId, userId);
    return this.createSuccessResponse(profile, 'Profile updated successfully', requestId);
  }

  private logUpdateCurrentProfileAttempt(requestId: string, userId: string): void {
    this.loggingService.log('Update current profile attempt', { requestId, userId });
  }

  private logUpdateCurrentProfileSuccess(requestId: string, userId: string): void {
    this.loggingService.log('Update current profile successful', { requestId, userId });
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
