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
import Note from '../../models/Note.js'
import { createChainableQuery } from './queryHelper.js'
import { generateTestToken, TEST_NOTE_DATA } from './helpers.js'
import { mockNotes, mockUsers } from './mocks.js'

// Mock the models
jest.mock('../../models/Note.js')

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

describe('Notes Integration Tests', () => {
  let validToken

  beforeEach(() => {
    validToken = generateTestToken(mockUsers.validUser)

    // Setup default mock behaviors
    Note.find = jest.fn()
    Note.findById = jest.fn()
    Note.findOneNotDeleted = jest.fn()
    Note.findNotDeletedAndUpdate = jest.fn()
    Note.findNotDeletedAndDelete = jest.fn()
    Note.create = jest.fn()
    Note.countDocuments = jest.fn()
    Note.findByIdAndUpdate = jest.fn()

    // Mock Note constructor
    Note.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockNotes.validNote)
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/notes', () => {
    it('should create note successfully', async () => {
      // Arrange
      Note.create.mockResolvedValue(mockNotes.validNote)

      // Act
      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${validToken}`)
        .send(TEST_NOTE_DATA)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe(TEST_NOTE_DATA.title)
      expect(response.body.data.content).toBe(TEST_NOTE_DATA.content)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app).post('/api/notes').send(TEST_NOTE_DATA)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('GET /api/notes', () => {
    it('should list notes with pagination', async () => {
      // Arrange
      const mockNotesList = [mockNotes.validNote, mockNotes.anotherUserNote]
      Note.find.mockReturnValue(createChainableQuery(mockNotesList))
      Note.countDocuments.mockResolvedValue(2)

      // Act
      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.pagination.totalCount).toBe(2)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app).get('/api/notes')

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('GET /api/notes/:id', () => {
    it('should get note by ID successfully', async () => {
      // Arrange
      Note.findOneNotDeleted.mockResolvedValue(mockNotes.validNote)

      // Act
      const response = await request(app)
        .get(`/api/notes/${mockNotes.validNote._id}`)
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe(mockNotes.validNote.title)
    })

    it('should return 404 when note not found', async () => {
      // Arrange
      Note.findOneNotDeleted.mockResolvedValue(null)

      // Act
      const response = await request(app)
        .get('/api/notes/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app).get(`/api/notes/${mockNotes.validNote._id}`)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('PUT /api/notes/:id', () => {
    it('should update note successfully', async () => {
      // Arrange
      const updatedNote = { ...mockNotes.validNote, title: 'Updated Title' }
      Note.findNotDeletedAndUpdate.mockResolvedValue(updatedNote)

      // Act
      const response = await request(app)
        .put(`/api/notes/${mockNotes.validNote._id}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Updated Title' })

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.title).toBe('Updated Title')
    })

    it('should return 404 when note not found', async () => {
      // Arrange
      Note.findNotDeletedAndUpdate.mockResolvedValue(null)

      // Act
      const response = await request(app)
        .put('/api/notes/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ title: 'Updated Title' })

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app)
        .put(`/api/notes/${mockNotes.validNote._id}`)
        .send({ title: 'Updated Title' })

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })

  describe('DELETE /api/notes/:id', () => {
    it('should delete note successfully', async () => {
      // Arrange
      Note.findNotDeletedAndDelete.mockResolvedValue(mockNotes.validNote)

      // Act
      const response = await request(app)
        .delete(`/api/notes/${mockNotes.validNote._id}`)
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should return 404 when note not found', async () => {
      // Arrange
      Note.findNotDeletedAndDelete.mockResolvedValue(null)

      // Act
      const response = await request(app)
        .delete('/api/notes/nonexistent-id')
        .set('Authorization', `Bearer ${validToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('should return 401 when no token provided', async () => {
      // Act
      const response = await request(app).delete(`/api/notes/${mockNotes.validNote._id}`)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('Access token required')
    })
  })
})
