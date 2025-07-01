import { Repository } from 'typeorm';

import { UserProfile } from '../database/entities/user-profile.entity';
import { UserProfileVisibility } from '../interfaces/enums/user.enum';
import { ProfileStatistics } from '../interfaces/repositories/user-profile-search.interface';
import { LoggingService } from '../services/logging.service';

/**
 * User profile search methods
 * Provides search functionality for user profile entities with advanced filtering and statistics
 */
export class UserProfileSearchMethods {
  /**
   * Creates a new instance of UserProfileSearchMethods
   * @param userProfileRepository - Repository for user profile operations
   * @param loggingService - Service for logging operations
   */
  constructor(
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Find profiles by completion status
   * @param isComplete - Whether profiles should be complete
   * @param page - Page number
   * @param limit - Items per page
   * @param requestId - Request identifier
   * @returns Promise resolving to profiles and total count
   */
  async getProfilesByCompletionStatus(
    isComplete: boolean,
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{ profiles: UserProfile[]; total: number }> {
    const queryBuilder = this.buildCompletionStatusQuery(isComplete);
    this.applyPaginationAndOrdering(queryBuilder, page, limit);

    const [profiles, total] = await queryBuilder.getManyAndCount();

    this.loggingService.debug('Found profiles by completion status', {
      requestId,
      isComplete,
      count: profiles.length,
      total,
    });

    return { profiles, total };
  }

  /**
   * Build query for completion status filtering
   * @param isComplete - Whether profiles should be complete
   * @returns Query builder with completion status filters
   */
  private buildCompletionStatusQuery(
    isComplete: boolean,
  ): ReturnType<typeof this.userProfileRepository.createQueryBuilder> {
    const queryBuilder = this.userProfileRepository.createQueryBuilder('profile');

    if (isComplete) {
      queryBuilder
        .where('profile.firstName IS NOT NULL')
        .andWhere('profile.lastName IS NOT NULL')
        .andWhere('profile.displayName IS NOT NULL');
    } else {
      queryBuilder
        .where('profile.firstName IS NULL')
        .orWhere('profile.lastName IS NULL')
        .orWhere('profile.displayName IS NULL');
    }

    return queryBuilder;
  }

  /**
   * Apply pagination and ordering to query builder
   * @param queryBuilder - Query builder to modify
   * @param page - Page number
   * @param limit - Items per page
   */
  private applyPaginationAndOrdering(
    queryBuilder: ReturnType<typeof this.userProfileRepository.createQueryBuilder>,
    page: number,
    limit: number,
  ): void {
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('profile.createdAt', 'DESC');
  }

  /**
   * Find profiles by date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param page - Page number
   * @param limit - Items per page
   * @param requestId - Request identifier
   * @returns Promise resolving to profiles and total count
   */
  async getProfilesByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{ profiles: UserProfile[]; total: number }> {
    const queryBuilder = this.userProfileRepository
      .createQueryBuilder('profile')
      .where('profile.createdAt >= :startDate', { startDate })
      .andWhere('profile.createdAt <= :endDate', { endDate })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('profile.createdAt', 'DESC');

    const [profiles, total] = await queryBuilder.getManyAndCount();

    this.loggingService.debug('Found profiles by date range', {
      requestId,
      startDate,
      endDate,
      count: profiles.length,
      total,
    });

    return { profiles, total };
  }

  /**
   * Get profile statistics
   * @param requestId - Request identifier
   * @returns Promise resolving to profile statistics
   */
  async getStatistics(requestId: string): Promise<ProfileStatistics> {
    const basicCounts = await this.getBasicProfileCounts();
    const completionCounts = await this.getCompletionCounts();
    const recentCount = await this.getRecentProfileCount();

    const statistics: ProfileStatistics = {
      ...basicCounts,
      ...completionCounts,
      recentProfiles: recentCount,
    };

    this.loggingService.debug('Generated profile statistics', {
      requestId,
      statistics,
    });

    return statistics;
  }

  /**
   * Get basic profile counts
   * @returns Promise resolving to basic profile counts
   */
  private async getBasicProfileCounts(): Promise<{
    totalProfiles: number;
    publicProfiles: number;
    privateProfiles: number;
  }> {
    const [totalProfiles, publicProfiles, privateProfiles] = await Promise.all([
      this.userProfileRepository.count(),
      this.userProfileRepository.count({ where: { visibility: UserProfileVisibility.PUBLIC } }),
      this.userProfileRepository.count({ where: { visibility: UserProfileVisibility.PRIVATE } }),
    ]);

    return { totalProfiles, publicProfiles, privateProfiles };
  }

  /**
   * Get completion status counts
   * @returns Promise resolving to completion status counts
   */
  private async getCompletionCounts(): Promise<{
    completeProfiles: number;
    incompleteProfiles: number;
  }> {
    const [completeProfiles, incompleteProfiles] = await Promise.all([
      this.userProfileRepository
        .createQueryBuilder('profile')
        .where('profile.firstName IS NOT NULL')
        .andWhere('profile.lastName IS NOT NULL')
        .andWhere('profile.displayName IS NOT NULL')
        .getCount(),
      this.userProfileRepository
        .createQueryBuilder('profile')
        .where('profile.firstName IS NULL')
        .orWhere('profile.lastName IS NULL')
        .orWhere('profile.displayName IS NULL')
        .getCount(),
    ]);

    return { completeProfiles, incompleteProfiles };
  }

  /**
   * Get recent profile count (last 30 days)
   * @returns Promise resolving to recent profile count
   */
  private async getRecentProfileCount(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return this.userProfileRepository
      .createQueryBuilder('profile')
      .where('profile.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();
  }
}
