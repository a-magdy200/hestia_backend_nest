import { User } from '../../database/entities/user.entity';
import { UserRole, UserStatus } from '../enums/user.enum';

/**
 * User search operations interface
 * Defines search and query operations for user entities
 */
export interface IUserSearchRepository {
  /**
   * Find users by tenant ID
   * @param tenantId - Tenant identifier
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of users
   */
  findByTenantId(tenantId: string, requestId: string): Promise<User[]>;

  /**
   * Find users by role
   * @param role - User role
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of users
   */
  findByRole(role: UserRole, requestId: string): Promise<User[]>;

  /**
   * Find users by status
   * @param status - User status
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of users
   */
  findByStatus(status: UserStatus, requestId: string): Promise<User[]>;

  /**
   * Search users by criteria
   * @param criteria - Search criteria
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of users
   */
  searchUsers(criteria: UserSearchCriteria, requestId: string): Promise<User[]>;
}

/**
 * User search criteria interface
 * Defines the criteria for searching users
 */
export interface UserSearchCriteria {
  /** Search term for email, name, etc. */
  searchTerm?: string;
  /** User role filter */
  role?: UserRole;
  /** User status filter */
  status?: UserStatus;
  /** Tenant ID filter */
  tenantId?: string;
  /** Date range for creation */
  createdAfter?: Date;
  /** Date range for creation */
  createdBefore?: Date;
  /** Date range for last login */
  lastLoginAfter?: Date;
  /** Date range for last login */
  lastLoginBefore?: Date;
  /** Page number for pagination */
  page?: number;
  /** Items per page for pagination */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'ASC' | 'DESC';
}
