import { UserProfileVisibility } from '../../interfaces/enums/user.enum';

import { UserProfile } from './user-profile.entity';

/**
 * User profile entity business logic methods
 * Provides business logic for user profile operations
 */
export class UserProfileMethods {
  private readonly profile: UserProfile;

  constructor(profile: UserProfile) {
    this.profile = profile;
  }

  /**
   * Check if profile is complete
   * @returns True if profile has required fields filled
   */
  isComplete(): boolean {
    return !!(this.profile.firstName && this.profile.lastName && this.profile.displayName);
  }

  /**
   * Check if profile is public
   * @returns True if profile is public
   */
  isPublic(): boolean {
    return this.profile.isPublicProfile && this.profile.visibility === UserProfileVisibility.PUBLIC;
  }

  /**
   * Check if profile has avatar
   * @returns True if profile has avatar URL
   */
  hasAvatar(): boolean {
    return !!this.profile.avatarUrl;
  }

  /**
   * Get full name of user
   * @returns Full name string
   */
  getFullName(): string {
    if (this.profile.firstName && this.profile.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.profile.displayName || 'Unknown User';
  }

  /**
   * Get display name for user
   * @returns Display name string
   */
  getDisplayName(): string {
    return this.profile.displayName || this.getFullName() || 'Unknown User';
  }

  /**
   * Check if profile is visible to public
   * @returns True if profile is visible to public
   */
  isVisibleToPublic(): boolean {
    return this.profile.visibility === UserProfileVisibility.PUBLIC;
  }

  /**
   * Check if profile is visible to authenticated users
   * @returns True if profile is visible to authenticated users
   */
  isVisibleToAuthenticated(): boolean {
    return (
      this.profile.visibility === UserProfileVisibility.PUBLIC ||
      this.profile.visibility === UserProfileVisibility.AUTHENTICATED
    );
  }

  /**
   * Check if profile is private
   * @returns True if profile is private
   */
  isPrivate(): boolean {
    return this.profile.visibility === UserProfileVisibility.PRIVATE;
  }
}
