import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { UserProfile } from '../database/entities/user-profile.entity';
import { UserProfileVisibility } from '../interfaces/enums/user.enum';
import {
  ProfileSearchCriteria,
  ProfileStatistics,
} from '../interfaces/repositories/user-profile-search.interface';
import { LoggingService } from '../services/logging.service';

import { UserProfileSearchMethods } from './user-profile-search-methods.repository';

/**
 * User profile search repository implementation
 * Provides search and query operations for user profile entities with advanced filtering capabilities
 */
@Injectable()
export class UserProfileSearchRepository {
  private readonly searchMethods: UserProfileSearchMethods;

  /**
   * Creates a new instance of UserProfileSearchRepository
   * @param userProfileRepository - Repository for user profile operations
   * @param loggingService - Service for logging operations
   */
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly loggingService: LoggingService,
  ) {
    this.searchMethods = new UserProfileSearchMethods(userProfileRepository, loggingService);
  }

  /**
   * Find public profiles with pagination
   * @param page - Page number
   * @param limit - Items per page
   * @param requestId - Request identifier
   * @returns Promise resolving to profiles and total count
   */
  async findPublicProfiles(
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{ profiles: UserProfile[]; total: number }> {
    const queryBuilder = this.userProfileRepository
      .createQueryBuilder('profile')
      .where('profile.visibility = :visibility', { visibility: UserProfileVisibility.PUBLIC })
      .andWhere('profile.isPublicProfile = :isPublic', { isPublic: true })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('profile.createdAt', 'DESC');

    const [profiles, total] = await queryBuilder.getManyAndCount();

    this.loggingService.debug('Found public profiles', {
      requestId,
      count: profiles.length,
      total,
    });

    return { profiles, total };
  }

  /**
   * Find profiles by visibility
   * @param visibility - Profile visibility
   * @param requestId - Request identifier
   * @returns Promise resolving to array of profiles
   */
  async findByVisibility(
    visibility: UserProfileVisibility,
    requestId: string,
  ): Promise<UserProfile[]> {
    const profiles = await this.userProfileRepository.find({
      where: { visibility },
      order: { createdAt: 'DESC' },
    });

    this.loggingService.debug('Found profiles by visibility', {
      requestId,
      visibility,
      count: profiles.length,
    });

    return profiles;
  }

  /**
   * Search profiles by criteria
   * @param criteria - Search criteria
   * @param requestId - Request identifier
   * @returns Promise resolving to array of profiles
   */
  async searchProfiles(criteria: ProfileSearchCriteria, requestId: string): Promise<UserProfile[]> {
    const queryBuilder = this.createSearchQueryBuilder(criteria);
    const profiles = await queryBuilder.getMany();

    this.loggingService.debug('Searched profiles by criteria', {
      requestId,
      criteria,
      count: profiles.length,
    });

    return profiles;
  }

  /**
   * Get profiles by completion status
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
    return this.searchMethods.getProfilesByCompletionStatus(isComplete, page, limit, requestId);
  }

  /**
   * Get profiles by date range
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
    return this.searchMethods.getProfilesByDateRange(startDate, endDate, page, limit, requestId);
  }

  /**
   * Get profile statistics
   * @param requestId - Request identifier
   * @returns Promise resolving to profile statistics
   */
  async getStatistics(requestId: string): Promise<ProfileStatistics> {
    return this.searchMethods.getStatistics(requestId);
  }

  /**
   * Create search query builder
   * @param criteria - Search criteria
   * @returns Query builder for search
   */
  private createSearchQueryBuilder(
    criteria: ProfileSearchCriteria,
  ): SelectQueryBuilder<UserProfile> {
    const queryBuilder = this.userProfileRepository.createQueryBuilder('profile');

    this.applySearchTermFilter(queryBuilder, criteria.searchTerm);
    this.applyVisibilityFilter(queryBuilder, criteria.visibility);
    this.applyLocationFilter(queryBuilder, criteria.location);
    this.applyLanguageFilter(queryBuilder, criteria.language);
    this.applyDateRangeFilters(queryBuilder, criteria.createdAfter, criteria.createdBefore);
    this.applySorting(queryBuilder, criteria.sortBy, criteria.sortOrder);
    this.applyPagination(queryBuilder, criteria.page, criteria.limit);

    return queryBuilder;
  }

  /**
   * Apply search term filter to query builder
   * @param queryBuilder - Query builder to modify
   * @param searchTerm - Search term to filter by
   */
  private applySearchTermFilter(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    searchTerm?: string,
  ): void {
    if (searchTerm) {
      queryBuilder.andWhere(
        '(profile.firstName ILIKE :searchTerm OR profile.lastName ILIKE :searchTerm OR profile.displayName ILIKE :searchTerm OR profile.bio ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      );
    }
  }

  /**
   * Apply visibility filter to query builder
   * @param queryBuilder - Query builder to modify
   * @param visibility - Visibility to filter by
   */
  private applyVisibilityFilter(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    visibility?: UserProfileVisibility,
  ): void {
    if (visibility) {
      queryBuilder.andWhere('profile.visibility = :visibility', {
        visibility,
      });
    }
  }

  /**
   * Apply location filter to query builder
   * @param queryBuilder - Query builder to modify
   * @param location - Location to filter by
   */
  private applyLocationFilter(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    location?: string,
  ): void {
    if (location) {
      queryBuilder.andWhere('profile.location ILIKE :location', {
        location: `%${location}%`,
      });
    }
  }

  /**
   * Apply language filter to query builder
   * @param query builder - Query builder to modify
   * @param queryBuilder
   * @param language - Language to filter by
   */
  private applyLanguageFilter(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    language?: string,
  ): void {
    if (language) {
      queryBuilder.andWhere('profile.language = :language', { language });
    }
  }

  /**
   * Apply date range filters to query builder
   * @param queryBuilder - Query builder to modify
   * @param createdAfter - Start date filter
   * @param createdBefore - End date filter
   */
  private applyDateRangeFilters(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    createdAfter?: Date,
    createdBefore?: Date,
  ): void {
    if (createdAfter) {
      queryBuilder.andWhere('profile.createdAt >= :createdAfter', {
        createdAfter,
      });
    }

    if (createdBefore) {
      queryBuilder.andWhere('profile.createdAt <= :createdBefore', {
        createdBefore,
      });
    }
  }

  /**
   * Apply sorting to query builder
   * @param queryBuilder - Query builder to modify
   * @param sortBy - Field to sort by
   * @param sortOrder - Sort order
   */
  private applySorting(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    sortBy?: string,
    sortOrder?: string,
  ): void {
    const field = sortBy || 'createdAt';
    const order = sortOrder || 'DESC';
    queryBuilder.orderBy(`profile.${field}`, order as 'ASC' | 'DESC');
  }

  /**
   * Apply pagination to query builder
   * @param queryBuilder - Query builder to modify
   * @param page - Page number
   * @param limit - Items per page
   */
  private applyPagination(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    page?: number,
    limit?: number,
  ): void {
    if (page && limit) {
      queryBuilder.skip((page - 1) * limit).take(limit);
    }
  }
}
