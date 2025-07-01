import { Controller, Get, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ProfileSearchDto } from '../../dto/user/profile-search.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';
import { UserProfileService } from '../../services/user-profile.service';

/**
 * Handles search profiles endpoint
 * Provides profile search functionality with various filters
 */
@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('api/v1/user-profiles')
export class SearchProfilesController {
  /**
   * Constructor for SearchProfilesController
   * @param userProfileService - User profile service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Search user profiles
   * @param searchDto - Search criteria
   * @returns Matching profiles
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Search profiles',
    description: 'Search user profiles with various filters',
  })
  @ApiResponse({ status: 200, description: 'Search results returned' })
  async searchProfiles(@Query() searchDto: ProfileSearchDto): Promise<Record<string, unknown>> {
    this.logSearchProfilesAttempt(searchDto);
    const profiles = await this.userProfileService.searchProfiles(searchDto, '');
    this.logSearchProfilesSuccess(profiles.length);
    return this.createSuccessResponse(
      { profiles, total: profiles.length },
      'Search results returned',
    );
  }

  private logSearchProfilesAttempt(searchDto: ProfileSearchDto): void {
    this.loggingService.log('Search profiles attempt', { searchCriteria: searchDto });
  }

  private logSearchProfilesSuccess(resultCount: number): void {
    this.loggingService.log('Search profiles successful', { resultCount });
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
