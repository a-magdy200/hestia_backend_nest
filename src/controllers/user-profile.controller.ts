import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

import { LoggingService } from '../services/logging.service';

/**
 * User Profile Controller
 * Handles user profile-related endpoints
 */
@ApiTags('User Profile')
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Health check endpoint for user profile service
   * @param request - Express request object
   * @returns Health status
   */
  @Get('health')
  @ApiOperation({ summary: 'User profile service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth(
    @Request() request: ExpressRequest,
  ): Promise<{ status: string; timestamp: string }> {
    const requestId =
      (Array.isArray(request.headers['x-request-id'])
        ? request.headers['x-request-id'][0]
        : request.headers['x-request-id']) || 'unknown';
    this.loggingService.debug('User profile health check requested', { requestId });

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user profile service information
   * @param request - Express request object
   * @returns Service information
   */
  @Get('info')
  @ApiOperation({ summary: 'Get user profile service information' })
  @ApiResponse({ status: 200, description: 'Service information' })
  async getServiceInfo(
    @Request() request: ExpressRequest,
  ): Promise<{ version: string; features: string[] }> {
    const requestId =
      (Array.isArray(request.headers['x-request-id'])
        ? request.headers['x-request-id'][0]
        : request.headers['x-request-id']) || 'unknown';
    this.loggingService.debug('User profile service info requested', { requestId });

    return {
      version: '1.0.0',
      features: [
        'Profile Management',
        'Profile Search',
        'Profile Validation',
        'Profile Analytics',
        'Profile Export',
        'Profile Import',
      ],
    };
  }
}
