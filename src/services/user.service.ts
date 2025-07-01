import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { UserProfile } from '../database/entities/user-profile.entity';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { UserSearchDto } from '../dto/user/user-search.dto';
import { UserRole, UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import {
  IUserService,
  UserStatistics,
  ValidationResult,
} from '../interfaces/services/user-service.interface';

import { LoggingService } from './logging.service';
import {
  calculateBasicStatistics,
  calculateTimeBasedStatistics,
  calculateSecurityStatistics,
  calculateDetailedStatistics,
} from './user-statistics.service';
import { PasswordService } from './authentication/password.service';

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
    private readonly passwordService: PasswordService,
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
      const queryBuilder = this.buildSearchQueryBuilder();
      this.applySearchFilters(queryBuilder, searchDto);
      this.applySortingAndPagination(queryBuilder, searchDto);

      const users = await queryBuilder.getMany();
      const page = searchDto.page || 1;
      const limit = searchDto.limit || 10;

      this.loggingService.debug('UserService: User search completed', {
        requestId,
        resultCount: users.length,
        page,
        limit,
      });

      return {
        users,
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit),
      };
    } catch (error) {
      this.loggingService.error('UserService: Failed to search users', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Build base search query builder
   */
  private buildSearchQueryBuilder(): SelectQueryBuilder<User> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.isDeleted = :isDeleted', { isDeleted: false });
  }

  /**
   * Apply search filters to query builder
   */
  private applySearchFilters(
    queryBuilder: SelectQueryBuilder<User>,
    searchDto: UserSearchDto,
  ): void {
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
  }

  /**
   * Apply sorting and pagination to query builder
   */
  private applySortingAndPagination(
    queryBuilder: SelectQueryBuilder<User>,
    searchDto: UserSearchDto,
  ): void {
    const sortField = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder as 'ASC' | 'DESC');

    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);
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

      await this.updateUserFields(user, updateUserDto, requestId);
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
   * Update user fields
   */
  private async updateUserFields(
    user: User,
    updateUserDto: UpdateUserDto,
    requestId: string,
  ): Promise<void> {
    await this.updateUserEmail(user, updateUserDto, requestId);
    this.updateUserBasicFields(user, updateUserDto);
    await this.updateUserPassword(user, updateUserDto);
  }

  /**
   * Update user email with validation
   */
  private async updateUserEmail(
    user: User,
    updateUserDto: UpdateUserDto,
    requestId: string,
  ): Promise<void> {
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.getUserByEmail(updateUserDto.email, requestId);
      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException('Email already in use');
      }
      user.email = updateUserDto.email;
    }
  }

  /**
   * Update user basic fields
   */
  private updateUserBasicFields(user: User, updateUserDto: UpdateUserDto): void {
    if (updateUserDto.role) {
      user.role = updateUserDto.role;
    }

    if (updateUserDto.status) {
      user.status = updateUserDto.status;
    }

    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }
  }

  /**
   * Update user password
   */
  private async updateUserPassword(user: User, updateUserDto: UpdateUserDto): Promise<void> {
    if (updateUserDto.password) {
      const saltRounds = 12;
      user.passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      user.passwordChangedAt = new Date();
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
      const hashedPassword = await this.passwordService.hashPassword(newPassword, requestId);
      const user = await this.userRepo.updatePassword(id, hashedPassword, requestId);

      this.loggingService.info('User password updated successfully', { requestId, userId: id });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to update user password', {
        requestId,
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Lock user account
   * @param userId - User ID
   * @param reason - Lock reason
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when lock is complete
   */
  async lockAccount(userId: string, reason: string, requestId: string): Promise<User> {
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

      const updatedUser = await this.userRepository.save(user);

      this.loggingService.debug('UserService: User account locked', {
        requestId,
        userId,
        reason,
      });

      return updatedUser;
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
   * @param userId - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when unlock is complete
   */
  async unlockAccount(userId: string, requestId: string): Promise<User> {
    this.loggingService.debug('UserService: Unlocking user account', { requestId, userId });

    try {
      const user = await this.getUserById(userId, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = UserStatus.ACTIVE;
      delete user.lockedAt;
      delete user.lockReason;
      user.isActive = true;
      user.failedLoginAttempts = 0;
      delete user.lastFailedLoginAt;

      const updatedUser = await this.userRepository.save(user);

      this.loggingService.debug('UserService: User account unlocked', {
        requestId,
        userId,
      });

      return updatedUser;
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
   * Activate user account
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when activation is complete
   */
  async activateUser(id: string, requestId: string): Promise<void> {
    this.loggingService.debug('UserService: Activating user account', { requestId, userId: id });

    try {
      const user = await this.getUserById(id, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = UserStatus.ACTIVE;
      user.isActive = true;

      await this.userRepository.save(user);

      this.loggingService.debug('UserService: User account activated', {
        requestId,
        userId: id,
      });
    } catch (error) {
      this.loggingService.error('UserService: Failed to activate user account', {
        requestId,
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Deactivate user account
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when deactivation is complete
   */
  async deactivateUser(id: string, requestId: string): Promise<void> {
    this.loggingService.debug('UserService: Deactivating user account', { requestId, userId: id });

    try {
      const user = await this.getUserById(id, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = UserStatus.INACTIVE;
      user.isActive = false;

      await this.userRepository.save(user);

      this.loggingService.debug('UserService: User account deactivated', {
        requestId,
        userId: id,
      });
    } catch (error) {
      this.loggingService.error('UserService: Failed to deactivate user account', {
        requestId,
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Suspend user account
   * @param id - User ID
   * @param reason - Suspension reason
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when suspension is complete
   */
  async suspendUser(id: string, reason: string, requestId: string): Promise<void> {
    this.loggingService.debug('UserService: Suspending user account', {
      requestId,
      userId: id,
      reason,
    });

    try {
      const user = await this.getUserById(id, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = UserStatus.SUSPENDED;
      user.isActive = false;

      await this.userRepository.save(user);

      this.loggingService.debug('UserService: User account suspended', {
        requestId,
        userId: id,
        reason,
      });
    } catch (error) {
      this.loggingService.error('UserService: Failed to suspend user account', {
        requestId,
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get comprehensive user statistics
   * @param requestId - Request identifier
   * @returns User statistics with detailed metrics
   */
  async getUserStatistics(requestId: string): Promise<UserStatistics> {
    this.loggingService.info('Getting comprehensive user statistics', { requestId });

    try {
      const allUsers = await this.userRepo.findAll(1, 10000, requestId);
      const users = allUsers.users;

      const basicStats = calculateBasicStatistics(users, allUsers.total);
      const timeBasedStats = calculateTimeBasedStatistics(users);
      const securityStats = calculateSecurityStatistics(users);
      const detailedStats = calculateDetailedStatistics(users);

      const statistics: UserStatistics = {
        ...basicStats,
        ...timeBasedStats,
        ...securityStats,
        ...detailedStats,
      };

      this.loggingService.info('Comprehensive user statistics retrieved successfully', {
        requestId,
        statistics: {
          totalUsers: statistics.totalUsers,
          activeUsers: statistics.activeUsers,
          verifiedUsers: statistics.verifiedUsers,
          recentRegistrations: statistics.recentRegistrations,
        },
      });

      return statistics;
    } catch (error) {
      this.loggingService.error('Failed to get user statistics', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
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

      this.validateUserEmail(userData, errors);
      this.validateUserRole(userData, errors);
      this.validateUserStatus(userData, errors);
      this.validatePasswordHash(userData, errors);

      const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings,
      };

      this.loggingService.debug('User data validation completed', { requestId, result });

      return result;
    } catch (error) {
      this.loggingService.error('User data validation failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Validate user email
   */
  private validateUserEmail(userData: Partial<User>, errors: string[]): void {
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Invalid email format');
      }
    }
  }

  /**
   * Validate user role
   */
  private validateUserRole(userData: Partial<User>, errors: string[]): void {
    if (userData.role && !Object.values(UserRole).includes(userData.role)) {
      errors.push('Invalid user role');
    }
  }

  /**
   * Validate user status
   */
  private validateUserStatus(userData: Partial<User>, errors: string[]): void {
    if (userData.status && !Object.values(UserStatus).includes(userData.status)) {
      errors.push('Invalid user status');
    }
  }

  /**
   * Validate password hash
   */
  private validatePasswordHash(userData: Partial<User>, errors: string[]): void {
    if (userData.passwordHash && userData.passwordHash.length < 8) {
      errors.push('Password hash must be at least 8 characters long');
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

      return this.checkModificationPermissions(admin.role, user.role);
    } catch (error) {
      this.loggingService.error('Failed to check user modification permissions', {
        requestId,
        userId,
        adminId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Check modification permissions based on admin and user roles
   * @param adminRole - Admin's role
   * @param userRole - User's role to be modified
   * @returns True if modification is allowed
   */
  private checkModificationPermissions(adminRole: UserRole, userRole: UserRole): boolean {
    if (adminRole === UserRole.SUPER_ADMIN) {
      return true;
    }

    if (adminRole === UserRole.ADMIN) {
      return userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN;
    }

    return false;
  }

  /**
   * Count users by role
   * @param users
   */

  /**
   * Count users by status
   * @param users
   */

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
        firstName: createUserDto.firstName || '',
        lastName: createUserDto.lastName || '',
        displayName: createUserDto.displayName || '',
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

  /**
   * Change user status
   * @param id - User ID
   * @param status - New status
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when change is complete
   */
  async changeStatus(id: string, status: UserStatus, requestId: string): Promise<User> {
    this.loggingService.info('Changing user status', { requestId, userId: id, status });

    try {
      const user = await this.getUserById(id, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.status = status;
      const updatedUser = await this.userRepository.save(user);

      this.loggingService.info('User status changed successfully', {
        requestId,
        userId: id,
        status,
      });

      return updatedUser;
    } catch (error) {
      this.loggingService.error('Failed to change user status', {
        requestId,
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Change user role
   * @param id - User ID
   * @param role - New role
   * @param requestId - Request ID for tracking
   * @returns Promise resolving when change is complete
   */
  async changeRole(id: string, role: UserRole, requestId: string): Promise<User> {
    this.loggingService.info('Changing user role', { requestId, userId: id, role });

    try {
      const user = await this.getUserById(id, requestId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.role = role;
      const updatedUser = await this.userRepository.save(user);

      this.loggingService.info('User role changed successfully', {
        requestId,
        userId: id,
        role,
      });

      return updatedUser;
    } catch (error) {
      this.loggingService.error('Failed to change user role', {
        requestId,
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Check if user exists
   * @param id - User ID
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to boolean
   */
  async userExists(id: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Checking if user exists', { requestId, userId: id });

    try {
      const user = await this.getUserById(id, requestId);
      const exists = user !== null;

      this.loggingService.debug('User existence check completed', {
        requestId,
        userId: id,
        exists,
      });

      return exists;
    } catch (error) {
      this.loggingService.error('Failed to check user existence', {
        requestId,
        userId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Check if email is available
   * @param email - Email to check
   * @param requestId - Request ID for tracking
   * @returns Promise resolving to boolean
   */
  async isEmailAvailable(email: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Checking if email is available', { requestId, email });

    try {
      const exists = await this.emailExists(email, requestId);
      const available = !exists;

      this.loggingService.debug('Email availability check completed', {
        requestId,
        email,
        available,
      });

      return available;
    } catch (error) {
      this.loggingService.error('Failed to check email availability', {
        requestId,
        email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}
