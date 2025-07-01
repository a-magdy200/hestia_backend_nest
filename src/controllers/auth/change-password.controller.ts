import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

import { AuthGuard } from '../../guards/auth.guard';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { LoggingService } from '../../services/logging.service';
import { ChangePasswordDto } from '../../dto/auth/change-password.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

/**
 * Controller for handling password change operations
 * Provides secure password change functionality for authenticated users
 */
@ApiTags('Authentication')
@Controller('auth')
export class ChangePasswordController {
  /**
   * Constructor for ChangePasswordController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Log password change request
   * @param userId - User ID
   * @param requestId - Request ID
   */
  private logPasswordChangeRequest(userId: string, requestId: string): void {
    this.loggingService.log('Password change request initiated', {
      service: 'ChangePasswordController',
      method: 'changePassword',
      userId,
      requestId,
    });
  }

  /**
   * Log password change success
   * @param userId - User ID
   * @param requestId - Request ID
   */
  private logPasswordChangeSuccess(userId: string, requestId: string): void {
    this.loggingService.log('Password changed successfully', {
      service: 'ChangePasswordController',
      method: 'changePassword',
      userId,
      requestId,
    });
  }

  /**
   * Change user password
   * Allows authenticated users to change their password securely
   */
  @Post('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change user password',
    description: 'Allows authenticated users to change their password securely',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Password changed successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or password requirements not met',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid current password or user not authenticated',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    const requestId =
      (Array.isArray(request.headers['x-request-id'])
        ? request.headers['x-request-id'][0]
        : request.headers['x-request-id']) || 'unknown';
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    this.logPasswordChangeRequest(userId, requestId);
    await this.authenticationService.changePassword(userId, changePasswordDto, requestId);
    this.logPasswordChangeSuccess(userId, requestId);

    return { message: 'Password changed successfully' };
  }
}
