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
import Note from '../../models/Note.js'
import { createChainableQuery } from './queryHelper.js'
import {
  generateTestToken,
  TEST_UPDATE_USER_DATA
} from './helpers.js'
import {
  mockUsers
} from './mocks.js'

// Mock the models and middleware
jest.mock('../../models/User.js')
jest.mock('../../models/Note.js')
jest.mock('fs')

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

// Mock upload middleware
jest.mock('../../middleware/upload.js', () => ({
  __esModule: true,
  default: {
    single: jest.fn(() => (req, res, next) => {
      req.file = {
        fieldname: 'avatar',
        originalname: 'test-avatar.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: 'uploads/avatars/',
        filename: 'test-avatar.jpg',
        path: 'uploads/avatars/test-avatar.jpg'
      }
      next()
    })
  }
}))

describe('Users Integration Tests', () => {
  let validToken

  beforeEach(() => {
    validToken = generateTestToken(mockUsers.validUser)

    // Setup default mock behaviors
    User.findNotDeleted = jest.fn().mockReturnValue(createChainableQuery([mockUsers.validUser, mockUsers.anotherUser]))
    User.findByIdNotDeleted = jest.fn().mockReturnValue(createChainableQuery(mockUsers.validUser))
    User.findOneNotDeleted = jest.fn()
    User.findNotDeletedAndUpdate = jest.fn().mockReturnValue(createChainableQuery(mockUsers.validUser))
    User.findNotDeletedAndDelete = jest.fn().mockResolvedValue(mockUsers.validUser)
    User.findByIdAndUpdate = jest.fn()
    Note.updateMany = jest.fn()

    // Mock User constructor
    User.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockUsers.validUser),
      toObject: jest.fn().mockReturnValue(mockUsers.validUser)
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('should list all users successfully', async () => {
      // Arrange
      const usersList = [mockUsers.validUser, mockUsers.anotherUser]
      User.findNotDeleted.mockReturnValue(createChainableQuery(usersList))

      // Act
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.count).toBe(2)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app)
        .get('/api/users')

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('GET /api/users/:id', () => {
    it('should get user by ID successfully', async () => {
      // Act
      const response = await request(app)
        .get(`/api/users/${mockUsers.validUser._id}`)
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.email).toBe(mockUsers.validUser.email)
    })

    it('should return 404 when user not found', async () => {
      // Arrange
      User.findByIdNotDeleted.mockReturnValue(createChainableQuery(null))

      // Act
      const response = await request(app)
        .get('/api/users/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app)
        .get(`/api/users/${mockUsers.validUser._id}`)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('PUT /api/users/:id', () => {
    it('should update user successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUsers.validUser, ...TEST_UPDATE_USER_DATA }
      User.findNotDeletedAndUpdate.mockReturnValue(createChainableQuery(updatedUser))

      // Act
      const response = await request(app)
        .put(`/api/users/${mockUsers.validUser._id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send(TEST_UPDATE_USER_DATA)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe(TEST_UPDATE_USER_DATA.name)
    })

    it('should return 404 when user not found', async () => {
      // Arrange
      User.findByIdNotDeleted.mockReturnValue(createChainableQuery(null))

      // Act
      const response = await request(app)
        .put('/api/users/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`)
        .send(TEST_UPDATE_USER_DATA)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app)
        .put(`/api/users/${mockUsers.validUser._id}`)
        .send(TEST_UPDATE_USER_DATA)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully', async () => {
      // Arrange
      Note.updateMany.mockResolvedValue({ acknowledged: true, modifiedCount: 0 })

      // Act
      const response = await request(app)
        .delete(`/api/users/${mockUsers.validUser._id}`)
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should return 404 when user not found', async () => {
      // Arrange
      User.findNotDeletedAndDelete.mockResolvedValue(null)

      // Act
      const response = await request(app)
        .delete('/api/users/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app)
        .delete(`/api/users/${mockUsers.validUser._id}`)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('GET /api/users/:id/avatar', () => {
    it('should get user avatar successfully', async () => {
      // Arrange
      const userWithAvatar = { ...mockUsers.validUser, avatar: 'uploads/avatars/avatar.jpg' }
      User.findByIdNotDeleted.mockReturnValue(createChainableQuery(userWithAvatar))

      // Act
      const response = await request(app)
        .get(`/api/users/${mockUsers.validUser._id}/avatar`)
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should return 404 when user not found', async () => {
      // Arrange
      User.findByIdNotDeleted.mockReturnValue(createChainableQuery(null))

      // Act
      const response = await request(app)
        .get('/api/users/nonexistent-id/avatar')
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app)
        .get(`/api/users/${mockUsers.validUser._id}/avatar`)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })
})
