// Mock swagger-jsdoc before any imports
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

// Mock swagger config
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

import request from 'supertest'
import app from '../../app.js'
import User from '../../models/User.js'
import RefreshToken from '../../models/RefreshToken.js'
import * as authService from '../../services/authService.js'
import * as emailService from '../../services/emailService.js'
import {
  createMockUser,
  generateTestToken,
  TEST_LOGIN_DATA,
  TEST_USER_DATA
} from './helpers.js'
import { mockUsers } from './mocks.js'

// Mock the models and services
jest.mock('../../models/User.js')
jest.mock('../../models/RefreshToken.js', () => ({
  __esModule: true,
  default: {
    createToken: jest.fn(),
    findOne: jest.fn(),
    findOneNotDeleted: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn()
  }
}))
jest.mock('../../services/authService.js', () => ({
  __esModule: true,
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn()
}))
jest.mock('../../services/emailService.js', () => ({
  __esModule: true,
  sendWelcomeEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn()
}))

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    // Setup default mock behaviors
    User.findOneNotDeleted = jest.fn()
    User.create = jest.fn()
    RefreshToken.findOne = jest.fn()
    RefreshToken.create = jest.fn()
    RefreshToken.deleteOne = jest.fn()

    // Mock User constructor
    User.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockUsers.validUser),
      toObject: jest.fn().mockReturnValue(mockUsers.validUser)
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should register successfully with valid data', async () => {
      // Arrange
      User.findOneNotDeleted.mockResolvedValue(null) // No existing user

      // Mock services
      authService.generateAccessToken.mockReturnValue('access-token')
      authService.generateRefreshToken.mockReturnValue('refresh-token')
      emailService.sendWelcomeEmail.mockResolvedValue()

      // Mock RefreshToken.createToken
      const refreshTokenService = require('../../models/RefreshToken.js')
      refreshTokenService.default.createToken.mockResolvedValue()

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(TEST_USER_DATA)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe(TEST_USER_DATA.email)
      expect(response.body.data.accessToken).toBe('access-token')
      // refreshToken is set in cookie, not in response body
    })

    it('should return 400 when no data provided', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const mockUser = createMockUser()
      const queryMock = {
        select: jest.fn().mockResolvedValue(mockUser)
      }
      User.findOneNotDeleted.mockReturnValue(queryMock)

      // Mock services
      authService.generateAccessToken.mockReturnValue('access-token')
      authService.generateRefreshToken.mockReturnValue('refresh-token')

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(TEST_LOGIN_DATA)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.accessToken).toBe('access-token')
      // refreshToken is set in cookie, not in response body
    })

    it('should return 400 when no data provided', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')

      // Assert
      expect(response.status).toBe(500)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      // Arrange
      const validToken = generateTestToken(mockUsers.validUser)
      const refreshTokenService = require('../../models/RefreshToken.js')
      refreshTokenService.default.findOne.mockResolvedValue(mockUsers.validUser)
      refreshTokenService.default.deleteOne.mockResolvedValue({ deletedCount: 1 })

      // Mock authService.verifyAccessToken
      authService.verifyAccessToken.mockReturnValue({
        userId: mockUsers.validUser._id,
        email: mockUsers.validUser.email
      })

      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/logout')

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      // Arrange
      const validToken = generateTestToken(mockUsers.validUser, 'refresh')
      const refreshTokenService = require('../../models/RefreshToken.js')
      refreshTokenService.default.findOneNotDeleted.mockResolvedValue(mockUsers.validUser)
      User.findByIdNotDeleted.mockResolvedValue(mockUsers.validUser)

      // Mock services
      authService.verifyRefreshToken.mockReturnValue({ userId: mockUsers.validUser._id })
      authService.generateAccessToken.mockReturnValue('new-access-token')

      // Act
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${validToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.accessToken).toBe('new-access-token')
    })

    it('should return 401 when no refresh token provided', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/refresh')

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })
})
