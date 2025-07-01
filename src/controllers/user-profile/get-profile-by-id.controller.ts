import { Controller, Get, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';
import { UserProfileService } from '../../services/user-profile.service';

/**
 * Handles get profile by ID endpoint
 * Provides profile retrieval functionality by profile ID
 */
@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('api/v1/user-profiles')
export class GetProfileByIdController {
  /**
   * Constructor for GetProfileByIdController
   * @param userProfileService - User profile service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Get profile by ID
   * @param profileId - Profile ID
   * @returns Profile data
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get profile by ID',
    description: 'Get a specific user profile by its ID',
  })
  @ApiParam({ name: 'id', description: 'Profile ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Profile returned successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfileById(@Param('id') profileId: string): Promise<Record<string, unknown>> {
    this.logGetProfileByIdAttempt(profileId);
    const profile = await this.userProfileService.getProfileById(profileId, '');
    if (!profile) {
      this.logGetProfileByIdNotFound(profileId);
      return this.createErrorResponse('Profile not found', 404);
    }
    this.logGetProfileByIdSuccess(profileId);
    return this.createSuccessResponse(profile, 'Profile returned successfully');
  }

  private logGetProfileByIdAttempt(profileId: string): void {
    this.loggingService.log('Get profile by ID attempt', { profileId });
  }

  private logGetProfileByIdSuccess(profileId: string): void {
    this.loggingService.log('Get profile by ID successful', { profileId });
  }

  private logGetProfileByIdNotFound(profileId: string): void {
    this.loggingService.warn('Get profile by ID not found', { profileId });
  }

  private createSuccessResponse(data: unknown, message: string): Record<string, unknown> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  private createErrorResponse(message: string, status: number): Record<string, unknown> {
    return {
      success: false,
      message,
      status,
      timestamp: new Date().toISOString(),
    };
  }
}
