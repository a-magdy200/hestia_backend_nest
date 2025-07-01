import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { UserProfile } from '../database/entities/user-profile.entity';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { UserSearchDto } from '../dto/user/user-search.dto';
import { UserRole, UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';
import { IUserProfileRepository } from '../interfaces/repositories/user-profile-repository.interface';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import {
  IUserService,
  UserStatistics,
  ValidationResult,
} from '../interfaces/services/user-service.interface';

import { LoggingService } from './logging.service';

/**
 * User service implementation
 * Provides comprehensive user management functionality
 */
@Injectable()
export class UserService implements IUserService {
  /**
   *
   * @param userRepository
   * @param userProfileRepository
   * @param userRepo
   * @param userProfileRepo
   * @param loggingService
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly userRepo: IUserRepository,

    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Create a new user
   * @param createUserDto
   * @param requestId
   */
  async createUser(createUserDto: CreateUserDto, requestId: string): Promise<User> {
    this.loggingService.debug('UserService: Creating new user', {
      requestId,
      email: createUserDto.email,
    });

    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        this.loggingService.warn('UserService: User already exists', {
          requestId,
          email: createUserDto.email,
        });
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

      // Create user entity
      const userData = {
        email: createUserDto.email,
        passwordHash,
        role: createUserDto.role || UserRole.USER,
        status: UserStatus.PENDING_VERIFICATION,
        emailVerificationStatus: UserVerificationStatus.UNVERIFIED,
        ...(createUserDto.tenantId && { tenantId: createUserDto.tenantId }),
      };

      const user = this.userRepository.create(userData);

      // Save user
      const savedUser = await this.userRepository.save(user);

      // Create user profile
      await this.createUserProfile(savedUser.id, createUserDto, requestId);

      this.loggingService.debug('UserService: User created successfully', {
        requestId,
        userId: savedUser.id,
        email: savedUser.email,
      });

      return savedUser;
    } catch (error) {
      this.loggingService.error('UserService: Failed to create user', {
        requestId,
        email: createUserDto.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param userId
   * @param requestId
   */
  async getUserById(userId: string, requestId: string): Promise<User | null> {
    this.loggingService.debug('UserService: Getting user by ID', { requestId, userId });

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isDeleted: false },
        relations: ['profile'],
      });

      if (!user) {
        this.loggingService.warn('UserService: User not found', { requestId, userId });
        return null;
      }

      return user;
    } catch (error) {
      this.loggingService.error('UserService: Failed to get user by ID', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get user by email
   * @param email
   * @param requestId
   */
  async getUserByEmail(email: string, requestId: string): Promise<User | null> {
    this.loggingService.debug('UserService: Getting user by email', { requestId, email });

    try {
      const user = await this.userRepository.findOne({
        where: { email, isDeleted: false },
        relations: ['profile'],
      });

      if (!user) {
        this.loggingService.warn('UserService: User not found by email', { requestId, email });
        return null;
      }

      return user;
    } catch (error) {
      this.loggingService.error('UserService: Failed to get user by email', {
        requestId,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get users by tenant ID
   * @param tenantId
   * @param requestId
   */
  async getUsersByTenantId(tenantId: string, requestId: string): Promise<User[]> {
    this.loggingService.info('Getting users by tenant ID', { requestId, tenantId });

    try {
      const users = await this.userRepo.findByTenantId(tenantId, requestId);

      this.loggingService.info('Users retrieved by tenant ID', {
        requestId,
        tenantId,
        count: users.length,
      });

      return users;
    } catch (error) {
      this.loggingService.error('Failed to get users by tenant ID', {
        requestId,
        tenantId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get users by role
   * @param role
   * @param requestId
   */
  async getUsersByRole(role: UserRole, requestId: string): Promise<User[]> {
    this.loggingService.info('Getting users by role', { requestId, role });

    try {
      const users = await this.userRepo.findByRole(role, requestId);

      this.loggingService.info('Users retrieved by role', {
        requestId,
        role,
        count: users.length,
      });

      return users;
    } catch (error) {
      this.loggingService.error('Failed to get users by role', {
        requestId,
        role,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get users by status
   * @param status
   * @param requestId
   */
  async getUsersByStatus(status: UserStatus, requestId: string): Promise<User[]> {
    this.loggingService.info('Getting users by status', { requestId, status });

    try {
      const users = await this.userRepo.findByStatus(status, requestId);

      this.loggingService.info('Users retrieved by status', {
        requestId,
        status,
        count: users.length,
      });

      return users;
    } catch (error) {
      this.loggingService.error('Failed to get users by status', {
        requestId,
        status,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all users with pagination
   * @param page
   * @param limit
   * @param requestId
   */
  async getAllUsers(
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> {
    this.loggingService.info('Getting all users with pagination', { requestId, page, limit });

    try {
      const result = await this.userRepo.findAll(page, limit, requestId);

      this.loggingService.info('All users retrieved with pagination', {
        requestId,
        page,
        limit,
        count: result.users.length,
        total: result.total,
      });

      return {
        users: result.users,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      this.loggingService.error('Failed to get all users', {
        requestId,
        page,
        limit,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Search users
   * @param searchDto
   * @param requestId
   */
  async searchUsers(
    searchDto: UserSearchDto,
    requestId: string,
  ): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> {
    this.loggingService.debug('UserService: Searching users', {
      requestId,
      searchCriteria: searchDto,
    });

    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .where('user.isDeleted = :isDeleted', { isDeleted: false });

      // Apply search filters
      if (searchDto.email) {
        queryBuilder.andWhere('user.email ILIKE :email', { email: `%${searchDto.email}%` });
      }

      if (searchDto.role) {
        queryBuilder.andWhere('user.role = :role', { role: searchDto.role });
      }

      if (searchDto.status) {
        queryBuilder.andWhere('user.status = :status', { status: searchDto.status });
      }

      if (searchDto.isActive !== undefined) {
        queryBuilder.andWhere('user.isActive = :isActive', { isActive: searchDto.isActive });
      }

      if (searchDto.tenantId) {
        queryBuilder.andWhere('user.tenantId = :tenantId', { tenantId: searchDto.tenantId });
      }

      // Apply sorting
      const sortField = searchDto.sortBy || 'createdAt';
      const sortOrder = searchDto.sortOrder || 'DESC';
      queryBuilder.orderBy(`user.${sortField}`, sortOrder as 'ASC' | 'DESC');

      // Apply pagination
      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;
      const offset = (page - 1) * limit;

      queryBuilder.skip(offset).take(limit);

      const users = await queryBuilder.getMany();

      this.loggingService.debug('UserService: User search completed', {
        requestId,
        resultCount: users.length,
        page,
        limit,
      });

      return users;
    } catch (error) {
      this.loggingService.error('UserService: Failed to search users', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update user
   * @param userId
   * @param updateUserDto
   * @param requestId
   */
  async updateUser(userId: string, updateUserDto: UpdateUserDto, requestId: string): Promise<User> {
    this.loggingService.debug('UserService: Updating user', { requestId, userId });

    try {
      const user = await this.getUserById(userId, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user fields
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        // Check if new email already exists
        const existingUser = await this.getUserByEmail(updateUserDto.email, requestId);
        if (existingUser && existingUser.id !== userId) {
          throw new ConflictException('Email already in use');
        }
        user.email = updateUserDto.email;
      }

      if (updateUserDto.role) {
        user.role = updateUserDto.role;
      }

      if (updateUserDto.status) {
        user.status = updateUserDto.status;
      }

      if (updateUserDto.isActive !== undefined) {
        user.isActive = updateUserDto.isActive;
      }

      // Update password if provided
      if (updateUserDto.password) {
        const saltRounds = 12;
        user.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
        user.passwordChangedAt = new Date();
      }

      const updatedUser = await this.userRepository.save(user);

      this.loggingService.debug('UserService: User updated successfully', {
        requestId,
        userId,
        updatedFields: Object.keys(updateUserDto),
      });

      return updatedUser;
    } catch (error) {
      this.loggingService.error('UserService: Failed to update user', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   * @param userId
   * @param requestId
   */
  async deleteUser(userId: string, requestId: string): Promise<void> {
    this.loggingService.debug('UserService: Deleting user', { requestId, userId });

    try {
      const user = await this.getUserById(userId, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Soft delete user
      user.isDeleted = true;
      user.isActive = false;
      user.status = UserStatus.INACTIVE;

      await this.userRepository.save(user);

      this.loggingService.debug('UserService: User deleted successfully', {
        requestId,
        userId,
      });
    } catch (error) {
      this.loggingService.error('UserService: Failed to delete user', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Hard delete user
   * @param id
   * @param requestId
   */
  async hardDeleteUser(id: string, requestId: string): Promise<boolean> {
    this.loggingService.info('Starting hard user deletion', { requestId, userId: id });

    try {
      // Check if user exists
      const existingUser = await this.userRepo.findById(id, requestId);
      if (!existingUser) {
        this.loggingService.warn('Hard user deletion failed: User not found', {
          requestId,
          userId: id,
        });
        throw new NotFoundException('User not found');
      }

      // Hard delete user
      const success = await this.userRepo.hardDelete(id, requestId);

      if (success) {
        this.loggingService.info('User hard deleted successfully', { requestId, userId: id });
      } else {
        this.loggingService.warn('User hard deletion failed', { requestId, userId: id });
      }

      return success;
    } catch (error) {
      this.loggingService.error('Hard user deletion failed', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Restore deleted user
   * @param id
   * @param requestId
   */
  async restoreUser(id: string, requestId: string): Promise<User> {
    this.loggingService.info('Starting user restoration', { requestId, userId: id });

    try {
      // Restore user
      const restoredUser = await this.userRepo.update(id, { isDeleted: false }, requestId);

      this.loggingService.info('User restored successfully', {
        requestId,
        userId: id,
        email: restoredUser.email,
      });

      return restoredUser;
    } catch (error) {
      this.loggingService.error('User restoration failed', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if email exists
   * @param email
   * @param requestId
   */
  async emailExists(email: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Checking if email exists', { requestId, email });

    try {
      const exists = await this.userRepo.emailExists(email, requestId);

      this.loggingService.debug('Email existence check completed', { requestId, email, exists });

      return exists;
    } catch (error) {
      this.loggingService.error('Email existence check failed', {
        requestId,
        email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update user last login
   * @param userId
   * @param requestId
   */
  async updateLastLogin(userId: string, requestId: string): Promise<void> {
    this.loggingService.debug('UserService: Updating last login', { requestId, userId });

    try {
      await this.userRepository.update(userId, {
        lastLoginAt: new Date(),
      });

      this.loggingService.debug('UserService: Last login updated', { requestId, userId });
    } catch (error) {
      this.loggingService.error('UserService: Failed to update last login', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Don't throw error for last login update failures
    }
  }

  /**
   * Update user password
   * @param id
   * @param passwordHash
   * @param requestId
   */
  async updatePassword(id: string, newPassword: string, requestId: string): Promise<User> {
    this.loggingService.info('Updating user password', { requestId, userId: id });

    try {
      const hashedPassword = await this.passwordService.hashPassword(newPassword);
      const user = await this.userRepo.updatePassword(id, hashedPassword, requestId);

      this.loggingService.info('User password updated successfully', { requestId, userId: id });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to update user password', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Mark user email as verified
   * @param userId
   * @param requestId
   */
  async markEmailAsVerified(userId: string, requestId: string): Promise<void> {
    this.loggingService.debug('UserService: Marking email as verified', { requestId, userId });

    try {
      const user = await this.getUserById(userId, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.emailVerificationStatus = UserVerificationStatus.VERIFIED;
      user.emailVerifiedAt = new Date();

      if (user.status === UserStatus.PENDING_VERIFICATION) {
        user.status = UserStatus.ACTIVE;
      }

      await this.userRepository.save(user);

      this.loggingService.debug('UserService: Email marked as verified', {
        requestId,
        userId,
      });
    } catch (error) {
      this.loggingService.error('UserService: Failed to mark email as verified', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Increment failed login attempts
   * @param id
   * @param requestId
   */
  async incrementFailedLoginAttempts(id: string, requestId: string): Promise<User> {
    this.loggingService.debug('Incrementing failed login attempts', { requestId, userId: id });

    try {
      const user = await this.userRepo.incrementFailedLoginAttempts(id, requestId);

      this.loggingService.debug('Failed login attempts incremented successfully', {
        requestId,
        userId: id,
        failedAttempts: user.failedLoginAttempts,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to increment login attempts', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Reset failed login attempts
   * @param id
   * @param requestId
   */
  async resetFailedLoginAttempts(id: string, requestId: string): Promise<User> {
    this.loggingService.debug('Resetting failed login attempts', { requestId, userId: id });

    try {
      const user = await this.userRepo.resetFailedLoginAttempts(id, requestId);

      this.loggingService.debug('Failed login attempts reset successfully', {
        requestId,
        userId: id,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to reset login attempts', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Lock user account
   * @param userId
   * @param reason
   * @param requestId
   */
  async lockUserAccount(userId: string, reason: string, requestId: string): Promise<void> {
    this.loggingService.debug('UserService: Locking user account', { requestId, userId, reason });

    try {
      const user = await this.getUserById(userId, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = UserStatus.LOCKED;
      user.lockedAt = new Date();
      user.lockReason = reason;
      user.isActive = false;

      await this.userRepository.save(user);

      this.loggingService.debug('UserService: User account locked', {
        requestId,
        userId,
        reason,
      });
    } catch (error) {
      this.loggingService.error('UserService: Failed to lock user account', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Unlock user account
   * @param userId
   * @param requestId
   */
  async unlockUserAccount(userId: string, requestId: string): Promise<void> {
    this.loggingService.debug('UserService: Unlocking user account', { requestId, userId });

    try {
      const user = await this.getUserById(userId, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = UserStatus.ACTIVE;
      user.lockedAt = undefined;
      user.lockReason = undefined;
      user.isActive = true;
      user.failedLoginAttempts = 0;
      user.lastFailedLoginAt = undefined;

      await this.userRepository.save(user);

      this.loggingService.debug('UserService: User account unlocked', {
        requestId,
        userId,
      });
    } catch (error) {
      this.loggingService.error('UserService: Failed to unlock user account', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Change user status
   * @param id
   * @param status
   * @param requestId
   */
  async changeStatus(id: string, status: UserStatus, requestId: string): Promise<User> {
    this.loggingService.info('Changing user status', { requestId, userId: id, status });

    try {
      const user = await this.userRepo.changeStatus(id, status, requestId);

      this.loggingService.info('User status changed successfully', {
        requestId,
        userId: id,
        status,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to change user status', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Change user role
   * @param id
   * @param role
   * @param requestId
   */
  async changeRole(id: string, role: UserRole, requestId: string): Promise<User> {
    this.loggingService.info('Changing user role', { requestId, userId: id, role });

    try {
      const user = await this.userRepo.changeRole(id, role, requestId);

      this.loggingService.info('User role changed successfully', { requestId, userId: id, role });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to change user role', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Activate user account
   * @param id
   * @param requestId
   */
  async activateAccount(id: string, requestId: string): Promise<User> {
    this.loggingService.info('Activating user account', { requestId, userId: id });

    try {
      const user = await this.changeStatus(id, UserStatus.ACTIVE, requestId);

      this.loggingService.info('User account activated successfully', { requestId, userId: id });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to activate user account', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Deactivate user account
   * @param id
   * @param requestId
   */
  async deactivateAccount(id: string, requestId: string): Promise<User> {
    this.loggingService.info('Deactivating user account', { requestId, userId: id });

    try {
      const user = await this.changeStatus(id, UserStatus.INACTIVE, requestId);

      this.loggingService.info('User account deactivated successfully', { requestId, userId: id });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to deactivate user account', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Suspend user account
   * @param id
   * @param reason
   * @param requestId
   */
  async suspendAccount(id: string, reason: string, requestId: string): Promise<User> {
    this.loggingService.info('Suspending user account', { requestId, userId: id, reason });

    try {
      const user = await this.changeStatus(id, UserStatus.SUSPENDED, requestId);

      this.loggingService.info('User account suspended successfully', {
        requestId,
        userId: id,
        reason,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to suspend user account', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get user statistics
   * @param requestId
   */
  async getUserStatistics(requestId: string): Promise<UserStatistics> {
    this.loggingService.info('Getting user statistics', { requestId });

    try {
      // In a real implementation, you would aggregate statistics from the database
      // For now, we'll return basic statistics
      const allUsers = await this.userRepo.findAll(1, 1000, requestId);

      const statistics: UserStatistics = {
        totalUsers: allUsers.total,
        activeUsers: allUsers.users.filter(u => u.status === UserStatus.ACTIVE).length,
        inactiveUsers: allUsers.users.filter(u => u.status === UserStatus.INACTIVE).length,
        suspendedUsers: allUsers.users.filter(u => u.status === UserStatus.SUSPENDED).length,
        lockedUsers: allUsers.users.filter(u => u.status === UserStatus.LOCKED).length,
        verifiedUsers: allUsers.users.filter(u => u.emailVerificationStatus === 'verified').length,
        unverifiedUsers: allUsers.users.filter(u => u.emailVerificationStatus === 'unverified')
          .length,
        usersByRole: this.countUsersByRole(allUsers.users),
        usersByStatus: this.countUsersByStatus(allUsers.users),
        recentUsers: allUsers.users.filter(u => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return u.createdAt >= thirtyDaysAgo;
        }).length,
        activeUsersLast30Days: allUsers.users.filter(u => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return u.lastLoginAt && u.lastLoginAt >= thirtyDaysAgo;
        }).length,
      };

      this.loggingService.info('User statistics retrieved successfully', { requestId, statistics });

      return statistics;
    } catch (error) {
      this.loggingService.error('Failed to get user statistics', {
        requestId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Validate user data
   * @param userData
   * @param requestId
   */
  async validateUserData(userData: Partial<User>, requestId: string): Promise<ValidationResult> {
    this.loggingService.debug('Validating user data', { requestId, userData });

    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate email
      if (userData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          errors.push('Invalid email format');
        }
      }

      // Validate role
      if (userData.role && !Object.values(UserRole).includes(userData.role)) {
        errors.push('Invalid user role');
      }

      // Validate status
      if (userData.status && !Object.values(UserStatus).includes(userData.status)) {
        errors.push('Invalid user status');
      }

      // Validate password hash
      if (userData.passwordHash && userData.passwordHash.length < 8) {
        errors.push('Password hash must be at least 8 characters long');
      }

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
      };

      this.loggingService.debug('User data validation completed', { requestId, result });

      return result;
    } catch (error) {
      this.loggingService.error('User data validation failed', { requestId, error: error.message });
      throw error;
    }
  }

  /**
   * Check if user can be modified by admin
   * @param userId
   * @param adminId
   * @param requestId
   */
  async canModifyUser(userId: string, adminId: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Checking if user can be modified by admin', {
      requestId,
      userId,
      adminId,
    });

    try {
      const user = await this.userRepo.findById(userId, requestId);
      const admin = await this.userRepo.findById(adminId, requestId);

      if (!user || !admin) {
        this.loggingService.warn('Cannot modify user: User or admin not found', {
          requestId,
          userId,
          adminId,
        });
        return false;
      }

      // Super admin can modify anyone
      if (admin.role === UserRole.SUPER_ADMIN) {
        return true;
      }

      // Admin can modify users but not other admins or super admins
      if (admin.role === UserRole.ADMIN) {
        return user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN;
      }

      // Regular users cannot modify other users
      return false;
    } catch (error) {
      this.loggingService.error('Failed to check user modification permissions', {
        requestId,
        userId,
        adminId,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Count users by role
   * @param users
   */
  private countUsersByRole(users: User[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const user of users) {
      counts[user.role] = (counts[user.role] || 0) + 1;
    }

    return counts;
  }

  /**
   * Count users by status
   * @param users
   */
  private countUsersByStatus(users: User[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const user of users) {
      counts[user.status] = (counts[user.status] || 0) + 1;
    }

    return counts;
  }

  /**
   * Create user profile
   * @param userId
   * @param createUserDto
   * @param requestId
   */
  private async createUserProfile(
    userId: string,
    createUserDto: CreateUserDto,
    requestId: string,
  ): Promise<UserProfile> {
    this.loggingService.debug('UserService: Creating user profile', { requestId, userId });

    try {
      const profile = this.userProfileRepository.create({
        userId,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        displayName: createUserDto.displayName,
      });

      const savedProfile = await this.userProfileRepository.save(profile);

      this.loggingService.debug('UserService: User profile created', { requestId, userId });

      return savedProfile;
    } catch (error) {
      this.loggingService.error('UserService: Failed to create user profile', {
        requestId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
