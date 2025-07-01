import { UserProfile } from '../../database/entities/user-profile.entity';
import { UserProfileVisibility } from '../enums/user.enum';

/**
 * User profile search operations interface
 * Defines search and query operations for user profile entities
 */
export interface IUserProfileSearchRepository {
  /**
   * Find public profiles
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param requestId - Request ID for logging
   * @returns Promise resolving to paginated public profiles
   */
  findPublicProfiles(
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{ profiles: UserProfile[]; total: number }>;

  /**
   * Find profiles by visibility
   * @param visibility - Profile visibility level
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of profiles
   */
  findByVisibility(visibility: UserProfileVisibility, requestId: string): Promise<UserProfile[]>;

  /**
   * Search profiles by criteria
   * @param criteria - Search criteria
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of profiles
   */
  searchProfiles(criteria: ProfileSearchCriteria, requestId: string): Promise<UserProfile[]>;

  /**
   * Get profile statistics
   * @param requestId - Request ID for logging
   * @returns Promise resolving to profile statistics
   */
  getStatistics(requestId: string): Promise<ProfileStatistics>;
}

/**
 * Profile search criteria interface
 * Defines the criteria for searching profiles
 */
export interface ProfileSearchCriteria {
  /** Search term for name, bio, etc. */
  searchTerm?: string;
  /** Profile visibility filter */
  visibility?: UserProfileVisibility;
  /** Location filter */
  location?: string;
  /** Language filter */
  language?: string;
  /** Date range for creation */
  createdAfter?: Date;
  /** Date range for creation */
  createdBefore?: Date;
  /** Page number for pagination */
  page?: number;
  /** Items per page for pagination */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Profile statistics interface
 * Defines the statistics for user profiles
 */
export interface ProfileStatistics {
  /** Total number of profiles */
  totalProfiles: number;
  /** Number of public profiles */
  publicProfiles: number;
  /** Number of private profiles */
  privateProfiles: number;
  /** Number of complete profiles */
  completeProfiles: number;
  /** Number of incomplete profiles */
  incompleteProfiles: number;
  /** Profiles created in last 30 days */
  recentProfiles: number;
}
