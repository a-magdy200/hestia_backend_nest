import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { UserProfile } from '../database/entities/user-profile.entity';
import { IUserProfileRepository } from '../interfaces/repositories/user-profile-repository.interface';
import { ProfileSearchCriteria } from '../interfaces/repositories/user-profile-search.interface';
import { LoggingService } from '../services/logging.service';

/**
 * User profile repository implementation
 * Handles database operations for user profile entities with caching and error handling
 */
@Injectable()
export class UserProfileRepository implements IUserProfileRepository {
  /**
   *
   * @param userProfileRepository
   * @param loggingService
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
   * @returns Promise resolving to created user profile
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
   * @param id
   * @param requestId
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
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find profile by user ID
   * @param userId
   * @param requestId
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
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find profiles by tenant ID
   * @param tenantId
   * @param requestId
   */
  async findByTenantId(tenantId: string, requestId: string): Promise<UserProfile[]> {
    this.loggingService.debug('Finding user profiles by tenant ID in database', {
      requestId,
      tenantId,
    });

    try {
      const profiles = await this.userProfileRepository.find({
        where: { tenantId, isDeleted: false },
        order: { createdAt: 'DESC' },
      });

      this.loggingService.debug('User profiles found by tenant ID in database', {
        requestId,
        tenantId,
        count: profiles.length,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('Failed to find user profiles by tenant ID in database', {
        requestId,
        tenantId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find all profiles with pagination
   * @param page
   * @param limit
   * @param requestId
   */
  async findAll(
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{ profiles: UserProfile[]; total: number }> {
    this.loggingService.debug('Finding all user profiles with pagination in database', {
      requestId,
      page,
      limit,
    });

    try {
      const [profiles, total] = await this.userProfileRepository.findAndCount({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      this.loggingService.debug('All user profiles found with pagination in database', {
        requestId,
        page,
        limit,
        count: profiles.length,
        total,
      });

      return { profiles, total };
    } catch (error) {
      this.loggingService.error('Failed to find all user profiles in database', {
        requestId,
        page,
        limit,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Search profiles
   * @param criteria
   * @param requestId
   */
  async searchProfiles(criteria: ProfileSearchCriteria, requestId: string): Promise<UserProfile[]> {
    this.loggingService.debug('Searching user profiles in database', { requestId, criteria });

    try {
      const queryBuilder = this.createSearchQueryBuilder(criteria);
      const profiles = await queryBuilder.getMany();

      this.loggingService.debug('User profiles search completed in database', {
        requestId,
        criteria,
        count: profiles.length,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('Failed to search user profiles in database', {
        requestId,
        criteria,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update profile
   * @param id
   * @param profileData
   * @param requestId
   */
  async update(
    id: string,
    profileData: Partial<UserProfile>,
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
        throw new Error('User profile not found after update');
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
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete profile (soft delete)
   * @param id
   * @param requestId
   */
  async delete(id: string, requestId: string): Promise<UserProfile> {
    this.loggingService.debug('Soft deleting user profile in database', {
      requestId,
      profileId: id,
    });

    try {
      const profile = await this.findById(id, requestId);
      if (!profile) {
        throw new Error('User profile not found');
      }

      await this.userProfileRepository.update(id, {
        isDeleted: true,
        deletedAt: new Date(),
      });

      const deletedProfile = await this.userProfileRepository.findOne({
        where: { id },
        withDeleted: true,
      });

      this.loggingService.debug('User profile soft deleted successfully in database', {
        requestId,
        profileId: id,
      });

      return deletedProfile;
    } catch (error) {
      this.loggingService.error('Failed to soft delete user profile in database', {
        requestId,
        profileId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Hard delete profile
   * @param id
   * @param requestId
   */
  async hardDelete(id: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Hard deleting user profile in database', {
      requestId,
      profileId: id,
    });

    try {
      const result = await this.userProfileRepository.delete(id);
      const success = result.affected > 0;

      this.loggingService.debug('User profile hard delete completed in database', {
        requestId,
        profileId: id,
        success,
      });

      return success;
    } catch (error) {
      this.loggingService.error('Failed to hard delete user profile in database', {
        requestId,
        profileId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update profile avatar
   * @param id
   * @param avatarUrl
   * @param requestId
   */
  async updateAvatar(id: string, avatarUrl: string, requestId: string): Promise<UserProfile> {
    this.loggingService.debug('Updating user profile avatar in database', {
      requestId,
      profileId: id,
      avatarUrl,
    });

    try {
      await this.userProfileRepository.update(id, {
        avatarUrl,
        updatedAt: new Date(),
      });

      const profile = await this.findById(id, requestId);
      if (!profile) {
        throw new Error('User profile not found after avatar update');
      }

      this.loggingService.debug('User profile avatar updated successfully in database', {
        requestId,
        profileId: id,
      });

      return profile;
    } catch (error) {
      this.loggingService.error('Failed to update user profile avatar in database', {
        requestId,
        profileId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update profile preferences
   * @param id
   * @param preferences
   * @param requestId
   */
  async updatePreferences(
    id: string,
    preferences: Record<string, unknown>,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('Updating user profile preferences in database', {
      requestId,
      profileId: id,
      preferences,
    });

    try {
      await this.userProfileRepository.update(id, {
        preferences,
        updatedAt: new Date(),
      });

      const profile = await this.findById(id, requestId);
      if (!profile) {
        throw new Error('User profile not found after preferences update');
      }

      this.loggingService.debug('User profile preferences updated successfully in database', {
        requestId,
        profileId: id,
      });

      return profile;
    } catch (error) {
      this.loggingService.error('Failed to update user profile preferences in database', {
        requestId,
        profileId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update profile social links
   * @param id
   * @param socialLinks
   * @param requestId
   */
  async updateSocialLinks(
    id: string,
    socialLinks: Record<string, string>,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('Updating user profile social links in database', {
      requestId,
      profileId: id,
      socialLinks,
    });

    try {
      await this.userProfileRepository.update(id, {
        socialLinks,
        updatedAt: new Date(),
      });

      const profile = await this.findById(id, requestId);
      if (!profile) {
        throw new Error('User profile not found after social links update');
      }

      this.loggingService.debug('User profile social links updated successfully in database', {
        requestId,
        profileId: id,
      });

      return profile;
    } catch (error) {
      this.loggingService.error('Failed to update user profile social links in database', {
        requestId,
        profileId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get profiles by completion status
   * @param isComplete
   * @param requestId
   */
  async getProfilesByCompletionStatus(
    isComplete: boolean,
    requestId: string,
  ): Promise<UserProfile[]> {
    this.loggingService.debug('Getting user profiles by completion status in database', {
      requestId,
      isComplete,
    });

    try {
      let profiles: UserProfile[];

      if (isComplete) {
        profiles = await this.userProfileRepository
          .createQueryBuilder('profile')
          .where('profile.isDeleted = :isDeleted', { isDeleted: false })
          .andWhere('profile.firstName IS NOT NULL')
          .andWhere('profile.lastName IS NOT NULL')
          .andWhere('profile.bio IS NOT NULL')
          .andWhere('profile.location IS NOT NULL')
          .orderBy('profile.createdAt', 'DESC')
          .getMany();
      } else {
        profiles = await this.userProfileRepository
          .createQueryBuilder('profile')
          .where('profile.isDeleted = :isDeleted', { isDeleted: false })
          .andWhere(
            '(profile.firstName IS NULL OR profile.lastName IS NULL OR profile.bio IS NULL OR profile.location IS NULL)',
          )
          .orderBy('profile.createdAt', 'DESC')
          .getMany();
      }

      this.loggingService.debug('User profiles retrieved by completion status in database', {
        requestId,
        isComplete,
        count: profiles.length,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('Failed to get user profiles by completion status in database', {
        requestId,
        isComplete,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get profiles with avatars
   * @param requestId
   */
  async getProfilesWithAvatars(requestId: string): Promise<UserProfile[]> {
    this.loggingService.debug('Getting user profiles with avatars in database', { requestId });

    try {
      const profiles = await this.userProfileRepository
        .createQueryBuilder('profile')
        .where('profile.avatarUrl IS NOT NULL')
        .andWhere('profile.isDeleted = :isDeleted', { isDeleted: false })
        .orderBy('profile.createdAt', 'DESC')
        .getMany();

      this.loggingService.debug('User profiles with avatars retrieved in database', {
        requestId,
        count: profiles.length,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('Failed to get user profiles with avatars in database', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get profiles by location
   * @param location
   * @param requestId
   */
  async getProfilesByLocation(location: string, requestId: string): Promise<UserProfile[]> {
    this.loggingService.debug('Getting user profiles by location in database', {
      requestId,
      location,
    });

    try {
      const profiles = await this.userProfileRepository.find({
        where: {
          location,
          isDeleted: false,
        },
        order: { createdAt: 'DESC' },
      });

      this.loggingService.debug('User profiles by location retrieved in database', {
        requestId,
        location,
        count: profiles.length,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('Failed to get user profiles by location in database', {
        requestId,
        location,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get profiles by date range
   * @param startDate
   * @param endDate
   * @param requestId
   */
  async getProfilesByDateRange(
    startDate: Date,
    endDate: Date,
    requestId: string,
  ): Promise<UserProfile[]> {
    this.loggingService.debug('Getting user profiles by date range in database', {
      requestId,
      startDate,
      endDate,
    });

    try {
      const profiles = await this.userProfileRepository
        .createQueryBuilder('profile')
        .where('profile.createdAt >= :startDate', { startDate })
        .andWhere('profile.createdAt <= :endDate', { endDate })
        .andWhere('profile.isDeleted = :isDeleted', { isDeleted: false })
        .orderBy('profile.createdAt', 'DESC')
        .getMany();

      this.loggingService.debug('User profiles by date range retrieved in database', {
        requestId,
        startDate,
        endDate,
        count: profiles.length,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('Failed to get user profiles by date range in database', {
        requestId,
        startDate,
        endDate,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Create search query builder
   * @param criteria
   */
  private createSearchQueryBuilder(
    criteria: ProfileSearchCriteria,
  ): SelectQueryBuilder<UserProfile> {
    const queryBuilder = this.userProfileRepository
      .createQueryBuilder('profile')
      .where('profile.isDeleted = :isDeleted', { isDeleted: false });

    // Add search criteria
    if (criteria.firstName) {
      queryBuilder.andWhere('profile.firstName ILIKE :firstName', {
        firstName: `%${criteria.firstName}%`,
      });
    }

    if (criteria.lastName) {
      queryBuilder.andWhere('profile.lastName ILIKE :lastName', {
        lastName: `%${criteria.lastName}%`,
      });
    }

    if (criteria.bio) {
      queryBuilder.andWhere('profile.bio ILIKE :bio', { bio: `%${criteria.bio}%` });
    }

    if (criteria.location) {
      queryBuilder.andWhere('profile.location ILIKE :location', {
        location: `%${criteria.location}%`,
      });
    }

    if (criteria.website) {
      queryBuilder.andWhere('profile.website ILIKE :website', { website: `%${criteria.website}%` });
    }

    if (criteria.phoneNumber) {
      queryBuilder.andWhere('profile.phoneNumber ILIKE :phoneNumber', {
        phoneNumber: `%${criteria.phoneNumber}%`,
      });
    }

    if (criteria.tenantId) {
      queryBuilder.andWhere('profile.tenantId = :tenantId', { tenantId: criteria.tenantId });
    }

    if (criteria.hasAvatar !== undefined) {
      if (criteria.hasAvatar) {
        queryBuilder.andWhere('profile.avatarUrl IS NOT NULL');
      } else {
        queryBuilder.andWhere('profile.avatarUrl IS NULL');
      }
    }

    if (criteria.hasBio !== undefined) {
      if (criteria.hasBio) {
        queryBuilder.andWhere("profile.bio IS NOT NULL AND profile.bio != ''");
      } else {
        queryBuilder.andWhere("(profile.bio IS NULL OR profile.bio = '')");
      }
    }

    if (criteria.hasLocation !== undefined) {
      if (criteria.hasLocation) {
        queryBuilder.andWhere("profile.location IS NOT NULL AND profile.location != ''");
      } else {
        queryBuilder.andWhere("(profile.location IS NULL OR profile.location = '')");
      }
    }

    if (criteria.hasWebsite !== undefined) {
      if (criteria.hasWebsite) {
        queryBuilder.andWhere("profile.website IS NOT NULL AND profile.website != ''");
      } else {
        queryBuilder.andWhere("(profile.website IS NULL OR profile.website = '')");
      }
    }

    if (criteria.createdAfter) {
      queryBuilder.andWhere('profile.createdAt >= :createdAfter', {
        createdAfter: criteria.createdAfter,
      });
    }

    if (criteria.createdBefore) {
      queryBuilder.andWhere('profile.createdAt <= :createdBefore', {
        createdBefore: criteria.createdBefore,
      });
    }

    if (criteria.updatedAfter) {
      queryBuilder.andWhere('profile.updatedAt >= :updatedAfter', {
        updatedAfter: criteria.updatedAfter,
      });
    }

    if (criteria.updatedBefore) {
      queryBuilder.andWhere('profile.updatedAt <= :updatedBefore', {
        updatedBefore: criteria.updatedBefore,
      });
    }

    // Add sorting
    const sortField = criteria.sortBy || 'createdAt';
    const sortOrder = criteria.sortOrder || 'DESC';
    queryBuilder.orderBy(`profile.${sortField}`, sortOrder as 'ASC' | 'DESC');

    // Add pagination
    if (criteria.page && criteria.limit) {
      const offset = (criteria.page - 1) * criteria.limit;
      queryBuilder.skip(offset).take(criteria.limit);
    }

    return queryBuilder;
  }
}
