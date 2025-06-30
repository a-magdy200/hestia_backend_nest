import { Controller, Get } from '@nestjs/common';

import { AppService } from '../services/app.service';

/**
 * Main application controller
 * Provides core application endpoints and health checks
 */
@Controller()
export class AppController {
  /**
   * Constructor for AppController
   * @param appService - Application service for business logic
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Get hello message
   * Returns a simple greeting message for API health checks
   * @returns Hello message string
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
