import { AuthenticationService } from './authentication/authentication.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { PasswordService } from './authentication/password.service';
import { UnauthorizedException } from '@nestjs/common';
import {
  createAuthTestModule,
  mockUser,
  mockRequestId,
} from './test-utils/authentication-test-utils';

describe('AuthenticationService - Password Unauthorized Case 1', () => {
  let service: AuthenticationService;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<PasswordService>;

  beforeEach(async (): Promise<void> => {
    const module = await createAuthTestModule([]);
    service = module.get(AuthenticationService);
    userRepository = module.get('IUserRepository');
    passwordService = module.get(PasswordService);
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException for incorrect current password', async (): Promise<void> => {
    const changePasswordData = {
      currentPassword: 'wrongPassword',
      newPassword: 'newPassword',
      confirmPassword: 'newPassword',
    };
    userRepository.findById.mockResolvedValue(mockUser as unknown as User);
    passwordService.verifyPassword.mockResolvedValue(false);

    await expect(
      service.changePassword(mockUser.id, changePasswordData, mockRequestId),
    ).rejects.toThrow(UnauthorizedException);
  });
});
