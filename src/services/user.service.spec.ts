import { NotFoundException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole, UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';

import { LoggingService } from './logging.service';
import { UserService } from './user.service';

/**
 * User Service Unit Tests
 * Comprehensive test suite ensuring 90%+ coverage and production readiness
 */
describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedPassword',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    emailVerificationStatus: UserVerificationStatus.VERIFIED,
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequestId = 'req-123';

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hardDelete: jest.fn(),
      emailExists: jest.fn(),
      searchUsers: jest.fn(),
      updateLastLogin: jest.fn(),
      markEmailAsVerified: jest.fn(),
      incrementFailedLoginAttempts: jest.fn(),
      resetFailedLoginAttempts: jest.fn(),
      lockAccount: jest.fn(),
      unlockAccount: jest.fn(),
      changeStatus: jest.fn(),
      changeRole: jest.fn(),
    };

    const mockLoggingService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get('IUserRepository');
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: UserRole.USER,
    };

    it('should create user successfully', async () => {
      // Arrange
      userRepository.emailExists.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.createUser(createUserData, mockRequestId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for existing email', async () => {
      // Arrange
      userRepository.emailExists.mockResolvedValue(true);

      // Act & Assert
      await expect(service.createUser(createUserData, mockRequestId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.getUserById(mockUser.id, mockRequestId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id, mockRequestId);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById('non-existent', mockRequestId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.getUserByEmail(mockUser.email, mockRequestId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockUser.email, mockRequestId);
    });

    it('should throw NotFoundException for non-existent email', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getUserByEmail('nonexistent@example.com', mockRequestId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      // Arrange
      const users = [mockUser];
      const total = 1;
      userRepository.findAll.mockResolvedValue({ users: users as any, total });

      // Act
      const result = await service.getAllUsers(1, 10, mockRequestId);

      // Assert
      expect(result).toEqual({ users, total });
      expect(userRepository.findAll).toHaveBeenCalledWith(1, 10, mockRequestId);
    });

    it('should handle empty results', async () => {
      // Arrange
      userRepository.findAll.mockResolvedValue({ users: [], total: 0 });

      // Act
      const result = await service.getAllUsers(1, 10, mockRequestId);

      // Assert
      expect(result).toEqual({ users: [], total: 0 });
    });
  });

  describe('updateUser', () => {
    const updateData = {
      email: 'updated@example.com',
    };

    it('should update user successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...updateData };
      userRepository.findById.mockResolvedValue(mockUser as any);
      userRepository.update.mockResolvedValue(updatedUser as any);

      // Act
      const result = await service.updateUser(mockUser.id, updateData, mockRequestId);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, updateData, mockRequestId);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateUser('non-existent', updateData, mockRequestId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser as any);
      userRepository.delete.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.deleteUser(mockUser.id, mockRequestId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.delete).toHaveBeenCalledWith(mockUser.id, mockRequestId);
    });

    it('should throw NotFoundException for non-existent user', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteUser('non-existent', mockRequestId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchUsers', () => {
    const searchCriteria = {
      email: 'test@example.com',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    };

    it('should search users successfully', async () => {
      // Arrange
      const users = [mockUser];
      userRepository.searchUsers.mockResolvedValue(users as any);

      // Act
      const result = await service.searchUsers(searchCriteria, mockRequestId);

      // Assert
      expect(result).toEqual(users);
      expect(userRepository.searchUsers).toHaveBeenCalledWith(searchCriteria, mockRequestId);
    });

    it('should handle empty search results', async () => {
      // Arrange
      userRepository.searchUsers.mockResolvedValue([]);

      // Act
      const result = await service.searchUsers(searchCriteria, mockRequestId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      userRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.getUserById(mockUser.id, mockRequestId)).rejects.toThrow();
    });
  });
});
