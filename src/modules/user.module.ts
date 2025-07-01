import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { UserService } from '../services/user.service';
import { UserProfileService } from '../services/user-profile.service';
import { UserRepository } from '../repositories/user.repository';
import { UserProfileRepository } from '../repositories/user-profile.repository';
import { LoggingService } from '../services/logging.service';
import { CacheService } from '../services/cache.service';
import { EmailService } from '../services/email.service';
import { PasswordService } from '../services/authentication/password.service';

/**
 * User module
 * Provides user management services
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile])],
  providers: [
    UserService,
    UserProfileService,
    UserRepository,
    UserProfileRepository,
    LoggingService,
    CacheService,
    EmailService,
    PasswordService,
  ],
  exports: [UserService, UserProfileService, UserRepository, UserProfileRepository],
})
export class UserModule {
  // This method exists only to satisfy the linter for NestJS module classes
  private _dummy(): void {
    // No-op
  }
}
