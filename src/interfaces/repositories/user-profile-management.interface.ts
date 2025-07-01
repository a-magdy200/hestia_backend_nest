import { UserProfile } from '../../database/entities/user-profile.entity';
import { UserProfileVisibility } from '../enums/user.enum';

/**
 * User profile management operations interface
 * Defines specific management operations for user profile entities
 */
export interface IUserProfileManagementRepository {
  /**
   * Update profile preferences
   * @param userId - User ID
   * @param preferences - New preferences
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated profile
   */
  updatePreferences(
    userId: string,
    preferences: Record<string, unknown>,
    requestId: string,
  ): Promise<UserProfile>;

  /**
   * Update social links
   * @param userId - User ID
   * @param socialLinks - New social links
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated profile
   */
  updateSocialLinks(
    userId: string,
    socialLinks: Record<string, string>,
    requestId: string,
  ): Promise<UserProfile>;

  /**
   * Change profile visibility
   * @param userId - User ID
   * @param visibility - New visibility level
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated profile
   */
  changeVisibility(
    userId: string,
    visibility: UserProfileVisibility,
    requestId: string,
  ): Promise<UserProfile>;

  /**
   * Toggle public profile status
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to updated profile
   */
  togglePublicProfile(userId: string, requestId: string): Promise<UserProfile>;
}
