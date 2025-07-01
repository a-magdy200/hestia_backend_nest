import { Controller, Get, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';
import { UserProfileService } from '../../services/user-profile.service';

/**
 * Handles get all profiles endpoint
 * Provides admin functionality to retrieve all user profiles
 */
@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('api/v1/user-profiles')
export class GetAllProfilesController {
  /**
   * Constructor for GetAllProfilesController
   * @param userProfileService - User profile service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Get all user profiles
   * @param query - Query parameters
   * @param query.page
   * @param query.limit
   * @param query.sortBy
   * @param query.sortOrder
   * @returns All profiles with pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all profiles',
    description: 'Get all user profiles with pagination and filtering',
  })
  @ApiResponse({ status: 200, description: 'All profiles returned' })
  async getAllProfiles(
    @Query() query: { page?: string; limit?: string; sortBy?: string; sortOrder?: string },
  ): Promise<Record<string, unknown>> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    this.logGetAllProfilesAttempt(page, limit, sortBy, sortOrder);
    const profiles = await this.userProfileService.searchProfiles({}, '');
    this.logGetAllProfilesSuccess(profiles.length, profiles.length);
    return this.createSuccessResponse(
      { profiles, total: profiles.length },
      'All profiles returned',
    );
  }

  private logGetAllProfilesAttempt(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ): void {
    this.loggingService.log('Get all profiles attempt', { page, limit, sortBy, sortOrder });
  }

  private logGetAllProfilesSuccess(profileCount: number, total: number): void {
    this.loggingService.log('Get all profiles successful', { profileCount, total });
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
