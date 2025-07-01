import { AuthenticationService } from './authentication/authentication.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { ConflictException } from '@nestjs/common';
import {
  createAuthTestModule,
  mockUser,
  mockRequestId,
} from './test-utils/authentication-test-utils';

describe('AuthenticationService - Register Conflict Case 1', () => {
  let service: AuthenticationService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async (): Promise<void> => {
    const module = await createAuthTestModule([]);
    service = module.get(AuthenticationService);
    userRepository = module.get('IUserRepository');
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('should throw ConflictException for existing email', async (): Promise<void> => {
    const registerData = {
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };
    userRepository.findByEmail.mockResolvedValue(mockUser as unknown as User);

    await expect(service.register(registerData, mockRequestId)).rejects.toThrow(ConflictException);
  });
});
