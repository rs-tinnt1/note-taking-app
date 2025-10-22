import dotenv from 'dotenv'

// Load environment variables for testing
dotenv.config({ path: './src/__tests__/config/test.env' })

// Set test environment
process.env.NODE_ENV = 'test'

// Mock console methods to reduce noise during tests
global.console = {
  ...console
  // Uncomment to ignore console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Global test timeout
jest.setTimeout(10000)

// Mock mongoose to prevent database connections
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    readyState: 0,
    close: jest.fn(),
    db: {
      dropDatabase: jest.fn()
    }
  },
  Schema: jest.fn(),
  model: jest.fn()
}))
