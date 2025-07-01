import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserProfile } from '../database/entities/user-profile.entity';
import { LoggingService } from '../services/logging.service';

/**
 * User profile CRUD repository
 * Handles basic CRUD operations for user profile entities
 */
@Injectable()
export class UserProfileCrudRepository {
  /**
   * Constructor for UserProfileCrudRepository
   * @param userProfileRepository - TypeORM repository for user profiles
   * @param loggingService - Logging service for audit trails
   */
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Create new user profile
   * @param profileData - Profile data to create
   * @param requestId - Request identifier for logging
   * @returns Created user profile
   */
  async create(profileData: Partial<UserProfile>, requestId: string): Promise<UserProfile> {
    this.loggingService.debug('Creating user profile in database', { requestId, profileData });

    try {
      const profile = this.userProfileRepository.create(profileData);
      const savedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('User profile created successfully in database', {
        requestId,
        profileId: savedProfile.id,
        userId: savedProfile.userId,
      });

      return savedProfile;
    } catch (error) {
      this.loggingService.error('Failed to create user profile in database', {
        requestId,
        profileData,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Find profile by ID
   * @param id - Profile ID to find
   * @param requestId - Request identifier for logging
   * @returns User profile or null if not found
   */
  async findById(id: string, requestId: string): Promise<UserProfile | null> {
    this.loggingService.debug('Finding user profile by ID in database', {
      requestId,
      profileId: id,
    });

    try {
      const profile = await this.userProfileRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (profile) {
        this.loggingService.debug('User profile found by ID in database', {
          requestId,
          profileId: id,
        });
      } else {
        this.loggingService.debug('User profile not found by ID in database', {
          requestId,
          profileId: id,
        });
      }

      return profile;
    } catch (error) {
      this.loggingService.error('Failed to find user profile by ID in database', {
        requestId,
        profileId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Find profile by user ID
   * @param userId - User ID to find profile for
   * @param requestId - Request identifier for logging
   * @returns User profile or null if not found
   */
  async findByUserId(userId: string, requestId: string): Promise<UserProfile | null> {
    this.loggingService.debug('Finding user profile by user ID in database', { requestId, userId });

    try {
      const profile = await this.userProfileRepository.findOne({
        where: { userId, isDeleted: false },
      });

      if (profile) {
        this.loggingService.debug('User profile found by user ID in database', {
          requestId,
          userId,
          profileId: profile.id,
        });
      } else {
        this.loggingService.debug('User profile not found by user ID in database', {
          requestId,
          userId,
        });
      }

      return profile;
    } catch (error) {
      this.loggingService.error('Failed to find user profile by user ID in database', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update user profile
   * @param id - Profile ID to update
   * @param profileData - Profile data to update
   * @param requestId - Request identifier for logging
   * @returns Updated user profile
   */
  async update(
    id: string,
    profileData: Record<string, unknown>,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('Updating user profile in database', {
      requestId,
      profileId: id,
      profileData,
    });

    try {
      await this.userProfileRepository.update(id, profileData);
      const updatedProfile = await this.findById(id, requestId);

      if (!updatedProfile) {
        throw new Error('Profile not found after update');
      }

      this.loggingService.debug('User profile updated successfully in database', {
        requestId,
        profileId: id,
      });

      return updatedProfile;
    } catch (error) {
      this.loggingService.error('Failed to update user profile in database', {
        requestId,
        profileId: id,
        profileData,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Soft delete user profile
   * @param id - Profile ID to delete
   * @param requestId - Request identifier for logging
   * @returns Deleted user profile
   */
  async delete(id: string, requestId: string): Promise<UserProfile> {
    this.loggingService.debug('Soft deleting user profile in database', {
      requestId,
      profileId: id,
    });

    try {
      const profile = await this.findById(id, requestId);
      if (!profile) {
        throw new Error('Profile not found for deletion');
      }

      await this.userProfileRepository.softDelete(id);

      this.loggingService.debug('User profile soft deleted successfully in database', {
        requestId,
        profileId: id,
      });

      return profile;
    } catch (error) {
      this.loggingService.error('Failed to soft delete user profile in database', {
        requestId,
        profileId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Hard delete user profile
   * @param id - Profile ID to hard delete
   * @param requestId - Request identifier for logging
   * @returns True if deleted successfully
   */
  async hardDelete(id: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Hard deleting user profile in database', {
      requestId,
      profileId: id,
    });

    try {
      const result = await this.userProfileRepository.delete(id);
      const affected = result.affected ?? 0;

      this.loggingService.debug('User profile hard deleted successfully in database', {
        requestId,
        profileId: id,
        deleted: affected > 0,
      });

      return affected > 0;
    } catch (error) {
      this.loggingService.error('Failed to hard delete user profile in database', {
        requestId,
        profileId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
