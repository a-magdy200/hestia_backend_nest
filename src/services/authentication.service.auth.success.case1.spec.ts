import { AuthenticationService } from './authentication/authentication.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { PasswordService } from './authentication/password.service';
import { JwtService } from '@nestjs/jwt';
import {
  createAuthTestModule,
  mockUser,
  mockRequestId,
} from './test-utils/authentication-test-utils';

describe('AuthenticationService - Auth Success Case 1', () => {
  let service: AuthenticationService;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async (): Promise<void> => {
    const module = await createAuthTestModule([]);
    service = module.get(AuthenticationService);
    userRepository = module.get('IUserRepository');
    passwordService = module.get(PasswordService);
    jwtService = module.get(JwtService);
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('should authenticate user successfully', async (): Promise<void> => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };
    userRepository.findByEmail.mockResolvedValue(mockUser as unknown as User);
    passwordService.verifyPassword.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mock-jwt-token');

    const result = await service.authenticate(loginData, mockRequestId);

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });
});
