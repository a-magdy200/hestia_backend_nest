import { UserService } from './user.service';
import { LoggingService } from './logging.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { Test } from '@nestjs/testing';

describe('UserService - Listing Empty', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

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

  it('should handle empty results', async () => {
    userRepository.findAll.mockResolvedValue({ users: [], total: 0 });

    const result = await service.getAllUsers(1, 10, mockRequestId);

    expect(result).toEqual({ users: [], total: 0 });
  });
});
