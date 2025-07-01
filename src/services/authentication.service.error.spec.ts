import { AuthenticationService } from './authentication/authentication.service';
import { LoggingService } from './logging.service';
import { PasswordService } from './authentication/password.service';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { Test } from '@nestjs/testing';

describe('AuthenticationService - Error Handling', () => {
  let service: AuthenticationService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: 'IUserRepository',
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: PasswordService,
          useValue: { verifyPassword: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
        {
          provide: LoggingService,
          useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
      ],
    }).compile();
    service = module.get<AuthenticationService>(AuthenticationService);
    userRepository = module.get('IUserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(
        service.authenticate({ email: 'test@example.com', password: 'password' }, 'req-123'),
      ).rejects.toThrow();
    });
  });
});
