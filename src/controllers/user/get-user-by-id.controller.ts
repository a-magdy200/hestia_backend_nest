import { Controller, Get, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';
import { UserService } from '../../services/user.service';

/**
 * Handles get user by ID endpoint
 * Provides user retrieval functionality by user ID
 */
@ApiTags('User Management')
@ApiBearerAuth()
@Controller('api/v1/users')
export class GetUserByIdController {
  /**
   * Constructor for GetUserByIdController
   * @param userService - User service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User data
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get user by ID', description: 'Get a specific user by their ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') userId: string): Promise<Record<string, unknown>> {
    this.logGetUserByIdAttempt(userId);
    const user = await this.userService.getUserById(userId, '');
    if (!user) {
      this.logGetUserByIdNotFound(userId);
      return this.createErrorResponse('User not found', 404);
    }
    this.logGetUserByIdSuccess(userId);
    return this.createSuccessResponse(user, 'User returned successfully');
  }

  private logGetUserByIdAttempt(userId: string): void {
    this.loggingService.log('Get user by ID attempt', { userId });
  }

  private logGetUserByIdSuccess(userId: string): void {
    this.loggingService.log('Get user by ID successful', { userId });
  }

  private logGetUserByIdNotFound(userId: string): void {
    this.loggingService.warn('Get user by ID not found', { userId });
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
