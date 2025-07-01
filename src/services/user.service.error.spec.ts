import { UserService } from './user.service';
import { LoggingService } from './logging.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { Test } from '@nestjs/testing';

describe('UserService - Error Handling', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: { findById: jest.fn() },
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

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      userRepository.findById.mockRejectedValue(new Error('Database error'));

      await expect(service.getUserById('user-123', 'req-123')).rejects.toThrow();
    });
  });
});
