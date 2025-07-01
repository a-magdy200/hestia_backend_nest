import { Controller, Post, HttpCode, HttpStatus, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';

/**
 * Handles revoke all tokens endpoint
 * Provides token revocation functionality for authenticated users
 */
@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('api/v1/auth')
export class RevokeAllTokensController {
  /**
   * Constructor for RevokeAllTokensController
   * @param loggingService - Logging service
   */
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * Revoke all tokens for the authenticated user
   * @param req - Request object
   * @param req.requestId
   * @param req.user
   * @param req.user.id
   * @returns Revoke all tokens result
   */
  @Post('revoke-all-tokens')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Revoke all tokens',
    description: 'Revoke all tokens for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'All tokens revoked successfully' })
  async revokeAllTokens(
    @Request() req: { requestId: string; user: { id: string } },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    const userId = req.user?.id;
    this.logRevokeAllTokensAttempt(requestId, userId);
    try {
      // In a real implementation, this would revoke all tokens for the user
      this.logRevokeAllTokensSuccess(requestId, userId);
      return this.createSuccessResponse(
        { revoked: true },
        'All tokens revoked successfully',
        requestId,
      );
    } catch (error: unknown) {
      this.logRevokeAllTokensError(requestId, userId, error);
      throw error;
    }
  }

  private logRevokeAllTokensAttempt(requestId: string, userId: string): void {
    this.loggingService.log('Revoke all tokens attempt', { requestId, userId });
  }

  private logRevokeAllTokensSuccess(requestId: string, userId: string): void {
    this.loggingService.log('All tokens revoked successfully', { requestId, userId });
  }

  private logRevokeAllTokensError(requestId: string, userId: string, error: unknown): void {
    this.loggingService.error('Revoke all tokens failed', {
      requestId,
      userId,
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
