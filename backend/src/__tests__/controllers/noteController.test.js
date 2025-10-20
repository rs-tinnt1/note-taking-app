// Import mock objects first
import { mockNoteModel, mockUserModel, resetAllMocks, setupAllMocks } from '../helpers/modelMocks.js'

// Mock the models first
jest.mock('../../models/User.js', () => mockUserModel)

jest.mock('../../models/Note.js', () => {
  const mockNoteModel = {
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

  // Mock Note constructor
  const NoteConstructor = jest.fn(data => {
    const noteInstance = {
      ...data,
      save: jest.fn().mockResolvedValue({
        ...data,
        _id: data._id || 'generated-note-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        toObject: jest.fn().mockImplementation(function () {
          const noteObject = { ...this }
          delete noteObject.save
          delete noteObject.toObject
          delete noteObject.toJSON
          return noteObject
        }),
        toJSON: jest.fn().mockImplementation(function () {
          const noteObject = { ...this }
          delete noteObject.save
          delete noteObject.toObject
          delete noteObject.toJSON
          return noteObject
        })
      }),
      toObject: jest.fn().mockImplementation(function () {
        const noteObject = { ...this }
        delete noteObject.save
        delete noteObject.toObject
        delete noteObject.toJSON
        return noteObject
      }),
      toJSON: jest.fn().mockImplementation(function () {
        const noteObject = { ...this }
        delete noteObject.save
        delete noteObject.toObject
        delete noteObject.toJSON
        return noteObject
      })
    }
    return noteInstance
  })

  // Set the constructor as the default export
  Object.assign(NoteConstructor, mockNoteModel)
  return NoteConstructor
})

// Now import everything else
import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote } from '../../controllers/noteController.js'
import { createMockNote, createMockNoteArray, createMockUser, testNoteData } from '../helpers/mockData.js'

// Create Express app for testing
const app = express()
app.use(express.json())
app.use(cookieParser())

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  req.user = {
    userId: req.headers['x-test-user-id'] || 'mock-user-id-123',
    email: 'test@example.com'
  }
  next()
}

// Apply mock auth middleware and note routes
app.use('/api/notes', mockAuth)
app.post('/api/notes', createNote)
app.get('/api/notes', getAllNotes)
app.get('/api/notes/:id', getNoteById)
app.put('/api/notes/:id', updateNote)
app.delete('/api/notes/:id', deleteNote)

describe('NoteController', () => {
  beforeEach(() => {
    resetAllMocks()
    setupAllMocks()

    // Setup Note model mocks
    const mockNoteModel = require('../../models/Note.js')
    mockNoteModel.findNotDeleted.mockReturnValue({
      sort: jest.fn().mockResolvedValue([createMockNote()])
    })
    mockNoteModel.findOneNotDeleted.mockResolvedValue(createMockNote())
    mockNoteModel.findNotDeletedAndUpdate.mockResolvedValue(createMockNote())
    mockNoteModel.findNotDeletedAndDelete.mockResolvedValue(createMockNote())
  })

  describe('POST /api/notes', () => {
    test('should create a new note successfully', async () => {
      const mockUser = createMockUser()
      const mockNote = createMockNote()
      const response = await request(app)
        .post('/api/notes')
        .set('x-test-user-id', mockUser._id)
        .send(testNoteData)

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.title).toBe(testNoteData.title)
      expect(response.body.data.content).toBe(testNoteData.content)
      expect(response.body.data.owner.toString()).toBe(mockUser._id)
      expect(response.body.data.createdAt).toBeDefined()
      expect(response.body.data.updatedAt).toBeDefined()
      expect(response.body.data.deletedAt).toBeNull()
    })
  })

  describe('GET /api/notes', () => {
    test('should get all notes for user with pagination', async () => {
      const mockUser = createMockUser()
      const mockNotes = createMockNoteArray(3, mockUser._id)
      const mockNoteModel = require('../../models/Note.js')

      // Mock countDocuments and find methods
      mockNoteModel.countDocuments.mockResolvedValue(3)
      mockNoteModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockNotes)
          })
        })
      })

      const response = await request(app)
        .get('/api/notes')
        .set('x-test-user-id', mockUser._id)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(3)
      expect(response.body.pagination).toBeDefined()
      expect(response.body.pagination.currentPage).toBe(1)
      expect(response.body.pagination.totalPages).toBe(1)
      expect(response.body.pagination.totalCount).toBe(3)
      expect(response.body.pagination.limit).toBe(20)
      expect(response.body.search).toBeDefined()
      expect(response.body.search.query).toBe('')
      expect(response.body.search.resultsCount).toBe(3)
    })

    test('should get notes with search query', async () => {
      const mockUser = createMockUser()
      const mockNotes = createMockNoteArray(2, mockUser._id)
      const mockNoteModel = require('../../models/Note.js')

      // Mock countDocuments and find methods
      mockNoteModel.countDocuments.mockResolvedValue(2)
      mockNoteModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockNotes)
          })
        })
      })

      const response = await request(app)
        .get('/api/notes?search=meeting')
        .set('x-test-user-id', mockUser._id)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.search.query).toBe('meeting')
      expect(response.body.search.resultsCount).toBe(2)
    })

    test('should get notes with pagination parameters', async () => {
      const mockUser = createMockUser()
      const mockNotes = createMockNoteArray(5, mockUser._id)
      const mockNoteModel = require('../../models/Note.js')

      // Mock countDocuments and find methods
      mockNoteModel.countDocuments.mockResolvedValue(25)
      mockNoteModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockNotes)
          })
        })
      })

      const response = await request(app)
        .get('/api/notes?page=2&limit=5')
        .set('x-test-user-id', mockUser._id)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(5)
      expect(response.body.pagination.currentPage).toBe(2)
      expect(response.body.pagination.totalPages).toBe(5)
      expect(response.body.pagination.totalCount).toBe(25)
      expect(response.body.pagination.limit).toBe(5)
    })

    test('should get notes with sorting parameters', async () => {
      const mockUser = createMockUser()
      const mockNotes = createMockNoteArray(3, mockUser._id)
      const mockNoteModel = require('../../models/Note.js')

      // Mock countDocuments and find methods
      mockNoteModel.countDocuments.mockResolvedValue(3)
      mockNoteModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockNotes)
          })
        })
      })

      const response = await request(app)
        .get('/api/notes?sortBy=title&sortOrder=asc')
        .set('x-test-user-id', mockUser._id)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(3)
    })

    test('should return empty array when no notes', async () => {
      const mockUser = createMockUser()
      const mockNoteModel = require('../../models/Note.js')

      // Mock countDocuments and find methods
      mockNoteModel.countDocuments.mockResolvedValue(0)
      mockNoteModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        })
      })

      const response = await request(app)
        .get('/api/notes')
        .set('x-test-user-id', mockUser._id)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveLength(0)
      expect(response.body.pagination.totalCount).toBe(0)
      expect(response.body.pagination.totalPages).toBe(0)
    })
  })

  describe('GET /api/notes/:id', () => {
    test('should get note by ID', async () => {
      const mockUser = createMockUser()
      const mockNote = createMockNote({ owner: mockUser._id })
      mockNoteModel.findOneNotDeleted.mockResolvedValue(mockNote)

      const response = await request(app)
        .get(`/api/notes/${mockNote._id}`)
        .set('x-test-user-id', mockUser._id)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data._id).toBe(mockNote._id)
      expect(response.body.data.title).toBe(mockNote.title)
      expect(response.body.data.content).toBe(mockNote.content)
    })

    test('should return 404 for non-existent note', async () => {
      const mockUser = createMockUser()
      const mockNoteModel = require('../../models/Note.js')
      mockNoteModel.findOneNotDeleted.mockResolvedValue(null)

      const response = await request(app)
        .get('/api/notes/non-existent-note-id')
        .set('x-test-user-id', mockUser._id)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Note not found')
    })
  })

  describe('PUT /api/notes/:id', () => {
    test('should update note successfully', async () => {
      const mockUser = createMockUser()
      const mockNote = createMockNote({ owner: mockUser._id })
      const updatedNote = { ...mockNote, title: 'Updated Title', content: 'Updated Content' }
      const mockNoteModel = require('../../models/Note.js')
      mockNoteModel.findNotDeletedAndUpdate.mockResolvedValue(updatedNote)

      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content'
      }

      const response = await request(app)
        .put(`/api/notes/${mockNote._id}`)
        .set('x-test-user-id', mockUser._id)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.title).toBe(updateData.title)
      expect(response.body.data.content).toBe(updateData.content)
    })

    test('should return 404 for non-existent note', async () => {
      const mockUser = createMockUser()
      const mockNoteModel = require('../../models/Note.js')
      mockNoteModel.findNotDeletedAndUpdate.mockResolvedValue(null)

      const response = await request(app)
        .put('/api/notes/non-existent-note-id')
        .set('x-test-user-id', mockUser._id)
        .send(testNoteData)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Note not found')
    })
  })

  describe('DELETE /api/notes/:id', () => {
    test('should delete note successfully', async () => {
      const mockUser = createMockUser()
      const mockNote = createMockNote({ owner: mockUser._id })

      mockNoteModel.findNotDeletedAndDelete.mockResolvedValue(mockNote)

      const response = await request(app)
        .delete(`/api/notes/${mockNote._id}`)
        .set('x-test-user-id', mockUser._id)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Note deleted successfully')
    })

    test('should return 404 for non-existent note', async () => {
      const mockUser = createMockUser()
      const mockNoteModel = require('../../models/Note.js')
      mockNoteModel.findNotDeletedAndDelete.mockResolvedValue(null)

      const response = await request(app)
        .delete('/api/notes/non-existent-note-id')
        .set('x-test-user-id', mockUser._id)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Note not found')
    })
  })
})
