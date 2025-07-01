import { AuthenticationService } from './authentication/authentication.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { PasswordService } from './authentication/password.service';
import {
  createAuthTestModule,
  mockUser,
  mockRequestId,
} from './test-utils/authentication-test-utils';

describe('AuthenticationService - Password Success Case 1', () => {
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

  it('should change password successfully', async (): Promise<void> => {
    const changePasswordData = {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword',
      confirmPassword: 'newPassword',
    };
    userRepository.findById.mockResolvedValue(mockUser as unknown as User);
    passwordService.verifyPassword.mockResolvedValue(true);
    passwordService.hashPassword.mockResolvedValue('$2b$10$newHashedPassword');
    userRepository.update.mockResolvedValue(mockUser as unknown as User);

    await service.changePassword(mockUser.id, changePasswordData, mockRequestId);

    expect(userRepository.update).toHaveBeenCalled();
  });
});
