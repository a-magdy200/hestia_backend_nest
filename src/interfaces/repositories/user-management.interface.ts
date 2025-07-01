import { User } from '../../database/entities/user.entity';
import { UserRole, UserStatus } from '../enums/user.enum';

/**
 * User management operations interface
 * Defines specific management operations for user entities
 */
export interface IUserManagementRepository {
  /**
   * Update user last login
   * @param id - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  updateLastLogin(id: string, requestId: string): Promise<User>;

  /**
   * Update user password
   * @param id - User ID
   * @param passwordHash - New password hash
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  updatePassword(id: string, passwordHash: string, requestId: string): Promise<User>;

  /**
   * Mark email as verified
   * @param id - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  markEmailAsVerified(id: string, requestId: string): Promise<User>;

  /**
   * Increment failed login attempts
   * @param id - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  incrementFailedLoginAttempts(id: string, requestId: string): Promise<User>;

  /**
   * Reset failed login attempts
   * @param id - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  resetFailedLoginAttempts(id: string, requestId: string): Promise<User>;

  /**
   * Lock user account
   * @param id - User ID
   * @param reason - Lock reason
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  lockAccount(id: string, reason: string, requestId: string): Promise<User>;

  /**
   * Unlock user account
   * @param id - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  unlockAccount(id: string, requestId: string): Promise<User>;

  /**
   * Change user status
   * @param id - User ID
   * @param status - New status
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  changeStatus(id: string, status: UserStatus, requestId: string): Promise<User>;

  /**
   * Change user role
   * @param id - User ID
   * @param role - New role
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  changeRole(id: string, role: UserRole, requestId: string): Promise<User>;
}
