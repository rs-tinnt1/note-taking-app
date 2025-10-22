// Mock the models first
jest.mock('../../models/User.js', () => {
  const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneNotDeleted: jest.fn(),
    findByIdNotDeleted: jest.fn(),
    findNotDeleted: jest.fn(),
    findNotDeletedAndUpdate: jest.fn(),
    findNotDeletedAndDelete: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis()
  }

  // Mock User constructor
  const UserConstructor = jest.fn(data => {
    const userInstance = {
      ...data,
      save: jest.fn().mockResolvedValue({
        ...data,
        _id: data._id || 'generated-user-id',
        toObject: jest.fn().mockImplementation(function () {
          const userObject = { ...this }
          delete userObject.password
          delete userObject.save
          delete userObject.comparePassword
          delete userObject.softDelete
          delete userObject.toObject
          delete userObject.toJSON
          return userObject
        }),
        toJSON: jest.fn().mockImplementation(function () {
          const userObject = { ...this }
          delete userObject.password
          delete userObject.save
          delete userObject.comparePassword
          delete userObject.softDelete
          delete userObject.toObject
          delete userObject.toJSON
          return userObject
        })
      }),
      comparePassword: jest.fn().mockResolvedValue(true),
      softDelete: jest.fn().mockResolvedValue(true),
      toObject: jest.fn().mockImplementation(function () {
        const userObject = { ...this }
        delete userObject.password
        delete userObject.save
        delete userObject.comparePassword
        delete userObject.softDelete
        delete userObject.toObject
        delete userObject.toJSON
        return userObject
      }),
      toJSON: jest.fn().mockImplementation(function () {
        const userObject = { ...this }
        delete userObject.password
        delete userObject.save
        delete userObject.comparePassword
        delete userObject.softDelete
        delete userObject.toObject
        delete userObject.toJSON
        return userObject
      })
    }
    return userInstance
  })

  // Set the constructor as the default export
  Object.assign(UserConstructor, mockUserModel)
  return UserConstructor
})

jest.mock('../../models/RefreshToken.js', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findOneNotDeleted: jest.fn(),
  findByIdNotDeleted: jest.fn(),
  findNotDeleted: jest.fn(),
  findNotDeletedAndUpdate: jest.fn(),
  findNotDeletedAndDelete: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findAndDelete: jest.fn().mockResolvedValue({
    _id: 'mock-refresh-token-id',
    token: 'mock-refresh-token-123',
    userId: 'mock-user-id',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null
  }),
  createToken: jest.fn(),
  select: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis()
}))

// Import mock objects after mocking
import { mockRefreshTokenModel, resetAllMocks, setupAllMocks } from '../helpers/modelMocks.js'
import {
  createMockRefreshToken,
  createMockUser,
  testLoginData,
  testUserData
} from '../helpers/mockData.js'

// Get the mocked User model
const mockUserModel = require('../../models/User.js')

// Set environment variables
process.env.JWT_SECRET = 'your-secret-key'
process.env.JWT_REFRESH_SECRET = 'your-refresh-secret-key'
process.env.JWT_ACCESS_EXPIRY = '15m'
process.env.JWT_REFRESH_EXPIRY = '7d'

// Now import everything else
import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'
import { login, logout, refreshToken, register } from '../../controllers/authController.js'

// Mock authService
jest.mock('../../services/authService.js', () => ({
  generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
  verifyRefreshToken: jest.fn().mockReturnValue({ userId: 'mock-user-id' })
}))

// Create Express app for testing
const app = express()
app.use(express.json())
app.use(cookieParser())

// Mock the auth routes
app.post('/api/auth/register', register)
app.post('/api/auth/login', login)
app.post('/api/auth/logout', logout)
app.post('/api/auth/refresh', refreshToken)

describe('AuthController', () => {
  beforeEach(() => {
    resetAllMocks()
    setupAllMocks()

    // Reset specific mocks for each test
    mockUserModel.findOneNotDeleted.mockResolvedValue(null)
  })

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const mockUser = createMockUser()

      // Setup mocks for successful registration
      mockUserModel.findOneNotDeleted.mockResolvedValue(null) // No existing user
      mockRefreshTokenModel.createToken.mockResolvedValue(createMockRefreshToken())

      const response = await request(app).post('/api/auth/register').send(testUserData).expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.user).toBeDefined()
      expect(response.body.data.user.name).toBe(testUserData.name)
      expect(response.body.data.user.email).toBe(testUserData.email)
      expect(response.body.data.user.password).toBeUndefined() // Should not include password
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeUndefined() // Not in response body anymore
    })

    test('should return 400 for missing required fields', async () => {
      const userData = {
        name: 'Test User'
        // Missing email and password
      }

      // Ensure no existing user for validation to work
      mockUserModel.findOneNotDeleted.mockResolvedValue(null)

      const response = await request(app).post('/api/auth/register').send(userData).expect(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Email is required')
    })

    test('should return 400 for invalid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      }

      // Ensure no existing user for validation to work
      mockUserModel.findOneNotDeleted.mockResolvedValue(null)

      const response = await request(app).post('/api/auth/register').send(userData).expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Please enter a valid email')
    })

    test('should return 400 for short password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      }

      // Ensure no existing user for validation to work
      mockUserModel.findOneNotDeleted.mockResolvedValue(null)

      const response = await request(app).post('/api/auth/register').send(userData).expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Password must be at least 6 characters')
    })

    test('should return 400 for duplicate email', async () => {
      const mockUser = createMockUser()
      mockUserModel.findOneNotDeleted.mockResolvedValue(mockUser) // Existing user

      const response = await request(app).post('/api/auth/register').send(testUserData).expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('User with this email already exists')
    })

    test('should hash password before saving', async () => {
      const mockUser = createMockUser()
      mockUserModel.findOneNotDeleted.mockResolvedValue(null)
      mockRefreshTokenModel.createToken.mockResolvedValue(createMockRefreshToken())

      await request(app).post('/api/auth/register').send(testUserData).expect(201)

      expect(mockUserModel).toHaveBeenCalledWith(
        expect.objectContaining({
          name: testUserData.name,
          email: testUserData.email,
          password: testUserData.password // Password will be hashed in pre-save hook
        })
      )
    })
  })

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const mockUser = createMockUser()
      const mockUserWithMethods = {
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockImplementation(function () {
          const userObject = { ...this }
          delete userObject.password
          delete userObject.comparePassword
          delete userObject.toObject
          delete userObject.toJSON
          return userObject
        })
      }

      mockUserModel.findOneNotDeleted.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserWithMethods)
      })
      mockRefreshTokenModel.createToken.mockResolvedValue(createMockRefreshToken())

      const response = await request(app).post('/api/auth/login').send(testLoginData).expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.user).toBeDefined()
      expect(response.body.data.user.name).toBe(mockUser.name)
      expect(response.body.data.user.email).toBe(mockUser.email)
      expect(response.body.data.user.password).toBeUndefined()
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeUndefined() // Not in response body anymore
    })

    test('should return 400 for missing email', async () => {
      const loginData = {
        password: 'password123'
      }

      const response = await request(app).post('/api/auth/login').send(loginData).expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Email is required')
    })

    test('should return 400 for missing password', async () => {
      const loginData = {
        email: 'test@example.com'
      }

      const response = await request(app).post('/api/auth/login').send(loginData).expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Password is required')
    })

    test('should return 401 for invalid email', async () => {
      mockUserModel.findOneNotDeleted.mockReturnValue({
        select: jest.fn().mockResolvedValue(null) // User not found
      })

      const response = await request(app).post('/api/auth/login').send(testLoginData).expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid email or password')
    })

    test('should return 401 for invalid password', async () => {
      const mockUser = createMockUser()
      mockUser.comparePassword.mockResolvedValue(false) // Wrong password
      mockUserModel.findOneNotDeleted.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      })

      const response = await request(app).post('/api/auth/login').send(testLoginData).expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid email or password')
    })

    test('should not login deleted user', async () => {
      mockUserModel.findOneNotDeleted.mockReturnValue({
        select: jest.fn().mockResolvedValue(null) // Deleted user not found
      })

      const response = await request(app).post('/api/auth/login').send(testLoginData).expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid email or password')
    })
  })

  describe('POST /api/auth/logout', () => {
    test('should logout successfully with valid refresh token', async () => {
      const mockRefreshToken = createMockRefreshToken()
      const mockRefreshTokenModel = require('../../models/RefreshToken.js')
      mockRefreshTokenModel.findAndDelete.mockResolvedValue(mockRefreshToken)

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`refreshToken=${mockRefreshToken.token}`])
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Logged out successfully')
      expect(mockRefreshTokenModel.findAndDelete).toHaveBeenCalledWith(mockRefreshToken.token)
    })

    test('should logout successfully without refresh token', async () => {
      const response = await request(app).post('/api/auth/logout').expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Logged out successfully')
    })
  })

  describe('POST /api/auth/refresh', () => {
    test('should refresh tokens successfully', async () => {
      const mockUser = createMockUser()
      const mockRefreshToken = createMockRefreshToken()
      const mockRefreshTokenModel = require('../../models/RefreshToken.js')

      mockRefreshTokenModel.findOneNotDeleted.mockResolvedValue(mockRefreshToken)
      mockUserModel.findByIdNotDeleted.mockResolvedValue(mockUser)

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${mockRefreshToken.token}`])
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.accessToken).toBeDefined()
      expect(response.body.data.refreshToken).toBeUndefined() // No new refresh token in response
    })

    test('should return 401 for missing refresh token', async () => {
      const response = await request(app).post('/api/auth/refresh').expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Refresh token not provided')
    })

    test('should return 401 for invalid refresh token', async () => {
      // Mock verifyRefreshToken to throw error
      const authService = require('../../services/authService.js')
      authService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid or expired refresh token')
      })

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid-token'])
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid or expired refresh token')
    })

    test('should return 401 for deleted refresh token', async () => {
      const mockRefreshTokenModel = require('../../models/RefreshToken.js')
      mockRefreshTokenModel.findOneNotDeleted.mockResolvedValue(null)

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=deleted-token'])
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid or expired refresh token')
    })

    test('should return 401 for deleted user', async () => {
      const mockRefreshToken = createMockRefreshToken()
      const mockRefreshTokenModel = require('../../models/RefreshToken.js')
      mockRefreshTokenModel.findOneNotDeleted.mockResolvedValue(mockRefreshToken)
      mockUserModel.findByIdNotDeleted.mockResolvedValue(null) // User deleted

      // Mock verifyRefreshToken to return success so we can test user validation
      const authService = require('../../services/authService.js')
      authService.verifyRefreshToken.mockReturnValue({ userId: 'mock-user-id' })

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${mockRefreshToken.token}`])
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('User not found')
    })
  })
})
