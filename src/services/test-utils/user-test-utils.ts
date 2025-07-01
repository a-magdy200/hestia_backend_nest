import { Test } from '@nestjs/testing';
import { UserService } from '../user.service';
import { LoggingService } from '../logging.service';
import { UserRole, UserStatus, UserVerificationStatus } from '../../interfaces/enums/user.enum';
import { Provider } from '@nestjs/common';

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  passwordHash: '$2b$10$hashedPassword',
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  emailVerificationStatus: UserVerificationStatus.VERIFIED,
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockRequestId = 'req-123';

export async function createUserTestModule(providers: Provider[]): Promise<any> {
  const module = await Test.createTestingModule({
    providers: [
      UserService,
      {
        provide: 'IUserRepository',
        useValue: { emailExists: jest.fn(), create: jest.fn() },
      },
      {
        provide: LoggingService,
        useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
      },
      ...providers,
    ],
  }).compile();
  return module;
}
