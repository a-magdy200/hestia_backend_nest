module.exports = {
  displayName: 'Hestia Backend Tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Root directory for tests
  rootDir: '.',
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // Test file patterns
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  
  // Transform configuration
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Coverage configuration with strict thresholds
  collectCoverage: false, // Disabled by default, enabled via CLI
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/database/migrations/**',
    '!src/mocks/**',
    '!src/main.ts',
    '!src/app.module.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.dto.ts',
  ],
  
  // Strict coverage thresholds for production readiness
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Service-specific higher thresholds
    'src/services/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    // Controller-specific thresholds
    'src/controllers/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
    '<rootDir>/src/database/migrations/',
    '<rootDir>/src/mocks/',
  ],
  
  // Test timeout for async operations
  testTimeout: 30000,
  
  // Verbose output for detailed test results
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Performance monitoring (disabled to avoid test failures)
  detectOpenHandles: false,
  detectLeaks: false,
  
  // Maximum number of concurrent workers
  maxWorkers: 1, // Single worker to avoid concurrency issues
  
  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        suiteName: 'Hestia Backend Tests',
      },
    ],
  ],
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
  ],
  
  // Test environment options
  testEnvironmentOptions: {
    node: {
      experimental: {
        vm: true,
      },
    },
  },
};
