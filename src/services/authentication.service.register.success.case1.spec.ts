import { AuthenticationService } from './authentication/authentication.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { PasswordService } from './authentication/password.service';
import {
  createAuthTestModule,
  mockUser,
  mockRequestId,
} from './test-utils/authentication-test-utils';

describe('AuthenticationService - Register Success Case 1', () => {
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

  it('should register user successfully', async (): Promise<void> => {
    const registerData = {
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };
    userRepository.findByEmail.mockResolvedValue(null);
    passwordService.hashPassword.mockResolvedValue('$2b$10$hashedPassword');
    userRepository.create.mockResolvedValue(mockUser as unknown as User);

    const result = await service.register(registerData, mockRequestId);

    expect(result).toEqual(mockUser);
    expect(userRepository.create).toHaveBeenCalled();
  });
});
