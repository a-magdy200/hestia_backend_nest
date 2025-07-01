import { User } from '../../database/entities/user.entity';

/**
 * User CRUD operations interface
 * Defines basic CRUD operations for user entities
 */
export interface IUserCrudRepository {
  /**
   * Find user by ID
   * @param id - User unique identifier
   * @param requestId - Request ID for logging
   * @returns Promise resolving to user or null if not found
   */
  findById(id: string, requestId: string): Promise<User | null>;

  /**
   * Find user by email
   * @param email - User email address
   * @param requestId - Request ID for logging
   * @returns Promise resolving to user or null if not found
   */
  findByEmail(email: string, requestId: string): Promise<User | null>;

  /**
   * Find all users with pagination
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param requestId - Request ID for logging
   * @returns Promise resolving to paginated users
   */
  findAll(
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{ users: User[]; total: number }>;

  /**
   * Create new user
   * @param userData - User data to create
   * @param requestId - Request ID for logging
   * @returns Promise resolving to created user
   */
  create(userData: Partial<User>, requestId: string): Promise<User>;

  /**
   * Update user
   * @param id - User ID
   * @param userData - User data to update
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated user
   */
  update(id: string, userData: Partial<User>, requestId: string): Promise<User>;

  /**
   * Delete user (soft delete)
   * @param id - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to deleted user
   */
  delete(id: string, requestId: string): Promise<User>;

  /**
   * Hard delete user
   * @param id - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating success
   */
  hardDelete(id: string, requestId: string): Promise<boolean>;

  /**
   * Check if email exists
   * @param email - Email to check
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if email exists
   */
  emailExists(email: string, requestId: string): Promise<boolean>;
}
