export default {
  // Test environment
  testEnvironment: 'node',
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json'],
  
  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.integration.test.js'
  ],
  
  // Exclude helper files from test runs
  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/__tests__/helpers/',
    '/src/__tests__/unit/setup.js',
    '/src/__tests__/integration/setup.js',
    '/src/__tests__/integration/mocks.js',
    '/src/__tests__/integration/helpers.js',
    '/src/__tests__/integration/queryHelper.js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/config/swagger.js',
    '!src/__tests__/**'
  ],
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Test timeout
  testTimeout: 15000
};
