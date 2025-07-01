import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UserRole, UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';

import { AuthenticationService } from './authentication.service';
import { LoggingService } from './logging.service';

/**
 * Authentication Service Unit Tests
 * Comprehensive test suite ensuring 90%+ coverage and production readiness
 */
describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let loggingService: jest.Mocked<LoggingService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedPassword',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    emailVerificationStatus: UserVerificationStatus.VERIFIED,
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

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const mockLoggingService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: LoggingService,
          useValue: mockLoggingService,
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userRepository = module.get('IUserRepository');
    jwtService = module.get(JwtService);
    loggingService = module.get(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'validPassword123',
    };

    it('should authenticate user with valid credentials', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(service as any, 'verifyPassword').mockResolvedValue(true);
      jwtService.sign
        .mockReturnValueOnce('mock-access-token')
        .mockReturnValueOnce('mock-refresh-token');

      // Act
      const result = await service.authenticate(validCredentials, mockRequestId);

      // Assert
      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.tokenType).toBe('Bearer');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.authenticate(validCredentials, mockRequestId)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(service as any, 'verifyPassword').mockResolvedValue(false);

      // Act & Assert
      await expect(service.authenticate(validCredentials, mockRequestId)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      userRepository.findByEmail.mockResolvedValue(inactiveUser as any);

      // Act & Assert
      await expect(service.authenticate(validCredentials, mockRequestId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'newuser@example.com',
      password: 'validPassword123',
      confirmPassword: 'validPassword123',
    };

    it('should register new user successfully', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      jest.spyOn(service as any, 'hashPassword').mockResolvedValue('hashedPassword');
      userRepository.create.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.register(validRegistrationData, mockRequestId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for existing email', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser as any);

      // Act & Assert
      await expect(service.register(validRegistrationData, mockRequestId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Arrange
      const tokenPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'refresh' as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      jwtService.verify.mockReturnValue(tokenPayload);
      userRepository.findById.mockResolvedValue(mockUser as any);
      jwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      // Act
      const result = await service.refreshToken('valid-refresh-token', mockRequestId);

      // Assert
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshToken('invalid-token', mockRequestId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      // Arrange
      const tokenPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'access' as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      jwtService.verify.mockReturnValue(tokenPayload);

      // Act
      const result = await service.validateToken('valid-token', mockRequestId);

      // Assert
      expect(result).toEqual(tokenPayload);
    });

    it('should return null for invalid token', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const result = await service.validateToken('invalid-token', mockRequestId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getUserFromToken', () => {
    it('should get user from valid token', async () => {
      // Arrange
      const tokenPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'access' as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      jest.spyOn(service, 'validateToken').mockResolvedValue(tokenPayload);
      userRepository.findById.mockResolvedValue(mockUser as any);

      // Act
      const result = await service.getUserFromToken('valid-token', mockRequestId);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid token', async () => {
      // Arrange
      jest.spyOn(service, 'validateToken').mockResolvedValue(null);

      // Act
      const result = await service.getUserFromToken('invalid-token', mockRequestId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        service.authenticate({ email: 'test@example.com', password: 'password' }, mockRequestId),
      ).rejects.toThrow();
    });

    it('should handle JWT errors gracefully', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      jest.spyOn(service as any, 'verifyPassword').mockResolvedValue(true);
      jwtService.sign.mockImplementation(() => {
        throw new Error('JWT error');
      });

      // Act & Assert
      await expect(
        service.authenticate({ email: 'test@example.com', password: 'password' }, mockRequestId),
      ).rejects.toThrow();
    });
  });
});
