import jwt from 'jsonwebtoken'

// Mock data generators
export const createMockUser = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword123',
  avatar: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  comparePassword: jest.fn().mockResolvedValue(true),
  save: jest.fn().mockResolvedValue(),
  softDelete: jest.fn().mockResolvedValue(),
  toObject: jest.fn().mockImplementation(function () {
    const obj = { ...this }
    delete obj.password
    delete obj.comparePassword
    delete obj.save
    delete obj.softDelete
    delete obj.toObject
    delete obj.toJSON
    return obj
  }),
  toJSON: jest.fn().mockImplementation(function () {
    const obj = { ...this }
    delete obj.password
    delete obj.comparePassword
    delete obj.save
    delete obj.softDelete
    delete obj.toObject
    delete obj.toJSON
    return obj
  }),
  ...overrides
})

export const createMockNote = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439012',
  title: 'Test Note',
  content: 'This is a test note content',
  owner: '507f1f77bcf86cd799439011',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  save: jest.fn().mockResolvedValue(),
  softDelete: jest.fn().mockResolvedValue(),
  ...overrides
})

export const createMockRefreshToken = (overrides = {}) => ({
  _id: '507f1f77bcf86cd799439013',
  token: 'mock-refresh-token-123',
  userId: '507f1f77bcf86cd799439011',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
  ...overrides
})

// JWT token generation for testing
export const generateTestToken = (user, type = 'access') => {
  const secret = type === 'access'
    ? process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only'
    : process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-for-testing-only'

  const payload = type === 'access'
    ? { userId: user._id, email: user.email, name: user.name }
    : { userId: user._id, email: user.email }

  const expiresIn = type === 'access'
    ? process.env.JWT_ACCESS_EXPIRY || '15m'
    : process.env.JWT_REFRESH_EXPIRY || '7d'

  return jwt.sign(payload, secret, { expiresIn })
}

// Mock authenticated request context
export const mockAuthenticatedRequest = (userId, overrides = {}) => ({
  user: {
    userId,
    email: 'test@example.com',
    name: 'Test User'
  },
  ...overrides
})

// Test data constants
export const TEST_USER_DATA = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
}

export const TEST_LOGIN_DATA = {
  email: 'test@example.com',
  password: 'password123'
}

export const TEST_NOTE_DATA = {
  title: 'Test Note',
  content: 'This is a test note content'
}

export const TEST_UPDATE_USER_DATA = {
  name: 'Updated User',
  email: 'updated@example.com'
}

export const TEST_PASSWORD_DATA = {
  currentPassword: 'oldpassword123',
  newPassword: 'newpassword123'
}
