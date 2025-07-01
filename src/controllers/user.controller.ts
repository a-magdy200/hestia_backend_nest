import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

import { LoggingService } from '../services/logging.service';

/**
 * User Controller
 * Handles user-related endpoints
 */
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Health check endpoint for user service
   * @param request - Express request object
   * @returns Health status
   */
  @Get('health')
  @ApiOperation({ summary: 'User service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth(
    @Request() request: ExpressRequest,
  ): Promise<{ status: string; timestamp: string }> {
    const requestId =
      (Array.isArray(request.headers['x-request-id'])
        ? request.headers['x-request-id'][0]
        : request.headers['x-request-id']) || 'unknown';
    this.loggingService.debug('User health check requested', { requestId });

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user service information
   * @param request - Express request object
   * @returns Service information
   */
  @Get('info')
  @ApiOperation({ summary: 'Get user service information' })
  @ApiResponse({ status: 200, description: 'Service information' })
  async getServiceInfo(
    @Request() request: ExpressRequest,
  ): Promise<{ version: string; features: string[] }> {
    const requestId =
      (Array.isArray(request.headers['x-request-id'])
        ? request.headers['x-request-id'][0]
        : request.headers['x-request-id']) || 'unknown';
    this.loggingService.debug('User service info requested', { requestId });

    return {
      version: '1.0.0',
      features: [
        'User Management',
        'User Search',
        'User Validation',
        'User Analytics',
        'User Export',
        'User Import',
      ],
    };
  }
}
