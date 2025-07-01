import { Test } from '@nestjs/testing';
import { AuthenticationService } from '../authentication/authentication.service';
import { LoggingService } from '../logging.service';
import { PasswordService } from '../authentication/password.service';
import { JwtService } from '@nestjs/jwt';
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

export async function createAuthTestModule(providers: Provider[]): Promise<any> {
  const module = await Test.createTestingModule({
    providers: [
      AuthenticationService,
      {
        provide: 'IUserRepository',
        useValue: {
          findByEmail: jest.fn(),
          findById: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
      },
      {
        provide: PasswordService,
        useValue: { verifyPassword: jest.fn(), hashPassword: jest.fn() },
      },
      {
        provide: JwtService,
        useValue: { sign: jest.fn(), verify: jest.fn() },
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
