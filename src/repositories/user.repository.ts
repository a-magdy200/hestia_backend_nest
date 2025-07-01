import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { UserMethods } from '../database/entities/user-methods.entity';
import { User } from '../database/entities/user.entity';
import { UserRole, UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';
import {
  IUserRepository,
  UserSearchCriteria,
} from '../interfaces/repositories/user-repository.interface';
import { LoggingService } from '../services/logging.service';

/**
 * User repository implementation
 * Handles database operations for user entities with caching and error handling
 */
@Injectable()
export class UserRepository implements IUserRepository {
  /**
   *
   * @param userRepository
   * @param loggingService
   */
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Create new user
   * @param userData
   * @param requestId
   */
  async create(userData: Partial<User>, requestId: string): Promise<User> {
    this.loggingService.debug('Creating user in database', { requestId, userData });

    try {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);

      this.loggingService.debug('User created successfully in database', {
        requestId,
        userId: savedUser.id,
      });

      return savedUser;
    } catch (error) {
      this.loggingService.error('Failed to create user in database', {
        requestId,
        userData,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param id
   * @param requestId
   */
  async findById(id: string, requestId: string): Promise<User | null> {
    this.loggingService.debug('Finding user by ID in database', { requestId, userId: id });

    try {
      const user = await this.userRepository.findOne({
        where: { id, isDeleted: false },
        relations: ['profile'],
      });

      if (user) {
        this.loggingService.debug('User found by ID in database', { requestId, userId: id });
      } else {
        this.loggingService.debug('User not found by ID in database', { requestId, userId: id });
      }

      return user;
    } catch (error) {
      this.loggingService.error('Failed to find user by ID in database', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find user by email
   * @param email
   * @param requestId
   */
  async findByEmail(email: string, requestId: string): Promise<User | null> {
    this.loggingService.debug('Finding user by email in database', { requestId, email });

    try {
      const user = await this.userRepository.findOne({
        where: { email, isDeleted: false },
        relations: ['profile'],
      });

      if (user) {
        this.loggingService.debug('User found by email in database', {
          requestId,
          email,
          userId: user.id,
        });
      } else {
        this.loggingService.debug('User not found by email in database', { requestId, email });
      }

      return user;
    } catch (error) {
      this.loggingService.error('Failed to find user by email in database', {
        requestId,
        email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find users by tenant ID
   * @param tenantId
   * @param requestId
   */
  async findByTenantId(tenantId: string, requestId: string): Promise<User[]> {
    this.loggingService.debug('Finding users by tenant ID in database', { requestId, tenantId });

    try {
      const users = await this.userRepository.find({
        where: { tenantId, isDeleted: false },
        relations: ['profile'],
        order: { createdAt: 'DESC' },
      });

      this.loggingService.debug('Users found by tenant ID in database', {
        requestId,
        tenantId,
        count: users.length,
      });

      return users;
    } catch (error) {
      this.loggingService.error('Failed to find users by tenant ID in database', {
        requestId,
        tenantId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find users by role
   * @param role
   * @param requestId
   */
  async findByRole(role: UserRole, requestId: string): Promise<User[]> {
    this.loggingService.debug('Finding users by role in database', { requestId, role });

    try {
      const users = await this.userRepository.find({
        where: { role, isDeleted: false },
        relations: ['profile'],
        order: { createdAt: 'DESC' },
      });

      this.loggingService.debug('Users found by role in database', {
        requestId,
        role,
        count: users.length,
      });

      return users;
    } catch (error) {
      this.loggingService.error('Failed to find users by role in database', {
        requestId,
        role,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find users by status
   * @param status
   * @param requestId
   */
  async findByStatus(status: UserStatus, requestId: string): Promise<User[]> {
    this.loggingService.debug('Finding users by status in database', { requestId, status });

    try {
      const users = await this.userRepository.find({
        where: { status, isDeleted: false },
        relations: ['profile'],
        order: { createdAt: 'DESC' },
      });

      this.loggingService.debug('Users found by status in database', {
        requestId,
        status,
        count: users.length,
      });

      return users;
    } catch (error) {
      this.loggingService.error('Failed to find users by status in database', {
        requestId,
        status,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Find all users with pagination
   * @param page
   * @param limit
   * @param requestId
   */
  async findAll(
    page: number,
    limit: number,
    requestId: string,
  ): Promise<{ users: User[]; total: number }> {
    this.loggingService.debug('Finding all users with pagination in database', {
      requestId,
      page,
      limit,
    });

    try {
      const [users, total] = await this.userRepository.findAndCount({
        where: { isDeleted: false },
        relations: ['profile'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      this.loggingService.debug('All users found with pagination in database', {
        requestId,
        page,
        limit,
        count: users.length,
        total,
      });

      return { users, total };
    } catch (error) {
      this.loggingService.error('Failed to find all users in database', {
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
   * @param criteria
   * @param requestId
   */
  async searchUsers(criteria: UserSearchCriteria, requestId: string): Promise<User[]> {
    this.loggingService.debug('Searching users in database', { requestId, criteria });

    try {
      const queryBuilder = this.createSearchQueryBuilder(criteria);
      const users = await queryBuilder.getMany();

      this.loggingService.debug('Users search completed in database', {
        requestId,
        criteria,
        count: users.length,
      });

      return users;
    } catch (error) {
      this.loggingService.error('Failed to search users in database', {
        requestId,
        criteria,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update user
   * @param id
   * @param userData
   * @param requestId
   */
  async update(id: string, userData: Partial<User>, requestId: string): Promise<User> {
    this.loggingService.debug('Updating user in database', { requestId, userId: id, userData });

    try {
      await this.userRepository.update(id, userData);
      const updatedUser = await this.findById(id, requestId);

      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      this.loggingService.debug('User updated successfully in database', { requestId, userId: id });

      return updatedUser;
    } catch (error) {
      this.loggingService.error('Failed to update user in database', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   * @param id
   * @param requestId
   */
  async delete(id: string, requestId: string): Promise<User> {
    this.loggingService.debug('Soft deleting user in database', { requestId, userId: id });

    try {
      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found');
      }

      user.isDeleted = true;
      user.isActive = false;
      user.status = UserStatus.INACTIVE;

      const deletedUser = await this.userRepository.save(user);

      this.loggingService.debug('User soft deleted successfully in database', {
        requestId,
        userId: id,
      });

      return deletedUser;
    } catch (error) {
      this.loggingService.error('Failed to soft delete user in database', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Hard delete user
   * @param id
   * @param requestId
   */
  async hardDelete(id: string, requestId: string): Promise<boolean> {
    this.loggingService.debug('Hard deleting user in database', { requestId, userId: id });

    try {
      const result = await this.userRepository.delete(id);
      const success = result.affected > 0;

      this.loggingService.debug('User hard delete completed in database', {
        requestId,
        userId: id,
        success,
      });

      return success;
    } catch (error) {
      this.loggingService.error('Failed to hard delete user in database', {
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
    this.loggingService.debug('Checking if email exists in database', { requestId, email });

    try {
      const count = await this.userRepository.count({
        where: { email, isDeleted: false },
      });

      const exists = count > 0;

      this.loggingService.debug('Email existence check completed in database', {
        requestId,
        email,
        exists,
      });

      return exists;
    } catch (error) {
      this.loggingService.error('Failed to check email existence in database', {
        requestId,
        email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update user last login
   * @param id
   * @param requestId
   */
  async updateLastLogin(id: string, requestId: string): Promise<User> {
    this.loggingService.debug('Updating user last login in database', { requestId, userId: id });

    try {
      await this.userRepository.update(id, {
        lastLoginAt: new Date(),
      });

      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found after last login update');
      }

      this.loggingService.debug('User last login updated successfully in database', {
        requestId,
        userId: id,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to update user last login in database', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update user password
   * @param id
   * @param passwordHash
   * @param requestId
   */
  async updatePassword(id: string, passwordHash: string, requestId: string): Promise<User> {
    this.loggingService.debug('Updating user password in database', { requestId, userId: id });

    try {
      await this.userRepository.update(id, {
        passwordHash,
        passwordChangedAt: new Date(),
      });

      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found after password update');
      }

      this.loggingService.debug('User password updated successfully in database', {
        requestId,
        userId: id,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to update user password in database', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Mark email as verified
   * @param id
   * @param requestId
   */
  async markEmailAsVerified(id: string, requestId: string): Promise<User> {
    this.loggingService.debug('Marking user email as verified in database', {
      requestId,
      userId: id,
    });

    try {
      await this.userRepository.update(id, {
        emailVerificationStatus: UserVerificationStatus.VERIFIED,
        emailVerifiedAt: new Date(),
      });

      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found after email verification');
      }

      this.loggingService.debug('User email marked as verified successfully in database', {
        requestId,
        userId: id,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to mark user email as verified in database', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Increment failed login attempts
   * @param id
   * @param requestId
   */
  async incrementFailedLoginAttempts(id: string, requestId: string): Promise<void> {
    this.loggingService.debug('Incrementing failed login attempts for user', {
      requestId,
      userId: id,
    });

    try {
      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found');
      }

      const userMethods = new UserMethods(user);
      userMethods.incrementFailedLoginAttempts();

      await this.userRepository.save(user);

      this.loggingService.debug('Failed login attempts incremented successfully', {
        requestId,
        userId: id,
        failedAttempts: user.failedLoginAttempts,
      });
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
  async resetFailedLoginAttempts(id: string, requestId: string): Promise<void> {
    this.loggingService.debug('Resetting failed login attempts for user', {
      requestId,
      userId: id,
    });

    try {
      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found');
      }

      const userMethods = new UserMethods(user);
      userMethods.resetFailedLoginAttempts();

      await this.userRepository.save(user);

      this.loggingService.debug('Failed login attempts reset successfully', {
        requestId,
        userId: id,
      });
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
   * @param id
   * @param reason
   * @param requestId
   */
  async lockAccount(id: string, reason: string, requestId: string): Promise<User> {
    this.loggingService.debug('Locking user account in database', {
      requestId,
      userId: id,
      reason,
    });

    try {
      await this.userRepository.update(id, {
        status: UserStatus.LOCKED,
        lockedAt: new Date(),
        lockReason: reason,
        isActive: false,
      });

      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found after locking account');
      }

      this.loggingService.debug('User account locked successfully in database', {
        requestId,
        userId: id,
        reason,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to lock user account in database', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Unlock user account
   * @param id
   * @param requestId
   */
  async unlockAccount(id: string, requestId: string): Promise<User> {
    this.loggingService.debug('Unlocking user account in database', { requestId, userId: id });

    try {
      await this.userRepository.update(id, {
        status: UserStatus.ACTIVE,
        lockedAt: null,
        lockReason: null,
        isActive: true,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
      });

      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found after unlocking account');
      }

      this.loggingService.debug('User account unlocked successfully in database', {
        requestId,
        userId: id,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to unlock user account in database', {
        requestId,
        userId: id,
        error: error.message,
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
    this.loggingService.debug('Changing user status in database', {
      requestId,
      userId: id,
      status,
    });

    try {
      await this.userRepository.update(id, {
        status,
      });

      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found after status change');
      }

      this.loggingService.debug('User status changed successfully in database', {
        requestId,
        userId: id,
        status,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to change user status in database', {
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
    this.loggingService.debug('Changing user role in database', { requestId, userId: id, role });

    try {
      await this.userRepository.update(id, {
        role,
      });

      const user = await this.findById(id, requestId);
      if (!user) {
        throw new Error('User not found after role change');
      }

      this.loggingService.debug('User role changed successfully in database', {
        requestId,
        userId: id,
        role,
      });

      return user;
    } catch (error) {
      this.loggingService.error('Failed to change user role in database', {
        requestId,
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Create search query builder
   * @param criteria
   */
  private createSearchQueryBuilder(criteria: UserSearchCriteria): SelectQueryBuilder<User> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.isDeleted = :isDeleted', { isDeleted: false });

    // Add search criteria
    if (criteria.email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${criteria.email}%` });
    }

    if (criteria.role) {
      queryBuilder.andWhere('user.role = :role', { role: criteria.role });
    }

    if (criteria.status) {
      queryBuilder.andWhere('user.status = :status', { status: criteria.status });
    }

    if (criteria.tenantId) {
      queryBuilder.andWhere('user.tenantId = :tenantId', { tenantId: criteria.tenantId });
    }

    if (criteria.emailVerified !== undefined) {
      queryBuilder.andWhere('user.emailVerified = :emailVerified', {
        emailVerified: criteria.emailVerified,
      });
    }

    if (criteria.createdAfter) {
      queryBuilder.andWhere('user.createdAt >= :createdAfter', {
        createdAfter: criteria.createdAfter,
      });
    }

    if (criteria.createdBefore) {
      queryBuilder.andWhere('user.createdAt <= :createdBefore', {
        createdBefore: criteria.createdBefore,
      });
    }

    if (criteria.lastLoginAfter) {
      queryBuilder.andWhere('user.lastLoginAt >= :lastLoginAfter', {
        lastLoginAfter: criteria.lastLoginAfter,
      });
    }

    if (criteria.lastLoginBefore) {
      queryBuilder.andWhere('user.lastLoginAt <= :lastLoginBefore', {
        lastLoginBefore: criteria.lastLoginBefore,
      });
    }

    // Add sorting
    const sortField = criteria.sortBy || 'createdAt';
    const sortOrder = criteria.sortOrder || 'DESC';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder as 'ASC' | 'DESC');

    // Add pagination
    if (criteria.page && criteria.limit) {
      const offset = (criteria.page - 1) * criteria.limit;
      queryBuilder.skip(offset).take(criteria.limit);
    }

    return queryBuilder;
  }
}
