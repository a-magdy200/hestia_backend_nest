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

import { CreateUserDto } from '../../dto/user/create-user.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { LoggingService } from '../../services/logging.service';
import { UserService } from '../../services/user.service';

/**
 * Handles user creation endpoint
 * Provides user creation functionality for administrators
 */
@ApiTags('User Management')
@ApiBearerAuth()
@Controller('api/v1/users')
export class CreateUserController {
  /**
   * Constructor for CreateUserController
   * @param userService - User service
   * @param loggingService - Logging service
   */
  constructor(
    private readonly userService: UserService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Create a new user
   * @param createUserDto - User creation data
   * @param req - Request object
   * @param req.requestId
   * @returns Created user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create user', description: 'Create a new user account' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) createUserDto: CreateUserDto,
    @Request() req: { requestId: string },
  ): Promise<Record<string, unknown>> {
    const requestId = req.requestId;
    this.logCreateUserAttempt(requestId, createUserDto.email);
    const user = await this.userService.createUser(createUserDto, requestId);
    this.logCreateUserSuccess(requestId, user.id, user.email);
    return this.createSuccessResponse(user, 'User created successfully', requestId);
  }

  private logCreateUserAttempt(requestId: string, email: string): void {
    this.loggingService.log('Create user attempt', { requestId, email });
  }

  private logCreateUserSuccess(requestId: string, userId: string, email: string): void {
    this.loggingService.log('User created successfully', { requestId, userId, email });
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
