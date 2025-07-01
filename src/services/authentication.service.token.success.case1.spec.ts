import { AuthenticationService } from './authentication/authentication.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import {
  createAuthTestModule,
  mockUser,
  mockRequestId,
} from './test-utils/authentication-test-utils';

describe('AuthenticationService - Token Success Case 1', () => {
  let service: AuthenticationService;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async (): Promise<void> => {
    const module = await createAuthTestModule([]);
    service = module.get(AuthenticationService);
    userRepository = module.get('IUserRepository');
    jwtService = module.get(JwtService);
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('should refresh token successfully', async (): Promise<void> => {
    const refreshToken = 'valid-refresh-token';
    jwtService.verify.mockReturnValue({ sub: mockUser.id, email: mockUser.email });
    userRepository.findById.mockResolvedValue(mockUser as unknown as User);
    jwtService.sign.mockReturnValue('new-access-token');

    const result = await service.refreshToken(refreshToken, mockRequestId);

    expect(result).toHaveProperty('accessToken');
  });
});
