import { UserService } from './user.service';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../interfaces/enums/user.enum';
import { createUserTestModule, mockUser, mockRequestId } from './test-utils/user-test-utils';

describe('UserService - Create Success Case 1', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async (): Promise<void> => {
    const module = await createUserTestModule([]);
    service = module.get(UserService);
    userRepository = module.get('IUserRepository');
  });

  afterEach((): void => {
    jest.clearAllMocks();
  });

  it('should create user successfully', async (): Promise<void> => {
    const createUserData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: UserRole.USER,
    };
    userRepository.emailExists.mockResolvedValue(false);
    userRepository.create.mockResolvedValue(mockUser as unknown as User);

    const result = await service.createUser(createUserData, mockRequestId);

    expect(result).toEqual(mockUser);
    expect(userRepository.create).toHaveBeenCalled();
  });
});
