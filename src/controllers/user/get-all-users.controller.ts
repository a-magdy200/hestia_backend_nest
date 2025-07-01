import { Controller, Get, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';
import { UserService } from '../../services/user.service';

/**
 * Handles get all users endpoint
 * Provides user listing functionality for administrators
 */
@ApiTags('User Management')
@ApiBearerAuth()
@Controller('api/v1/users')
export class GetAllUsersController {
  /**
   * Constructor for GetAllUsersController
   * @param userService - User service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Get all users
   * @param query - Query parameters
   * @param query.page
   * @param query.limit
   * @param query.sortBy
   * @param query.sortOrder
   * @returns All users with pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Get all users with pagination and filtering',
  })
  @ApiResponse({ status: 200, description: 'All users returned' })
  async getAllUsers(
    @Query() query: { page?: string; limit?: string; sortBy?: string; sortOrder?: string },
  ): Promise<Record<string, unknown>> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = (query.sortOrder || 'DESC') as 'ASC' | 'DESC';
    this.logGetAllUsersAttempt(page, limit, sortBy, sortOrder);
    const result = await this.userService.searchUsers({ page, limit, sortBy, sortOrder }, '');
    this.logGetAllUsersSuccess(result.users.length);
    return this.createSuccessResponse(
      { users: result.users, total: result.total },
      'All users returned',
    );
  }

  private logGetAllUsersAttempt(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ): void {
    this.loggingService.log('Get all users attempt', { page, limit, sortBy, sortOrder });
  }

  private logGetAllUsersSuccess(userCount: number): void {
    this.loggingService.log('Get all users successful', { userCount });
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
