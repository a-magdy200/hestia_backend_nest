import { IUserProfileCrudRepository } from './user-profile-crud.interface';
import { IUserProfileManagementRepository } from './user-profile-management.interface';
import { IUserProfileSearchRepository } from './user-profile-search.interface';

/**
 * User profile repository interface
 * Defines the contract for user profile data access operations
 * Extends focused interfaces for better organization
 */
export interface IUserProfileRepository
  extends IUserProfileCrudRepository,
    IUserProfileSearchRepository,
    IUserProfileManagementRepository {}

// Re-export types for convenience
export type { ProfileSearchCriteria, ProfileStatistics } from './user-profile-search.interface';
