import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Not, IsNull } from 'typeorm';

import { UserProfileMethods } from '../database/entities/user-profile-methods.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { CreateProfileDto } from '../dto/user-profile/create-profile.dto';
import { ProfileSearchDto } from '../dto/user-profile/profile-search.dto';
import { UpdateProfileDto } from '../dto/user-profile/update-profile.dto';
import { UserProfileVisibility } from '../interfaces/enums/user.enum';
import {
  IUserProfileService,
  ValidationResult,
} from '../interfaces/services/user-profile-service.interface';
import { ProfileStatistics } from '../interfaces/repositories/user-profile-search.interface';

import { LoggingService } from './logging.service';

/**
 * User profile service implementation
 * Provides comprehensive user profile management functionality
 */
@Injectable()
export class UserProfileService implements IUserProfileService {
  /**
   *
   * @param userProfileRepository
   * @param userProfileRepo
   * @param loggingService
   */
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Create a new user profile
   * @param userId
   * @param createProfileDto
   * @param requestId
   */
  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('UserProfileService: Creating profile', { requestId, userId });

    try {
      await this.checkExistingProfile(userId, requestId);

      const profileData = this.buildProfileData(userId, createProfileDto);
      const profile = this.userProfileRepository.create(profileData);
      const savedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('UserProfileService: Profile created successfully', {
        requestId,
        userId,
        profileId: savedProfile.id,
      });

      return savedProfile;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to create profile', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if profile already exists
   */
  private async checkExistingProfile(userId: string, requestId: string): Promise<void> {
    const existingProfile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      this.loggingService.warn('UserProfileService: Profile already exists', {
        requestId,
        userId,
      });
      throw new BadRequestException('Profile already exists for this user');
    }
  }

  /**
   * Build profile data from DTO
   */
  private buildProfileData(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Partial<UserProfile> {
    const profileData: Record<string, unknown> = {
      userId,
      isDeleted: false,
    };

    this.addProfileFields(profileData, createProfileDto);
    this.addDefaultValues(profileData, createProfileDto);

    return profileData as Partial<UserProfile>;
  }

  /**
   * Add profile fields from DTO
   */
  private addProfileFields(
    profileData: Record<string, unknown>,
    createProfileDto: CreateProfileDto,
  ): void {
    const fieldMappings = [
      { dtoField: 'firstName', profileField: 'firstName' },
      { dtoField: 'lastName', profileField: 'lastName' },
      { dtoField: 'displayName', profileField: 'displayName' },
      { dtoField: 'bio', profileField: 'bio' },
      { dtoField: 'phoneNumber', profileField: 'phoneNumber' },
      { dtoField: 'location', profileField: 'location' },
      { dtoField: 'timezone', profileField: 'timezone' },
      { dtoField: 'language', profileField: 'language' },
      { dtoField: 'avatarUrl', profileField: 'avatarUrl' },
      { dtoField: 'coverImageUrl', profileField: 'coverImageUrl' },
    ];

    fieldMappings.forEach(({ dtoField, profileField }) => {
      const value = createProfileDto[dtoField as keyof CreateProfileDto];
      if (value !== undefined) {
        profileData[profileField] = value;
      }
    });

    // Handle date of birth separately
    if (createProfileDto.dateOfBirth !== undefined) {
      profileData['dateOfBirth'] = new Date(createProfileDto.dateOfBirth);
    }
  }

  /**
   * Add default values for profile fields
   */
  private addDefaultValues(
    profileData: Record<string, unknown>,
    createProfileDto: CreateProfileDto,
  ): void {
    profileData['visibility'] = createProfileDto.visibility ?? UserProfileVisibility.PRIVATE;
    profileData['isPublicProfile'] = createProfileDto.isPublicProfile ?? false;
  }

  /**
   * Get user profile by user ID
   * @param userId
   * @param requestId
   */
  async getProfileByUserId(userId: string, requestId: string): Promise<UserProfile | null> {
    this.loggingService.debug('UserProfileService: Getting profile by user ID', {
      requestId,
      userId,
    });

    try {
      const profile = await this.userProfileRepository.findOne({
        where: { userId, isDeleted: false },
      });

      if (!profile) {
        this.loggingService.warn('UserProfileService: Profile not found', { requestId, userId });
        return null;
      }

      return profile;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to get profile by user ID', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get user profile by profile ID
   * @param profileId
   * @param requestId
   */
  async getProfileById(profileId: string, requestId: string): Promise<UserProfile | null> {
    this.loggingService.debug('UserProfileService: Getting profile by ID', {
      requestId,
      profileId,
    });

    try {
      const profile = await this.userProfileRepository.findOne({
        where: { id: profileId, isDeleted: false },
      });

      if (!profile) {
        this.loggingService.warn('UserProfileService: Profile not found', { requestId, profileId });
        return null;
      }

      return profile;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to get profile by ID', {
        requestId,
        profileId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update user profile
   * @param userId
   * @param updateProfileDto
   * @param requestId
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('UserProfileService: Updating profile', { requestId, userId });

    try {
      const profile = await this.getProfileByUserId(userId, requestId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      this.updateProfileFields(profile, updateProfileDto);
      const updatedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('UserProfileService: Profile updated successfully', {
        requestId,
        userId,
        updatedFields: Object.keys(updateProfileDto),
      });

      return updatedProfile;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to update profile', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private updateProfileFields(profile: UserProfile, updateProfileDto: UpdateProfileDto): void {
    const fieldUpdates = [
      { field: 'firstName', value: updateProfileDto.firstName },
      { field: 'lastName', value: updateProfileDto.lastName },
      { field: 'displayName', value: updateProfileDto.displayName },
      { field: 'bio', value: updateProfileDto.bio },
      { field: 'phoneNumber', value: updateProfileDto.phoneNumber },
      { field: 'dateOfBirth', value: updateProfileDto.dateOfBirth },
      { field: 'location', value: updateProfileDto.location },
      { field: 'timezone', value: updateProfileDto.timezone },
      { field: 'language', value: updateProfileDto.language },
      { field: 'avatarUrl', value: updateProfileDto.avatarUrl },
      { field: 'coverImageUrl', value: updateProfileDto.coverImageUrl },
      { field: 'visibility', value: updateProfileDto.visibility },
      { field: 'isPublicProfile', value: updateProfileDto.isPublicProfile },
    ];

    fieldUpdates.forEach(({ field, value }) => {
      if (value !== undefined) {
        (profile as any)[field] = value;
      }
    });
  }

  /**
   * Delete user profile (soft delete)
   * @param userId
   * @param requestId
   */
  async deleteProfile(userId: string, requestId: string): Promise<void> {
    this.loggingService.debug('UserProfileService: Deleting profile', { requestId, userId });

    try {
      const profile = await this.getProfileByUserId(userId, requestId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      // Soft delete profile
      profile.isDeleted = true;
      profile.isPublicProfile = false;

      await this.userProfileRepository.save(profile);

      this.loggingService.debug('UserProfileService: Profile deleted successfully', {
        requestId,
        userId,
      });
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to delete profile', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Search user profiles
   * @param searchDto
   * @param requestId
   */
  async searchProfiles(searchDto: ProfileSearchDto, requestId: string): Promise<UserProfile[]> {
    this.loggingService.debug('UserProfileService: Searching profiles', {
      requestId,
      searchCriteria: searchDto,
    });

    try {
      const queryBuilder = this.buildSearchQueryBuilder();
      this.applySearchFilters(queryBuilder, searchDto);
      this.applySortingAndPagination(queryBuilder, searchDto);

      const profiles = await queryBuilder.getMany();

      this.loggingService.debug('UserProfileService: Profile search completed', {
        requestId,
        resultCount: profiles.length,
        page: searchDto.page || 1,
        limit: searchDto.limit || 10,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to search profiles', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private buildSearchQueryBuilder(): SelectQueryBuilder<UserProfile> {
    return this.userProfileRepository
      .createQueryBuilder('profile')
      .where('profile.isDeleted = :isDeleted', { isDeleted: false });
  }

  private applySearchFilters(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    searchDto: ProfileSearchDto,
  ): void {
    const filters = [
      { field: 'firstName', value: searchDto.firstName, operator: 'ILIKE' },
      { field: 'lastName', value: searchDto.lastName, operator: 'ILIKE' },
      { field: 'displayName', value: searchDto.displayName, operator: 'ILIKE' },
      { field: 'location', value: searchDto.location, operator: 'ILIKE' },
      { field: 'language', value: searchDto.language, operator: '=' },
      { field: 'visibility', value: searchDto.visibility, operator: '=' },
    ];

    filters.forEach(({ field, value, operator }) => {
      if (value !== undefined) {
        const paramName = field;
        const paramValue = operator === 'ILIKE' ? `%${value}%` : value;
        queryBuilder.andWhere(`profile.${field} ${operator} :${paramName}`, {
          [paramName]: paramValue,
        });
      }
    });

    if (searchDto.isPublicProfile !== undefined) {
      queryBuilder.andWhere('profile.isPublicProfile = :isPublicProfile', {
        isPublicProfile: searchDto.isPublicProfile,
      });
    }
  }

  private applySortingAndPagination(
    queryBuilder: SelectQueryBuilder<UserProfile>,
    searchDto: ProfileSearchDto,
  ): void {
    const sortField = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`profile.${sortField}`, sortOrder as 'ASC' | 'DESC');

    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);
  }

  /**
   * Get public profiles
   * @param page
   * @param limit
   * @param requestId
   */
  async getPublicProfiles(page = 1, limit = 10, requestId: string): Promise<UserProfile[]> {
    this.loggingService.debug('UserProfileService: Getting public profiles', {
      requestId,
      page,
      limit,
    });

    try {
      const offset = (page - 1) * limit;

      const profiles = await this.userProfileRepository.find({
        where: {
          isDeleted: false,
          isPublicProfile: true,
          visibility: UserProfileVisibility.PUBLIC,
        },
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
      });

      this.loggingService.debug('UserProfileService: Public profiles retrieved', {
        requestId,
        resultCount: profiles.length,
        page,
        limit,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to get public profiles', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update profile preferences
   * @param userId
   * @param preferences
   * @param requestId
   */
  async updatePreferences(
    userId: string,
    preferences: Record<string, unknown>,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('UserProfileService: Updating preferences', { requestId, userId });

    try {
      const profile = await this.getProfileByUserId(userId, requestId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      profile.preferences = { ...profile.preferences, ...preferences };
      const updatedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('UserProfileService: Preferences updated successfully', {
        requestId,
        userId,
      });

      return updatedProfile;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to update preferences', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update social links
   * @param userId
   * @param socialLinks
   * @param requestId
   */
  async updateSocialLinks(
    userId: string,
    socialLinks: Record<string, string>,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('UserProfileService: Updating social links', { requestId, userId });

    try {
      const profile = await this.getProfileByUserId(userId, requestId);
      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      profile.socialLinks = { ...profile.socialLinks, ...socialLinks };
      const updatedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('UserProfileService: Social links updated successfully', {
        requestId,
        userId,
      });

      return updatedProfile;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to update social links', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if profile is complete
   * @param userId
   * @param requestId
   */
  async isProfileComplete(userId: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('UserProfileService: Checking profile completeness', {
      requestId,
      userId,
    });

    try {
      const profile = await this.getProfileByUserId(userId, requestId);
      if (!profile) {
        return false;
      }

      const profileMethods = new UserProfileMethods(profile);
      return profileMethods.isComplete();
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to check profile completeness', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Get profiles by completion status
   * @param isComplete - Whether to get complete or incomplete profiles
   * @param requestId - Request identifier for logging
   * @returns Array of user profiles
   */
  async getProfilesByCompletionStatus(
    isComplete: boolean,
    requestId: string,
  ): Promise<UserProfile[]> {
    this.loggingService.debug('UserProfileService: Getting profiles by completion status', {
      requestId,
      isComplete,
    });

    try {
      const profiles = await this.userProfileRepository.find({
        where: {
          isDeleted: false,
        },
        order: { createdAt: 'DESC' },
      });

      // Filter profiles based on completion status
      const filteredProfiles: UserProfile[] = [];
      for (const profile of profiles) {
        const complete = await this.isProfileComplete(profile.userId, requestId);
        if (complete === isComplete) {
          filteredProfiles.push(profile);
        }
      }

      return filteredProfiles;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to get profiles by completion status', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check profile completeness
   * @param userId - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to completeness percentage
   */
  async checkProfileCompleteness(userId: string, requestId: string): Promise<number> {
    this.loggingService.debug('UserProfileService: Checking profile completeness percentage', {
      requestId,
      userId,
    });

    try {
      const profile = await this.getProfileByUserId(userId, requestId);
      if (!profile) {
        return 0;
      }

      const profileMethods = new UserProfileMethods(profile);
      return profileMethods.isComplete() ? 100 : 50; // Simplified completion calculation
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to check profile completeness', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return 0;
    }
  }

  /**
   * Get profiles by visibility
   * @param visibility - Profile visibility level
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of profiles
   */
  async getProfilesByVisibility(
    visibility: UserProfileVisibility,
    requestId: string,
  ): Promise<UserProfile[]> {
    this.loggingService.debug('UserProfileService: Getting profiles by visibility', {
      requestId,
      visibility,
    });

    try {
      const profiles = await this.userProfileRepository.find({
        where: {
          visibility,
          isDeleted: false,
        },
        order: { createdAt: 'DESC' },
      });

      this.loggingService.debug('UserProfileService: Profiles by visibility retrieved', {
        requestId,
        visibility,
        count: profiles.length,
      });

      return profiles;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to get profiles by visibility', {
        requestId,
        visibility,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get profile statistics
   * @param requestId - Request ID for logging
   * @returns Promise resolving to profile statistics
   */
  async getProfileStatistics(requestId: string): Promise<ProfileStatistics> {
    this.loggingService.debug('UserProfileService: Getting profile statistics', { requestId });

    try {
      const totalProfiles = await this.userProfileRepository.count({
        where: { isDeleted: false },
      });

      const publicProfiles = await this.userProfileRepository.count({
        where: {
          isDeleted: false,
          visibility: UserProfileVisibility.PUBLIC,
        },
      });

      const privateProfiles = await this.userProfileRepository.count({
        where: {
          isDeleted: false,
          visibility: UserProfileVisibility.PRIVATE,
        },
      });

      const profilesWithAvatars = await this.userProfileRepository.count({
        where: {
          isDeleted: false,
          avatarUrl: Not(IsNull()),
        },
      });

      const statistics: ProfileStatistics = {
        totalProfiles,
        publicProfiles,
        privateProfiles,
        completeProfiles: profilesWithAvatars,
        incompleteProfiles: totalProfiles - profilesWithAvatars,
        recentProfiles: 0, // TODO: Implement recent profiles calculation
      };

      this.loggingService.debug('UserProfileService: Profile statistics retrieved', {
        requestId,
        statistics,
      });

      return statistics;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to get profile statistics', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Validate profile data
   * @param profileData - Profile data to validate
   * @param requestId - Request ID for logging
   * @returns Promise resolving to validation result
   */
  async validateProfileData(
    profileData: Partial<UserProfile>,
    requestId: string,
  ): Promise<ValidationResult> {
    this.loggingService.debug('UserProfileService: Validating profile data', { requestId });

    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      this.validateRequiredFields(profileData, errors);
      this.validateFieldFormats(profileData, errors, warnings);
      this.validateFieldLengths(profileData, errors);

      const isValid = errors.length === 0;

      this.loggingService.debug('UserProfileService: Profile data validation completed', {
        requestId,
        isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
      });

      return { isValid, errors, warnings };
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to validate profile data', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        isValid: false,
        errors: ['Validation failed due to system error'],
        warnings: [],
      };
    }
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(profileData: Partial<UserProfile>, errors: string[]): void {
    if (!profileData.userId) {
      errors.push('User ID is required');
    }
  }

  /**
   * Validate field formats
   */
  private validateFieldFormats(
    profileData: Partial<UserProfile>,
    errors: string[],
    warnings: string[],
  ): void {
    if (profileData.phoneNumber && !this.isValidPhoneNumber(profileData.phoneNumber)) {
      errors.push('Invalid phone number format');
    }

    if (profileData.dateOfBirth) {
      this.validateDateOfBirth(profileData.dateOfBirth, errors, warnings);
    }
  }

  /**
   * Validate date of birth
   */
  private validateDateOfBirth(dateOfBirth: Date, errors: string[], warnings: string[]): void {
    const dob = new Date(dateOfBirth);
    const now = new Date();

    if (dob > now) {
      errors.push('Date of birth cannot be in the future');
    }

    if (now.getFullYear() - dob.getFullYear() > 120) {
      warnings.push('Date of birth seems unrealistic');
    }
  }

  /**
   * Validate field lengths
   */
  private validateFieldLengths(profileData: Partial<UserProfile>, errors: string[]): void {
    if (profileData.bio && profileData.bio.length > 500) {
      errors.push('Bio cannot exceed 500 characters');
    }

    if (profileData.displayName && profileData.displayName.length > 50) {
      errors.push('Display name cannot exceed 50 characters');
    }
  }

  /**
   * Check if profile can be viewed by user
   * @param profileUserId - Profile owner user ID
   * @param requestingUserId - Requesting user ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if profile can be viewed
   */
  async canViewProfile(
    profileUserId: string,
    requestingUserId: string,
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.debug('UserProfileService: Checking profile view permissions', {
      requestId,
      profileUserId,
      requestingUserId,
    });

    try {
      // Users can always view their own profile
      if (profileUserId === requestingUserId) {
        return true;
      }

      const profile = await this.getProfileByUserId(profileUserId, requestId);
      if (!profile) {
        return false;
      }

      // Check visibility settings
      if (profile.visibility === UserProfileVisibility.PUBLIC) {
        return true;
      }

      if (profile.visibility === UserProfileVisibility.PRIVATE) {
        return false;
      }

      // For other visibility levels, implement additional logic as needed
      return false;
    } catch (error) {
      this.loggingService.error('UserProfileService: Failed to check profile view permissions', {
        requestId,
        profileUserId,
        requestingUserId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Check if profile can be modified by user
   * @param profileUserId - Profile owner user ID
   * @param modifyingUserId - Modifying user ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to boolean indicating if profile can be modified
   */
  async canModifyProfile(
    profileUserId: string,
    modifyingUserId: string,
    requestId: string,
  ): Promise<boolean> {
    this.loggingService.debug('UserProfileService: Checking profile modification permissions', {
      requestId,
      profileUserId,
      modifyingUserId,
    });

    try {
      // Users can always modify their own profile
      if (profileUserId === modifyingUserId) {
        return true;
      }

      // TODO: Implement admin/moderation permissions
      // For now, only profile owners can modify their profiles
      return false;
    } catch (error) {
      this.loggingService.error(
        'UserProfileService: Failed to check profile modification permissions',
        {
          requestId,
          profileUserId,
          modifyingUserId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      return false;
    }
  }

  /**
   * Get profile completion percentage
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to completion percentage (0-100)
   */
  async getProfileCompletionPercentage(userId: string, requestId: string): Promise<number> {
    return this.checkProfileCompleteness(userId, requestId);
  }

  /**
   * Get profile suggestions for completion
   * @param userId - User ID
   * @param requestId - Request ID for logging
   * @returns Promise resolving to array of suggestion messages
   */
  async getProfileCompletionSuggestions(userId: string, requestId: string): Promise<string[]> {
    this.loggingService.debug('UserProfileService: Getting profile completion suggestions', {
      requestId,
      userId,
    });

    try {
      const profile = await this.getProfileByUserId(userId, requestId);
      if (!profile) {
        return ['Create your profile to get started'];
      }

      const suggestions = this.generateProfileSuggestions(profile);

      this.loggingService.debug('UserProfileService: Profile completion suggestions generated', {
        requestId,
        userId,
        suggestionCount: suggestions.length,
      });

      return suggestions;
    } catch (error) {
      this.loggingService.error(
        'UserProfileService: Failed to get profile completion suggestions',
        {
          requestId,
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );
      return ['Unable to generate suggestions at this time'];
    }
  }

  /**
   * Generate profile completion suggestions based on missing fields
   * @param profile - User profile to analyze
   * @returns Array of suggestion messages
   */
  private generateProfileSuggestions(profile: UserProfile): string[] {
    const suggestions: string[] = [];
    const suggestionMap = [
      {
        condition: !profile.firstName || !profile.lastName,
        message: 'Add your full name to personalize your profile',
      },
      {
        condition: !profile.bio,
        message: 'Add a bio to tell others about yourself',
      },
      {
        condition: !profile.avatarUrl,
        message: 'Upload a profile picture to make your profile more personal',
      },
      {
        condition: !profile.location,
        message: 'Add your location to connect with people nearby',
      },
      {
        condition: !profile.phoneNumber,
        message: 'Add your phone number for better account security',
      },
      {
        condition: !profile.dateOfBirth,
        message: 'Add your date of birth for personalized experiences',
      },
      {
        condition: !profile.socialLinks || Object.keys(profile.socialLinks).length === 0,
        message: 'Add social media links to connect with others',
      },
    ];

    suggestionMap.forEach(({ condition, message }) => {
      if (condition) {
        suggestions.push(message);
      }
    });

    return suggestions;
  }

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate
   * @returns boolean indicating if phone number is valid
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation - can be enhanced based on requirements
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phoneNumber);
  }
}
