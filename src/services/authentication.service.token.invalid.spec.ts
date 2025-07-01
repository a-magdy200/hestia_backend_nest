import { AuthenticationService } from './authentication/authentication.service';
import { LoggingService } from './logging.service';
import { PasswordService } from './authentication/password.service';
import { JwtService } from '@nestjs/jwt';

import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('AuthenticationService - Token Invalid', () => {
  let service: AuthenticationService;
  let jwtService: jest.Mocked<JwtService>;
  const mockRequestId = 'req-123';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: 'IUserRepository',
          useValue: { findById: jest.fn() },
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
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException for invalid refresh token', async () => {
    const throwError = (): never => {
      throw new Error('Invalid token');
    };
    jwtService.verify.mockImplementation(throwError);

    await expect(service.refreshToken('invalid-token', mockRequestId)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
