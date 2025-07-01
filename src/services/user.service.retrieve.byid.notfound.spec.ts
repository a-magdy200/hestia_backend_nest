import { UserService } from './user.service';
import { LoggingService } from './logging.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('UserService - Retrieve By ID Not Found', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

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

  it('should throw NotFoundException for non-existent user', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(service.getUserById('non-existent', mockRequestId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
