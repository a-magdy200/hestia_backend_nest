import { UserService } from './user.service';
import { LoggingService } from './logging.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { UserRole, UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';
import { Test } from '@nestjs/testing';

describe('UserService - Management Delete', () => {
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
          useValue: { findById: jest.fn(), update: jest.fn(), delete: jest.fn() },
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

  it('should delete user successfully', async () => {
    userRepository.findById.mockResolvedValue(mockUser as unknown as User);
    userRepository.delete.mockResolvedValue(mockUser as unknown as User);

    await service.deleteUser(mockUser.id, mockRequestId);

    expect(userRepository.delete).toHaveBeenCalledWith(mockUser.id, mockRequestId);
  });
});
