import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

import { CreateUserProfileDto } from '../../dto/user-profile/create-user-profile.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';
import { UserProfileService } from '../../services/user-profile.service';

/**
 * Handles user profile creation endpoint
 * Provides profile creation functionality for authenticated users
 */
@ApiTags('User Profile')
@ApiBearerAuth()
@Controller('api/v1/user-profiles')
export class CreateProfileController {
  /**
   * Constructor for CreateProfileController
   * @param userProfileService - User profile service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Create user profile
   * @param createProfileDto - Profile creation data
   * @param req - Request object
   * @param req.requestId
   * @param req.user
   * @param req.user.id
   * @returns Created profile
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Create user profile',
    description: 'Create a new user profile for the authenticated user',
  })
  @ApiBody({ type: CreateUserProfileDto })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  async createProfile(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createProfileDto: CreateUserProfileDto,
    @Request() req: { requestId: string; user: { id: string } },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    const userId = req.user?.id;
    this.logCreateProfileAttempt(requestId, userId);
    const profile = await this.userProfileService.createProfile(
      userId,
      createProfileDto,
      requestId,
    );
    this.logCreateProfileSuccess(requestId, userId, profile.id);
    return this.createSuccessResponse(profile, 'Profile created successfully', requestId);
  }

  private logCreateProfileAttempt(requestId: string, userId: string): void {
    this.loggingService.log('Create profile attempt', { requestId, userId });
  }

  private logCreateProfileSuccess(requestId: string, userId: string, profileId: string): void {
    this.loggingService.log('Profile created successfully', { requestId, userId, profileId });
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
