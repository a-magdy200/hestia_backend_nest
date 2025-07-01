import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { RefreshTokenDto } from '../../dto/auth/refresh-token.dto';
import { AuthenticationService } from '../../services/authentication.service';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles refresh token endpoint
 * Provides token refresh functionality for authenticated users
 */
@ApiTags('Authentication')
@Controller('api/v1/auth')
export class RefreshTokenController {
  /**
   * Constructor for RefreshTokenController
   * @param authenticationService - Authentication service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Refresh access token
   * @param refreshTokenDto - Refresh token data
   * @param req - Request object
   * @param req.requestId
   * @returns New access and refresh tokens
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Obtain new access and refresh tokens using a valid refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refresh successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired refresh token' })
  async refreshToken(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    refreshTokenDto: RefreshTokenDto,
    @Request() req: { requestId: string },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    this.logRefreshTokenAttempt(requestId);
    try {
      const result = await this.authenticationService.refreshToken(
        refreshTokenDto.refreshToken,
        requestId,
      );
      this.logRefreshTokenSuccess(requestId, result.user.id);
      return this.createSuccessResponse(result, 'Token refresh successful', requestId);
    } catch (error: unknown) {
      this.logRefreshTokenError(requestId, error);
      throw error;
    }
  }

  private logRefreshTokenAttempt(requestId: string): void {
    this.loggingService.log('Token refresh attempt', { requestId });
  }

  private logRefreshTokenSuccess(requestId: string, userId: string): void {
    this.loggingService.log('Token refresh successful', { requestId, userId });
  }

  private logRefreshTokenError(requestId: string, error: unknown): void {
    this.loggingService.error('Token refresh failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
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
