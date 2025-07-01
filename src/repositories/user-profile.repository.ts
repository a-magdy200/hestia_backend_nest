import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { UserProfile } from '../database/entities/user-profile.entity';
import { IUserProfileRepository } from '../interfaces/repositories/user-profile-repository.interface';
import { ProfileSearchCriteria } from '../interfaces/repositories/user-profile-search.interface';
import { LoggingService } from '../services/logging.service';
import { UserProfileVisibility } from '../interfaces/enums/user.enum';

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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        where: { isDeleted: false },
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
      // Filter out undefined values to avoid TypeORM issues
      const filteredData: Record<string, unknown> = {};
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined) {
          filteredData[key] = value;
        }
      });

      await this.userProfileRepository.update(id, filteredData as Record<string, unknown>);
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
        error: error instanceof Error ? error.message : 'Unknown error',
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

      if (!deletedProfile) {
        throw new Error('User profile not found after deletion');
      }

      this.loggingService.debug('User profile soft deleted successfully in database', {
        requestId,
        profileId: id,
      });

      return deletedProfile;
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
      const success = (result.affected ?? 0) > 0;

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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        preferences: preferences as any,
        updatedAt: new Date(),
      });

      const updatedProfile = await this.findById(id, requestId);
      if (!updatedProfile) {
        throw new Error('User profile not found after preferences update');
      }

      this.loggingService.debug('User profile preferences updated successfully in database', {
        requestId,
        profileId: id,
      });

      return updatedProfile;
    } catch (error) {
      this.loggingService.error('Failed to update user profile preferences in database', {
        requestId,
        profileId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get profiles by completion status
   * @param isComplete - Whether to get complete or incomplete profiles
   * @param requestId - Request identifier for logging
   * @returns Array of user profiles
   */
  async getProfilesByCompletionStatus(
    isComplete: boolean,
    requestId: string,
  ): Promise<UserProfile[]> {
    this.loggingService.debug('Getting profiles by completion status', {
      requestId,
      isComplete,
    });

    try {
      const profiles = await this.userProfileRepository.find({
        where: {
          isDeleted: false,
        },
        order: { createdAt: 'DESC' },
      });

      // Inline completeness check: consider a profile complete if it has firstName, lastName, and bio
      const filteredProfiles: UserProfile[] = profiles.filter(profile => {
        const complete = Boolean(profile.firstName && profile.lastName && profile.bio);
        return complete === isComplete;
      });

      return filteredProfiles;
    } catch (error) {
      this.loggingService.error('Failed to get profiles by completion status', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
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
   * Add text search criteria
   */
  private addTextSearchCriteria(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    criteria: ProfileSearchCriteria,
  ): void {
    if (criteria.searchTerm) {
      const searchTerm = `%${criteria.searchTerm}%`;
      queryBuilder.andWhere(
        '(profile.firstName ILIKE :searchTerm OR profile.lastName ILIKE :searchTerm OR profile.displayName ILIKE :searchTerm OR profile.bio ILIKE :searchTerm)',
        { searchTerm },
      );
    }
  }

  /**
   * Add tenant criteria
   */
  private addTenantCriteria(): void {
    // Tenant filtering logic can be added here if needed
  }

  /**
   * Add avatar criteria
   */
  private addAvatarCriteria(): void {
    // Avatar filtering logic can be added here if needed
  }

  /**
   * Add bio criteria
   */
  private addBioCriteria(): void {
    // Bio filtering logic can be added here if needed
  }

  /**
   * Add location criteria
   */
  private addLocationCriteria(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    criteria: ProfileSearchCriteria,
  ): void {
    if (criteria.location) {
      queryBuilder.andWhere('profile.location ILIKE :location', {
        location: `%${criteria.location}%`,
      });
    }
  }

  /**
   * Add website criteria
   */
  private addWebsiteCriteria(): void {
    // Website filtering logic can be added here if needed
  }

  /**
   * Add boolean search criteria to query builder
   * @param queryBuilder - Query builder instance
   * @param criteria - Search criteria
   */
  private addBooleanSearchCriteria(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    criteria: ProfileSearchCriteria,
  ): void {
    this.addTenantCriteria();
    this.addAvatarCriteria();
    this.addBioCriteria();
    this.addLocationCriteria(queryBuilder, criteria);
    this.addWebsiteCriteria();
  }

  /**
   * Add date range criteria
   */
  private addDateRangeCriteria(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    criteria: ProfileSearchCriteria,
  ): void {
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
  }

  /**
   * Add sorting and pagination to query builder
   * @param queryBuilder - Query builder instance
   * @param criteria - Search criteria
   */
  private addSortingAndPagination(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    criteria: ProfileSearchCriteria,
  ): void {
    // Add sorting
    const sortField = criteria.sortBy || 'createdAt';
    const sortOrder = criteria.sortOrder || 'DESC';
    queryBuilder.orderBy(`profile.${sortField}`, sortOrder as 'ASC' | 'DESC');

    // Add pagination
    if (criteria.page && criteria.limit) {
      const offset = (criteria.page - 1) * criteria.limit;
      queryBuilder.skip(offset).take(criteria.limit);
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
    this.addTextSearchCriteria(queryBuilder, criteria);
    this.addBooleanSearchCriteria(queryBuilder, criteria);
    this.addDateRangeCriteria(queryBuilder, criteria);
    this.addSortingAndPagination(queryBuilder, criteria);

    return queryBuilder;
  }

  /**
   * Update profile by user ID
   * @param userId - User ID
   * @param profileData - Profile data to update
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated profile
   */
  async updateByUserId(
    userId: string,
    profileData: Partial<UserProfile>,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('Updating user profile by user ID in database', {
      requestId,
      userId,
      profileData,
    });

    try {
      const profile = await this.userProfileRepository.findOne({
        where: { userId, isDeleted: false },
      });

      if (!profile) {
        throw new Error(`Profile not found for user ID: ${userId}`);
      }

      Object.assign(profile, profileData);
      const updatedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('User profile updated by user ID in database', {
        requestId,
        userId,
        profileId: updatedProfile.id,
      });

      return updatedProfile;
    } catch (error) {
      this.loggingService.error('Failed to update user profile by user ID in database', {
        requestId,
        userId,
        profileData,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Delete profile by user ID (soft delete)
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to deleted profile
   */
  async deleteByUserId(userId: string, requestId: string): Promise<UserProfile> {
    this.loggingService.debug('Deleting user profile by user ID in database', {
      requestId,
      userId,
    });

    try {
      const profile = await this.userProfileRepository.findOne({
        where: { userId, isDeleted: false },
      });

      if (!profile) {
        throw new Error(`Profile not found for user ID: ${userId}`);
      }

      profile.isDeleted = true;
      profile.deletedAt = new Date();
      const deletedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('User profile deleted by user ID in database', {
        requestId,
        userId,
        profileId: deletedProfile.id,
      });

      return deletedProfile;
    } catch (error) {
      this.loggingService.error('Failed to delete user profile by user ID in database', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if profile exists for user
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if profile exists
   */
  async existsForUser(userId: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Checking if user profile exists for user in database', {
      requestId,
      userId,
    });

    try {
      const count = await this.userProfileRepository.count({
        where: { userId, isDeleted: false },
      });

      const exists = count > 0;
      this.loggingService.debug('User profile existence check completed in database', {
        requestId,
        userId,
        exists,
      });

      return exists;
    } catch (error) {
      this.loggingService.error('Failed to check user profile existence in database', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Find public profiles
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param requestId - Request ID for logging
   * @returns Promise resolving to paginated public profiles
   */
  async findPublicProfiles(
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{ profiles: UserProfile[]; total: number }> {
    this.loggingService.debug('Finding public user profiles with pagination in database', {
      requestId,
      page,
      limit,
    });

    try {
      const [profiles, total] = await this.userProfileRepository.findAndCount({
        where: { isPublicProfile: true, isDeleted: false },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      this.loggingService.debug('Public user profiles found with pagination in database', {
        requestId,
        page,
        limit,
        count: profiles.length,
        total,
      });

      return { profiles, total };
    } catch (error) {
      this.loggingService.error('Failed to find public user profiles in database', {
        requestId,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get profiles by visibility
   * @param visibility - Profile visibility level
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of profiles
   */
  async getProfilesByVisibility(
    visibility: UserProfileVisibility,
    requestId: string,
  ): Promise<UserProfile[]> {
    this.loggingService.debug('Getting profiles by visibility', {
      requestId,
      visibility,
    });

    try {
      const profiles = await this.userProfileRepository.find({
        where: {
          visibility,
          isDeleted: false,
        },
        order: { createdAt: 'DESC' },
      });

      this.loggingService.debug('Profiles by visibility retrieved', {
        requestId,
        visibility,
        count: profiles.length,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('Failed to get profiles by visibility', {
        requestId,
        visibility,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get profile statistics
   * @param requestId - Request ID for logging
   * @returns Promise resolving to profile statistics
   */
  async getStatistics(requestId: string): Promise<{
    totalProfiles: number;
    publicProfiles: number;
    privateProfiles: number;
    completeProfiles: number;
    incompleteProfiles: number;
    recentProfiles: number;
  }> {
    this.loggingService.debug('Getting user profile statistics from database', { requestId });

    try {
      const profiles = await this.userProfileRepository.find({ where: { isDeleted: false } });
      const totalProfiles = profiles.length;
      const publicProfiles = profiles.filter(p => p.isPublicProfile).length;
      const privateProfiles = profiles.filter(p => !p.isPublicProfile).length;
      const completeProfiles = profiles.filter(p => p.firstName && p.lastName && p.bio).length;
      const incompleteProfiles = totalProfiles - completeProfiles;
      const recentProfiles = profiles.filter(
        p => p.createdAt && p.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      ).length;

      const statistics = {
        totalProfiles,
        publicProfiles,
        privateProfiles,
        completeProfiles,
        incompleteProfiles,
        recentProfiles,
      };

      this.loggingService.debug('User profile statistics retrieved from database', {
        requestId,
        statistics,
      });

      return statistics;
    } catch (error) {
      this.loggingService.error('Failed to get user profile statistics from database', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Change profile visibility
   * @param userId - User ID
   * @param visibility - New visibility level
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated profile
   */
  async changeVisibility(
    userId: string,
    visibility: UserProfileVisibility,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('Changing user profile visibility in database', {
      requestId,
      userId,
      visibility,
    });

    try {
      const profile = await this.userProfileRepository.findOne({
        where: { userId, isDeleted: false },
      });

      if (!profile) {
        throw new Error(`Profile not found for user ID: ${userId}`);
      }

      profile.visibility = visibility;
      const updatedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('User profile visibility changed in database', {
        requestId,
        userId,
        profileId: updatedProfile.id,
        visibility: updatedProfile.visibility,
      });

      return updatedProfile;
    } catch (error) {
      this.loggingService.error('Failed to change user profile visibility in database', {
        requestId,
        userId,
        visibility,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Toggle public profile status
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated profile
   */
  async togglePublicProfile(userId: string, requestId: string): Promise<UserProfile> {
    this.loggingService.debug('Toggling user profile public status in database', {
      requestId,
      userId,
    });

    try {
      const profile = await this.userProfileRepository.findOne({
        where: { userId, isDeleted: false },
      });

      if (!profile) {
        throw new Error(`Profile not found for user ID: ${userId}`);
      }

      profile.isPublicProfile = !profile.isPublicProfile;
      const updatedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('User profile public status toggled in database', {
        requestId,
        userId,
        profileId: updatedProfile.id,
        isPublicProfile: updatedProfile.isPublicProfile,
      });

      return updatedProfile;
    } catch (error) {
      this.loggingService.error('Failed to toggle user profile public status in database', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Find profiles by visibility
   * @param visibility - Profile visibility level
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of profiles
   */
  async findByVisibility(
    visibility: UserProfileVisibility,
    requestId: string,
  ): Promise<UserProfile[]> {
    return this.getProfilesByVisibility(visibility, requestId);
  }
}
