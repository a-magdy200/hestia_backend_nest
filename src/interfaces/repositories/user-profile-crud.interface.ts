import { UserProfile } from '../../database/entities/user-profile.entity';

/**
 * User profile CRUD operations interface
 * Defines basic CRUD operations for user profile entities
 */
export interface IUserProfileCrudRepository {
  /**
   * Find profile by ID
   * @param id - Profile unique identifier
   * @param requestId - Request ID for logging
   * @returns Promise resolving to profile or null if not found
   */
  findById(id: string, requestId: string): Promise<UserProfile | null>;

  /**
   * Find profile by user ID
   * @param userId - User unique identifier
   * @param requestId - Request ID for logging
   * @returns Promise resolving to profile or null if not found
   */
  findByUserId(userId: string, requestId: string): Promise<UserProfile | null>;

  /**
   * Create new profile
   * @param profileData - Profile data to create
   * @param requestId - Request ID for logging
   * @returns Promise resolving to created profile
   */
  create(profileData: Partial<UserProfile>, requestId: string): Promise<UserProfile>;

  /**
   * Update profile
   * @param id - Profile ID
   * @param profileData - Profile data to update
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated profile
   */
  update(id: string, profileData: Partial<UserProfile>, requestId: string): Promise<UserProfile>;

  /**
   * Update profile by user ID
   * @param userId - User ID
   * @param profileData - Profile data to update
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated profile
   */
  updateByUserId(
    userId: string,
    profileData: Partial<UserProfile>,
    requestId: string,
  ): Promise<UserProfile>;

  /**
   * Delete profile (soft delete)
   * @param id - Profile ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to deleted profile
   */
  delete(id: string, requestId: string): Promise<UserProfile>;

  /**
   * Delete profile by user ID (soft delete)
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to deleted profile
   */
  deleteByUserId(userId: string, requestId: string): Promise<UserProfile>;

  /**
   * Hard delete profile
   * @param id - Profile ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating success
   */
  hardDelete(id: string, requestId: string): Promise<boolean>;

  /**
   * Check if profile exists for user
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if profile exists
   */
  existsForUser(userId: string, requestId: string): Promise<boolean>;
}
