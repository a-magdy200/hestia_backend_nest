import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';

import { LoggingService } from '../services/logging.service';

/**
 * Authentication Controller
 * Handles authentication-related endpoints
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Health check endpoint for authentication service
   * @param request - Express request object
   * @returns Health status
   */
  @Get('health')
  @ApiOperation({ summary: 'Authentication service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth(
    @Request() request: ExpressRequest,
  ): Promise<{ status: string; timestamp: string }> {
    const requestId =
      (Array.isArray(request.headers['x-request-id'])
        ? request.headers['x-request-id'][0]
        : request.headers['x-request-id']) || 'unknown';
    this.loggingService.debug('Authentication health check requested', { requestId });

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get authentication service information
   * @param request - Express request object
   * @returns Service information
   */
  @Get('info')
  @ApiOperation({ summary: 'Get authentication service information' })
  @ApiResponse({ status: 200, description: 'Service information' })
  async getServiceInfo(
    @Request() request: ExpressRequest,
  ): Promise<{ version: string; features: string[] }> {
    const requestId =
      (Array.isArray(request.headers['x-request-id'])
        ? request.headers['x-request-id'][0]
        : request.headers['x-request-id']) || 'unknown';
    this.loggingService.debug('Authentication service info requested', { requestId });

    return {
      version: '1.0.0',
      features: [
        'JWT Authentication',
        'Role-based Access Control',
        'Password Reset',
        'Email Verification',
        'Account Locking',
        'Session Management',
      ],
    };
  }
}
