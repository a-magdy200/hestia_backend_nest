import type { User } from '../../database/entities/user.entity';
import type { CreateUserDto } from '../../dto/user/create-user.dto';
import type { UpdateUserDto } from '../../dto/user/update-user.dto';
import type { UserSearchDto } from '../../dto/user/user-search.dto';
import type { UserRole, UserStatus } from '../enums/user.enum';

/**
 * User statistics interface
 */
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByStatus: Record<UserStatus, number>;
  recentRegistrations: number;
  averageLoginFrequency: number;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * User Service Interface
 * Defines contract for user management operations
 */
export interface IUserService {
  /**
   * Creates a new user
   * @param createUserDto - User creation data
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to created user
   */
  createUser(createUserDto: CreateUserDto, requestId: string): Promise<User>;

  /**
   * Gets a user by ID
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to user or null
   */
  getUserById(id: string, requestId: string): Promise<User | null>;

  /**
   * Gets a user by email
   * @param email - User email
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to user or null
   */
  getUserByEmail(email: string, requestId: string): Promise<User | null>;

  /**
   * Gets users by tenant ID
   * @param tenantId - Tenant ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to users array
   */
  getUsersByTenantId(tenantId: string, requestId: string): Promise<User[]>;

  /**
   * Gets users by role
   * @param role - User role
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to users array
   */
  getUsersByRole(role: UserRole, requestId: string): Promise<User[]>;

  /**
   * Gets users by status
   * @param status - User status
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to users array
   */
  getUsersByStatus(status: UserStatus, requestId: string): Promise<User[]>;

  /**
   * Gets all users with pagination
   * @param page - Page number
   * @param limit - Items per page
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to paginated result
   */
  getAllUsers(
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Searches users
   * @param searchDto - Search criteria
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to matching users
   */
  searchUsers(
    searchDto: UserSearchDto,
    requestId: string,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Updates a user
   * @param id - User ID
   * @param updateUserDto - Update data
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to updated user
   */
  updateUser(id: string, updateUserDto: UpdateUserDto, requestId: string): Promise<User>;

  /**
   * Deletes a user (soft delete)
   * @param userId - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when deletion is complete
   */
  deleteUser(userId: string, requestId: string): Promise<void>;

  /**
   * Hard deletes a user
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when deletion is complete
   */
  hardDeleteUser(id: string, requestId: string): Promise<boolean>;

  /**
   * Restores a deleted user
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to restored user
   */
  restoreUser(id: string, requestId: string): Promise<User>;

  /**
   * Checks if email exists
   * @param email - Email to check
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to existence boolean
   */
  emailExists(email: string, requestId: string): Promise<boolean>;

  /**
   * Updates last login timestamp
   * @param userId - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when update is complete
   */
  updateLastLogin(userId: string, requestId: string): Promise<void>;

  /**
   * Updates user password
   * @param id - User ID
   * @param newPassword - New password
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when update is complete
   */
  updatePassword(id: string, newPassword: string, requestId: string): Promise<User>;

  /**
   * Marks email as verified
   * @param userId - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when update is complete
   */
  markEmailAsVerified(userId: string, requestId: string): Promise<void>;

  /**
   * Increments failed login attempts
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when update is complete
   */
  incrementFailedLoginAttempts(id: string, requestId: string): Promise<User>;

  /**
   * Resets failed login attempts
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when reset is complete
   */
  resetFailedLoginAttempts(id: string, requestId: string): Promise<User>;

  /**
   * Locks user account
   * @param userId - User ID
   * @param reason - Lock reason
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when lock is complete
   */
  lockAccount(userId: string, reason: string, requestId: string): Promise<User>;

  /**
   * Unlocks user account
   * @param userId - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when unlock is complete
   */
  unlockAccount(userId: string, requestId: string): Promise<User>;

  /**
   * Changes user status
   * @param id - User ID
   * @param status - New status
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when change is complete
   */
  changeStatus(id: string, status: UserStatus, requestId: string): Promise<User>;

  /**
   * Changes user role
   * @param id - User ID
   * @param role - New role
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when change is complete
   */
  changeRole(id: string, role: UserRole, requestId: string): Promise<User>;

  /**
   * Activates user account
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when activation is complete
   */
  activateUser(id: string, requestId: string): Promise<void>;

  /**
   * Deactivates user account
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when deactivation is complete
   */
  deactivateUser(id: string, requestId: string): Promise<void>;

  /**
   * Suspends user account
   * @param id - User ID
   * @param reason - Suspension reason
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when suspension is complete
   */
  suspendUser(id: string, reason: string, requestId: string): Promise<void>;

  /**
   * Gets user statistics
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to statistics
   */
  getUserStatistics(requestId: string): Promise<UserStatistics>;

  /**
   * Validate user data
   * @param userData - User data to validate
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to validation result
   */
  validateUserData(userData: Partial<User>, requestId: string): Promise<ValidationResult>;

  /**
   * Check if user exists
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to boolean
   */
  userExists(id: string, requestId: string): Promise<boolean>;

  /**
   * Check if email is available
   * @param email - Email to check
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to boolean
   */
  isEmailAvailable(email: string, requestId: string): Promise<boolean>;
}
