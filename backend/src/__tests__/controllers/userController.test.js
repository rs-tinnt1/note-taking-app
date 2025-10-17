// Import mock objects first
import { mockNoteModel, mockUserModel, resetAllMocks, setupAllMocks } from '../helpers/modelMocks.js'

// Mock the models first
jest.mock('../../models/User.js', () => mockUserModel)
jest.mock('../../models/Note.js', () => mockNoteModel)

// Now import everything else
import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'
import { deleteUser, getAllUsers, getUserById, updateUser, updateUserPassword } from '../../controllers/userController.js'
import { createMockNoteArray, createMockUser, createMockUserArray } from '../helpers/mockData.js'

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

// Apply mock auth middleware and user routes
app.use('/api/users', mockAuth)
app.get('/api/users', getAllUsers)
app.get('/api/users/:id', getUserById)
app.put('/api/users/:id', updateUser)
app.put('/api/users/:id/password', updateUserPassword)
app.delete('/api/users/:id', deleteUser)

describe('UserController', () => {
  beforeEach(() => {
    resetAllMocks()
    setupAllMocks()
  })

  describe('GET /api/users', () => {
    test('should get all users', async () => {
      const mockUsers = createMockUserArray(3)
      mockUserModel.findNotDeleted.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers)
        })
      })

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.count).toBe(3)
      expect(response.body.data).toHaveLength(3)
      expect(response.body.data[0]).toHaveProperty('name')
      expect(response.body.data[0]).toHaveProperty('email')
      expect(response.body.data[0]).not.toHaveProperty('password')
    })

    test('should not return deleted users', async () => {
      const mockUsers = createMockUserArray(2)
      mockUserModel.findNotDeleted.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers)
        })
      })

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.count).toBe(2)
      expect(response.body.data).toHaveLength(2)
    })

    test('should sort users by creation date (newest first)', async () => {
      const mockUsers = createMockUserArray(3)
      // Sort by creation date descending
      mockUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      mockUserModel.findNotDeleted.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockUsers)
        })
      })

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      const users = response.body.data
      for (let i = 0; i < users.length - 1; i++) {
        const currentDate = new Date(users[i].createdAt)
        const nextDate = new Date(users[i + 1].createdAt)
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime())
      }
    })
  })

  describe('GET /api/users/:id', () => {
    test('should get user by ID', async () => {
      const mockUser = createMockUser()
      mockUserModel.findByIdNotDeleted.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      })

      const response = await request(app)
        .get(`/api/users/${mockUser._id}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data._id).toBe(mockUser._id)
      expect(response.body.data.name).toBe(mockUser.name)
      expect(response.body.data.email).toBe(mockUser.email)
      expect(response.body.data.password).toBeUndefined()
    })

    test('should return 404 for non-existent user', async () => {
      mockUserModel.findByIdNotDeleted.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      })

      const response = await request(app)
        .get('/api/users/non-existent-user-id')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('User not found')
    })
  })

  describe('PUT /api/users/:id', () => {
    test('should update user successfully', async () => {
      const mockUser = createMockUser()
      const updatedUser = { ...mockUser, name: 'Updated Name', email: 'updated@example.com' }

      mockUserModel.findOneNotDeleted.mockResolvedValue(null) // No duplicate email
      mockUserModel.findNotDeletedAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      })

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      }

      const response = await request(app)
        .put(`/api/users/${mockUser._id}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
      expect(response.body.data.name).toBe(updateData.name)
      expect(response.body.data.email).toBe(updateData.email)
    })

    test('should return 400 for duplicate email', async () => {
      const mockUser = createMockUser()
      const existingUser = createMockUser({ email: 'existing@example.com' })

      mockUserModel.findOneNotDeleted.mockResolvedValue(existingUser) // Duplicate email exists

      const updateData = {
        name: 'Updated Name',
        email: 'existing@example.com'
      }

      const response = await request(app)
        .put(`/api/users/${mockUser._id}`)
        .send(updateData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('User with this email already exists')
    })

    test('should return 404 for non-existent user', async () => {
      mockUserModel.findOneNotDeleted.mockResolvedValue(null) // No duplicate email
      mockUserModel.findNotDeletedAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      })

      const response = await request(app)
        .put('/api/users/non-existent-user-id')
        .send({ name: 'Updated Name' })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('User not found')
    })
  })

  describe('PUT /api/users/:id/password', () => {
    test('should update user password successfully', async () => {
      const mockUser = createMockUser()
      const mockSave = jest.fn().mockResolvedValue(mockUser)
      mockUser.comparePassword.mockResolvedValue(true) // Current password is correct
      mockUserModel.findOneNotDeleted.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          save: mockSave
        })
      })

      const passwordData = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123'
      }

      const response = await request(app)
        .put(`/api/users/${mockUser._id}/password`)
        .send(passwordData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Password updated successfully')
      expect(mockSave).toHaveBeenCalled()
    })

    test('should return 400 for missing current password', async () => {
      const mockUser = createMockUser()

      const passwordData = {
        newPassword: 'newPassword123'
      }

      const response = await request(app)
        .put(`/api/users/${mockUser._id}/password`)
        .send(passwordData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Current password and new password are required')
    })

    test('should return 400 for missing new password', async () => {
      const mockUser = createMockUser()

      const passwordData = {
        currentPassword: 'currentPassword123'
      }

      const response = await request(app)
        .put(`/api/users/${mockUser._id}/password`)
        .send(passwordData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Current password and new password are required')
    })

    test('should return 400 for short new password', async () => {
      const mockUser = createMockUser()

      const passwordData = {
        currentPassword: 'currentPassword123',
        newPassword: '123' // Too short
      }

      const response = await request(app)
        .put(`/api/users/${mockUser._id}/password`)
        .send(passwordData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('New password must be at least 6 characters')
    })

    test('should return 400 for incorrect current password', async () => {
      const mockUser = createMockUser()
      mockUser.comparePassword.mockResolvedValue(false) // Current password is wrong
      mockUserModel.findOneNotDeleted.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          comparePassword: mockUser.comparePassword
        })
      })

      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123'
      }

      const response = await request(app)
        .put(`/api/users/${mockUser._id}/password`)
        .send(passwordData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Current password is incorrect')
    })

    test('should return 404 for non-existent user', async () => {
      mockUserModel.findOneNotDeleted.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      })

      const passwordData = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123'
      }

      const response = await request(app)
        .put('/api/users/non-existent-user-id/password')
        .send(passwordData)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('User not found')
    })
  })

  describe('DELETE /api/users/:id', () => {
    test('should delete user successfully', async () => {
      const mockUser = createMockUser()
      const mockNotes = createMockNoteArray(2, mockUser._id)

      mockUserModel.findNotDeletedAndDelete.mockResolvedValue(mockUser)
      mockNoteModel.updateMany.mockResolvedValue({ modifiedCount: 2 })

      const response = await request(app)
        .delete(`/api/users/${mockUser._id}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('User and all associated notes deleted successfully')
      expect(mockNoteModel.updateMany).toHaveBeenCalledWith(
        { owner: mockUser._id, deletedAt: null },
        { deletedAt: expect.any(Date) }
      )
    })

    test('should return 404 for non-existent user', async () => {
      mockUserModel.findNotDeletedAndDelete.mockResolvedValue(null)

      const response = await request(app)
        .delete('/api/users/non-existent-user-id')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('User not found')
    })

    test('should handle cascade delete of user notes', async () => {
      const mockUser = createMockUser()
      const mockNotes = createMockNoteArray(3, mockUser._id)

      mockUserModel.findNotDeletedAndDelete.mockResolvedValue(mockUser)
      mockNoteModel.updateMany.mockResolvedValue({ modifiedCount: 3 })

      const response = await request(app)
        .delete(`/api/users/${mockUser._id}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(mockNoteModel.updateMany).toHaveBeenCalledWith(
        { owner: mockUser._id, deletedAt: null },
        { deletedAt: expect.any(Date) }
      )
    })
  })
})
