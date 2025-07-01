import { UserProfile } from './user-profile.entity';

/**
 * User profile validation methods
 * Provides validation logic for user profile entities
 */
export class UserProfileValidators {
  private readonly profile: UserProfile;

  constructor(profile: UserProfile) {
    this.profile = profile;
  }

  /**
   * Validate profile data
   */
  validateProfile(): void {
    this.validateFirstName();
    this.validateLastName();
    this.validateDisplayName();
    this.validateBio();
  }

  /**
   * Validate first name
   */
  private validateFirstName(): void {
    if (this.profile.firstName && this.profile.firstName.trim().length === 0) {
      throw new Error('First name cannot be empty');
    }
  }

  /**
   * Validate last name
   */
  private validateLastName(): void {
    if (this.profile.lastName && this.profile.lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty');
    }
  }

  /**
   * Validate display name
   */
  private validateDisplayName(): void {
    if (this.profile.displayName && this.profile.displayName.trim().length === 0) {
      throw new Error('Display name cannot be empty');
    }
  }

  /**
   * Validate bio
   */
  private validateBio(): void {
    if (this.profile.bio && this.profile.bio.trim().length > 1000) {
      throw new Error('Bio cannot exceed 1000 characters');
    }
  }
}
