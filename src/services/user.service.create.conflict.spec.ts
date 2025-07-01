import { UserService } from './user.service';
import { LoggingService } from './logging.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { UserRole } from '../interfaces/enums/user.enum';
import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('UserService - Create Conflict', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockRequestId = 'req-123';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: { emailExists: jest.fn(), create: jest.fn() },
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

  it('should throw ConflictException for existing email', async () => {
    const createUserData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: UserRole.USER,
    };
    userRepository.emailExists.mockResolvedValue(true);

    await expect(service.createUser(createUserData, mockRequestId)).rejects.toThrow(
      ConflictException,
    );
  });
});
