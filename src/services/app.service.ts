import { Injectable } from '@nestjs/common';

/**
 * Application service
 * Provides core application business logic and utilities
 */
@Injectable()
export class AppService {
  /**
   * Get application greeting message
   * @returns Application greeting string
   */
  getHello(): string {
    return 'Hello World!';
  }
}
