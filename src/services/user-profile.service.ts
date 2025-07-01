import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserProfileMethods } from '../database/entities/user-profile-methods.entity';
import { UserProfile } from '../database/entities/user-profile.entity';
import { CreateProfileDto } from '../dto/user/create-profile.dto';
import { ProfileSearchDto } from '../dto/user/profile-search.dto';
import { UpdateProfileDto } from '../dto/user/update-profile.dto';
import { UserProfileVisibility } from '../interfaces/enums/user.enum';
import { IUserProfileRepository } from '../interfaces/repositories/user-profile-repository.interface';
import { IUserProfileService } from '../interfaces/services/user-profile-service.interface';

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
    private readonly userProfileRepo: IUserProfileRepository,
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
      // Check if profile already exists
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

      // Create profile data
      const profileData = {
        userId,
        firstName: createProfileDto.firstName,
        lastName: createProfileDto.lastName,
        displayName: createProfileDto.displayName,
        bio: createProfileDto.bio,
        phoneNumber: createProfileDto.phoneNumber,
        dateOfBirth: createProfileDto.dateOfBirth,
        location: createProfileDto.location,
        timezone: createProfileDto.timezone,
        language: createProfileDto.language,
        avatarUrl: createProfileDto.avatarUrl,
        coverImageUrl: createProfileDto.coverImageUrl,
        visibility: createProfileDto.visibility || UserProfileVisibility.PUBLIC,
        preferences: createProfileDto.preferences,
        socialLinks: createProfileDto.socialLinks,
        isPublicProfile: createProfileDto.isPublicProfile || false,
      };

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

      // Update profile fields
      if (updateProfileDto.firstName !== undefined) {
        profile.firstName = updateProfileDto.firstName;
      }

      if (updateProfileDto.lastName !== undefined) {
        profile.lastName = updateProfileDto.lastName;
      }

      if (updateProfileDto.displayName !== undefined) {
        profile.displayName = updateProfileDto.displayName;
      }

      if (updateProfileDto.bio !== undefined) {
        profile.bio = updateProfileDto.bio;
      }

      if (updateProfileDto.phoneNumber !== undefined) {
        profile.phoneNumber = updateProfileDto.phoneNumber;
      }

      if (updateProfileDto.dateOfBirth !== undefined) {
        profile.dateOfBirth = updateProfileDto.dateOfBirth;
      }

      if (updateProfileDto.location !== undefined) {
        profile.location = updateProfileDto.location;
      }

      if (updateProfileDto.timezone !== undefined) {
        profile.timezone = updateProfileDto.timezone;
      }

      if (updateProfileDto.language !== undefined) {
        profile.language = updateProfileDto.language;
      }

      if (updateProfileDto.avatarUrl !== undefined) {
        profile.avatarUrl = updateProfileDto.avatarUrl;
      }

      if (updateProfileDto.coverImageUrl !== undefined) {
        profile.coverImageUrl = updateProfileDto.coverImageUrl;
      }

      if (updateProfileDto.visibility !== undefined) {
        profile.visibility = updateProfileDto.visibility;
      }

      if (updateProfileDto.isPublicProfile !== undefined) {
        profile.isPublicProfile = updateProfileDto.isPublicProfile;
      }

      // Update preferences if provided
      if (updateProfileDto.preferences) {
        profile.preferences = { ...profile.preferences, ...updateProfileDto.preferences };
      }

      // Update social links if provided
      if (updateProfileDto.socialLinks) {
        profile.socialLinks = { ...profile.socialLinks, ...updateProfileDto.socialLinks };
      }

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
      const queryBuilder = this.userProfileRepository
        .createQueryBuilder('profile')
        .where('profile.isDeleted = :isDeleted', { isDeleted: false });

      // Apply search filters
      if (searchDto.firstName) {
        queryBuilder.andWhere('profile.firstName ILIKE :firstName', {
          firstName: `%${searchDto.firstName}%`,
        });
      }

      if (searchDto.lastName) {
        queryBuilder.andWhere('profile.lastName ILIKE :lastName', {
          lastName: `%${searchDto.lastName}%`,
        });
      }

      if (searchDto.displayName) {
        queryBuilder.andWhere('profile.displayName ILIKE :displayName', {
          displayName: `%${searchDto.displayName}%`,
        });
      }

      if (searchDto.location) {
        queryBuilder.andWhere('profile.location ILIKE :location', {
          location: `%${searchDto.location}%`,
        });
      }

      if (searchDto.language) {
        queryBuilder.andWhere('profile.language = :language', { language: searchDto.language });
      }

      if (searchDto.visibility) {
        queryBuilder.andWhere('profile.visibility = :visibility', {
          visibility: searchDto.visibility,
        });
      }

      if (searchDto.isPublicProfile !== undefined) {
        queryBuilder.andWhere('profile.isPublicProfile = :isPublicProfile', {
          isPublicProfile: searchDto.isPublicProfile,
        });
      }

      // Apply sorting
      const sortField = searchDto.sortBy || 'createdAt';
      const sortOrder = searchDto.sortOrder || 'DESC';
      queryBuilder.orderBy(`profile.${sortField}`, sortOrder as 'ASC' | 'DESC');

      // Apply pagination
      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const profiles = await queryBuilder.getMany();

      this.loggingService.debug('UserProfileService: Profile search completed', {
        requestId,
        resultCount: profiles.length,
        page,
        limit,
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
    this.loggingService.debug('Getting profiles by completion status', {
      requestId,
      isComplete,
    });

    try {
      const profiles = await this.userProfileRepository.find({
        where: { tenantId: 'default', isDeleted: false },
      });

      const filteredProfiles = profiles.filter(profile => {
        const profileMethods = new UserProfileMethods(profile);
        return profileMethods.isComplete() === isComplete;
      });

      this.loggingService.debug('Profiles filtered by completion status', {
        requestId,
        isComplete,
        count: filteredProfiles.length,
      });

      return filteredProfiles;
    } catch (error) {
      this.loggingService.error('Failed to get profiles by completion status', {
        requestId,
        isComplete,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
