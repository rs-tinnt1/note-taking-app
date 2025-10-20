import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: './src/__tests__/config/test.env' })

// Set test environment
process.env.NODE_ENV = 'test'

// Global test timeout for integration tests
jest.setTimeout(15000)

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

// Mock authentication middleware
jest.mock('../../middleware/auth.js', () => ({
  __esModule: true,
  authenticate: (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' })
    }
    req.user = { userId: '507f1f77bcf86cd799439011', email: 'test@example.com' }
    next()
  }
}))

// Mock swagger-jsdoc to prevent file system access during tests
jest.mock('swagger-jsdoc', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    openapi: '3.0.0',
    info: {
      title: 'Note Taking API',
      version: '1.0.0'
    },
    paths: {},
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken'
        }
      }
    }
  }))
}))

// Mock swagger config to prevent file system issues
jest.mock('../../config/swagger.js', () => ({
  __esModule: true,
  default: {
    openapi: '3.0.0',
    info: {
      title: 'Note Taking API',
      version: '1.0.0'
    },
    paths: {},
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken'
        }
      }
    }
  }
}))

// Setup and teardown utilities
export const setupTestEnvironment = () => {
  // Additional test environment setup if needed
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only'
  process.env.JWT_ACCESS_EXPIRY = '15m'
  process.env.JWT_REFRESH_EXPIRY = '7d'
}

// Call setup immediately
setupTestEnvironment()

export const cleanupTestEnvironment = () => {
  // Cleanup test environment if needed
  jest.clearAllMocks()
}

// Jest integration utilities
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  cookies: {},
  user: null,
  file: null,
  ...overrides
})

export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis()
  }
  return res
}

export const createMockNext = () => jest.fn()

// Setup function for each test
export const setupTest = () => {
  setupTestEnvironment()
  return {}
}

// Teardown function for each test
export const teardownTest = () => {
  cleanupTestEnvironment()
}
