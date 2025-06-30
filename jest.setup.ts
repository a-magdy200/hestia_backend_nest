import 'jest-extended';

// Global test configuration
beforeAll(() => {
  // Set up global test environment
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Clean up global test environment
  process.env.NODE_ENV = 'development';
});

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
