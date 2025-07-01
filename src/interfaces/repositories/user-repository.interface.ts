import { IUserCrudRepository } from './user-crud.interface';
import { IUserManagementRepository } from './user-management.interface';
import { IUserSearchRepository } from './user-search.interface';

/**
 * User repository interface
 * Defines the contract for user data access operations
 * Extends focused interfaces for better organization
 */
export interface IUserRepository
  extends IUserCrudRepository,
    IUserSearchRepository,
    IUserManagementRepository {}

// Re-export types for convenience
export type { UserSearchCriteria } from './user-search.interface';
