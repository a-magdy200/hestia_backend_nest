import 'jest-extended';
import 'reflect-metadata';

// Global test configuration
jest.setTimeout(30000);

// Environment setup for tests
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-secret';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test_db';

// Mock console methods to prevent noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
(global as any).testUtils = {
  // Mock logging service
  createMockLoggingService: (): any => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  }),

  // Mock configuration service
  createMockConfigService: (): any => ({
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '1h',
        'jwt.refreshExpiresIn': '7d',
        'database.host': 'localhost',
        'database.port': 5432,
        'database.name': 'test_db',
        'app.environment': 'test',
        'app.port': 3000,
      };
      return config[key] ?? defaultValue;
    }),
  }),

  // Mock repository factory
  createMockRepository: (): any => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn(),
    query: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
      select: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
    })),
  }),

  // Test data generators
  generateTestUser: (overrides: Partial<any> = {}): any => ({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  generateTestUserProfile: (overrides: Partial<any> = {}): any => ({
    id: 'test-profile-id',
    userId: 'test-user-id',
    displayName: 'Test User',
    bio: 'Test bio',
    location: 'Test Location',
    website: 'https://test.com',
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  // Performance testing utilities
  measureExecutionTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
    return { result, duration };
  },

  // Memory testing utilities
  measureMemoryUsage: (): NodeJS.MemoryUsage => process.memoryUsage(),

  // Error testing utilities
  expectToThrowError: async (fn: () => Promise<any>, errorType: any, message?: string): Promise<void> => {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(errorType);
      if (message && error instanceof Error) {
        expect(error.message).toContain(message);
      }
    }
  },

  // Async testing utilities
  waitFor: (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms)),

  // Database testing utilities
  cleanDatabase: jest.fn(),
  seedTestData: jest.fn(),

  // Mock request/response objects
  createMockRequest: (overrides: Partial<any> = {}): any => ({
    user: null,
    requestId: 'test-request-id',
    headers: {},
    query: {},
    params: {},
    body: {},
    ...overrides,
  }),

  createMockResponse: (): any => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
  }),

  // Validation testing utilities
  validateDTO: jest.fn(),
  
  // Security testing utilities
  createMockJwtService: (): any => ({
    sign: jest.fn(() => 'mock-jwt-token'),
    verify: jest.fn(() => ({ sub: 'test-user-id', email: 'test@example.com' })),
    decode: jest.fn(() => ({ sub: 'test-user-id', email: 'test@example.com' })),
  }),
};

// Global test hooks
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});

// Global error handlers for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests, just log the error
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in tests, just log the error
});

// Setup for MSW (Mock Service Worker) in tests
beforeAll(async () => {
  // Initialize any global test setup here
});

afterAll(async () => {
  // Cleanup any global test resources here
});

// Export for TypeScript support
export {};
