import { UserService } from './user.service';
import { LoggingService } from './logging.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { UserRole, UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';
import { Test } from '@nestjs/testing';

describe('UserService - Retrieve By ID Success', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

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
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: { findById: jest.fn(), findByEmail: jest.fn() },
        },
        {
          provide: LoggingService,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    userRepository = module.get('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return user by ID', async () => {
    userRepository.findById.mockResolvedValue(mockUser as unknown as User);

    const result = await service.getUserById(mockUser.id, mockRequestId);

    expect(result).toEqual(mockUser);
    expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id, mockRequestId);
  });
});
