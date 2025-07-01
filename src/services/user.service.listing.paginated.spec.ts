import { UserService } from './user.service';
import { LoggingService } from './logging.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { UserRole, UserStatus, UserVerificationStatus } from '../interfaces/enums/user.enum';
import { Test } from '@nestjs/testing';

describe('UserService - Listing Paginated', () => {
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
          useValue: { findAll: jest.fn() },
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

  it('should return paginated users', async () => {
    const users = [mockUser];
    const total = 1;
    userRepository.findAll.mockResolvedValue({ users: users as unknown as User[], total });

    const result = await service.getAllUsers(1, 10, mockRequestId);

    expect(result).toEqual({ users, total });
    expect(userRepository.findAll).toHaveBeenCalledWith(1, 10, mockRequestId);
  });
});
