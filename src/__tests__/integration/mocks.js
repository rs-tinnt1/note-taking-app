import { createMockNote, createMockRefreshToken, createMockUser } from './helpers.js'
import User from '../../models/User.js'
import Note from '../../models/Note.js'
import RefreshToken from '../../models/RefreshToken.js'

// Centralized mock data
export const mockUsers = {
  validUser: createMockUser(),
  userWithAvatar: createMockUser({
    avatar: 'uploads/avatars/test-avatar.jpg'
  }),
  deletedUser: createMockUser({
    deletedAt: new Date()
  }),
  anotherUser: createMockUser({
    _id: '507f1f77bcf86cd799439014',
    email: 'another@example.com',
    name: 'Another User'
  })
}

export const mockNotes = {
  validNote: createMockNote(),
  noteWithLongContent: createMockNote({
    title: 'Long Note',
    content:
      'This is a very long note content that exceeds the normal length for testing purposes. It should be able to handle longer content without issues.'
  }),
  deletedNote: createMockNote({
    deletedAt: new Date()
  }),
  anotherUserNote: createMockNote({
    _id: '507f1f77bcf86cd799439015',
    owner: '507f1f77bcf86cd799439014',
    title: 'Another User Note',
    content: 'This note belongs to another user'
  })
}

export const mockTokens = {
  validRefreshToken: createMockRefreshToken(),
  expiredRefreshToken: createMockRefreshToken({
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Expired yesterday
  }),
  invalidRefreshToken: createMockRefreshToken({
    token: 'invalid-token'
  })
}

// Jest mock configurations
export const setupUserMocks = () => {
  // Mock static methods
  User.findOneNotDeleted = jest.fn()
  User.findByIdNotDeleted = jest.fn()
  User.findNotDeleted = jest.fn()
  User.create = jest.fn()
  User.countDocuments = jest.fn()
  User.findByIdAndUpdate = jest.fn()

  return User
}

export const setupNoteMocks = () => {
  // Mock static methods
  Note.find = jest.fn()
  Note.findById = jest.fn()
  Note.create = jest.fn()
  Note.countDocuments = jest.fn()
  Note.findByIdAndUpdate = jest.fn()
  Note.updateMany = jest.fn()

  return Note
}

export const setupRefreshTokenMocks = () => {
  // Mock static methods
  RefreshToken.findOne = jest.fn()
  RefreshToken.create = jest.fn()
  RefreshToken.deleteOne = jest.fn()
  RefreshToken.deleteMany = jest.fn()

  return RefreshToken
}

export const setupAuthServiceMocks = () => {
  const authService = require('../../services/authService.js')

  authService.generateAccessToken = jest.fn()
  authService.generateRefreshToken = jest.fn()
  authService.verifyAccessToken = jest.fn()
  authService.verifyRefreshToken = jest.fn()

  return authService
}

export const setupEmailServiceMocks = () => {
  const emailService = require('../../services/emailService.js')

  emailService.sendWelcomeEmail = jest.fn()
  emailService.sendPasswordResetEmail = jest.fn()

  return emailService
}

// Setup all mocks for a test
export const setupAllMocks = () => {
  const User = setupUserMocks()
  const Note = setupNoteMocks()
  const RefreshToken = setupRefreshTokenMocks()
  const authService = setupAuthServiceMocks()
  const emailService = setupEmailServiceMocks()

  return {
    User,
    Note,
    RefreshToken,
    authService,
    emailService
  }
}

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks()
}
