import type { UserProfile } from '../../database/entities/user-profile.entity';
import type { CreateProfileDto } from '../../dto/user-profile/create-profile.dto';
import type { UpdateProfileDto } from '../../dto/user-profile/update-profile.dto';
import type { ProfileSearchDto } from '../../dto/user-profile/profile-search.dto';
import { UserProfileVisibility } from '../enums/user.enum';
import { ProfileStatistics } from '../repositories/user-profile-repository.interface';

/**
 * Create profile data interface
 * Defines the structure for creating new user profiles
 */
export interface CreateProfileData {
  /** User ID */
  userId: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Display name */
  displayName?: string;
  /** Bio */
  bio?: string;
  /** Phone number */
  phoneNumber?: string;
  /** Date of birth */
  dateOfBirth?: Date;
  /** Location */
  location?: string;
  /** Timezone */
  timezone?: string;
  /** Language */
  language?: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Cover image URL */
  coverImageUrl?: string;
  /** Profile visibility */
  visibility?: UserProfileVisibility;
  /** Profile preferences */
  preferences?: Record<string, unknown>;
  /** Social links */
  socialLinks?: Record<string, string>;
}

/**
 * Update profile data interface
 * Defines the structure for updating user profiles
 */
export interface UpdateProfileData {
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Display name */
  displayName?: string;
  /** Bio */
  bio?: string;
  /** Phone number */
  phoneNumber?: string;
  /** Date of birth */
  dateOfBirth?: Date;
  /** Location */
  location?: string;
  /** Timezone */
  timezone?: string;
  /** Language */
  language?: string;
  /** Avatar URL */
  avatarUrl?: string;
  /** Cover image URL */
  coverImageUrl?: string;
  /** Profile visibility */
  visibility?: UserProfileVisibility;
  /** Profile preferences */
  preferences?: Record<string, unknown>;
  /** Social links */
  socialLinks?: Record<string, string>;
  /** Is public profile */
  isPublicProfile?: boolean;
}

/**
 * User Profile Service Interface
 * Defines contract for user profile management operations
 */
export interface IUserProfileService {
  /**
   * Creates a new user profile
   * @param userId - User ID
   * @param createProfileDto - Profile creation data
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to created profile
   */
  createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
    requestId: string,
  ): Promise<UserProfile>;

  /**
   * Gets a user profile by user ID
   * @param userId - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to user profile or null
   */
  getProfileByUserId(userId: string, requestId: string): Promise<UserProfile | null>;

  /**
   * Gets a user profile by profile ID
   * @param id - Profile ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to user profile or null
   */
  getProfileById(id: string, requestId: string): Promise<UserProfile | null>;

  /**
   * Updates a user profile
   * @param userId - User ID
   * @param updateProfileDto - Profile update data
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to updated profile
   */
  updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    requestId: string,
  ): Promise<UserProfile>;

  /**
   * Deletes a user profile
   * @param userId - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when deletion is complete
   */
  deleteProfile(userId: string, requestId: string): Promise<void>;

  /**
   * Searches user profiles
   * @param searchDto - Search criteria
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to matching profiles
   */
  searchProfiles(searchDto: ProfileSearchDto, requestId: string): Promise<UserProfile[]>;

  /**
   * Gets public profiles with pagination
   * @param page - Page number (optional, defaults to 1)
   * @param limit - Items per page (optional, defaults to 10)
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to profiles array
   */
  getPublicProfiles(page?: number, limit?: number, requestId?: string): Promise<UserProfile[]>;

  /**
   * Updates user preferences
   * @param userId - User ID
   * @param preferences - User preferences
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to updated profile
   */
  updatePreferences(
    userId: string,
    preferences: Record<string, unknown>,
    requestId: string,
  ): Promise<UserProfile>;

  /**
   * Updates social links
   * @param userId - User ID
   * @param socialLinks - Social media links
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to updated profile
   */
  updateSocialLinks(
    userId: string,
    socialLinks: Record<string, string>,
    requestId: string,
  ): Promise<UserProfile>;

  /**
   * Checks profile completeness
   * @param userId - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to completeness percentage
   */
  checkProfileCompleteness(userId: string, requestId: string): Promise<number>;

  /**
   * Gets profiles by completion status
   * @param isComplete - Completion status
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to matching profiles
   */
  getProfilesByCompletionStatus(isComplete: boolean, requestId: string): Promise<UserProfile[]>;

  /**
   * Get profiles by visibility
   * @param visibility - Profile visibility level
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of profiles
   */
  getProfilesByVisibility(
    visibility: UserProfileVisibility,
    requestId: string,
  ): Promise<UserProfile[]>;

  /**
   * Get profile statistics
   * @param requestId - Request ID for logging
   * @returns Promise resolving to profile statistics
   */
  getProfileStatistics(requestId: string): Promise<ProfileStatistics>;

  /**
   * Validate profile data
   * @param profileData - Profile data to validate
   * @param requestId - Request ID for logging
   * @returns Promise resolving to validation result
   */
  validateProfileData(
    profileData: Partial<UserProfile>,
    requestId: string,
  ): Promise<ValidationResult>;

  /**
   * Check if profile can be viewed by user
   * @param profileUserId - Profile owner user ID
   * @param requestingUserId - Requesting user ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if profile can be viewed
   */
  canViewProfile(
    profileUserId: string,
    requestingUserId: string,
    requestId: string,
  ): Promise<boolean>;

  /**
   * Check if profile can be modified by user
   * @param profileUserId - Profile owner user ID
   * @param modifyingUserId - Modifying user ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if profile can be modified
   */
  canModifyProfile(
    profileUserId: string,
    modifyingUserId: string,
    requestId: string,
  ): Promise<boolean>;

  /**
   * Get profile completion percentage
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to completion percentage (0-100)
   */
  getProfileCompletionPercentage(userId: string, requestId: string): Promise<number>;

  /**
   * Get profile suggestions for completion
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of suggestion messages
   */
  getProfileCompletionSuggestions(userId: string, requestId: string): Promise<string[]>;
}

/**
 * Validation result interface
 * Defines the result of validation operations
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}
