// Reusable model mocks for testing

import { createMockNote, createMockRefreshToken, createMockUser } from './mockData.js'

// Mock mongoose
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

// Mock User model
export const mockUserModel = {
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

// Mock User constructor - this is the default export
const UserConstructor = jest.fn(data => {
  const userInstance = {
    ...data,
    save: jest.fn().mockResolvedValue({ ...data, _id: data._id || 'generated-user-id' }),
    comparePassword: jest.fn().mockResolvedValue(true),
    softDelete: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockImplementation(function () {
      const userObject = { ...this }
      delete userObject.password
      return userObject
    }),
    toJSON: jest.fn().mockImplementation(function () {
      const userObject = { ...this }
      delete userObject.password
      return userObject
    })
  }
  return userInstance
})

// Set the constructor as the default export
Object.assign(UserConstructor, mockUserModel)
mockUserModel.mockImplementation = UserConstructor

// Mock User static methods
mockUserModel.findOneNotDeleted = jest.fn()
mockUserModel.findByIdNotDeleted = jest.fn()
mockUserModel.findNotDeleted = jest.fn()
mockUserModel.findNotDeletedAndUpdate = jest.fn()
mockUserModel.findNotDeletedAndDelete = jest.fn()

// Export the mock as default export
export default UserConstructor

// Mock Note model
export const mockNoteModel = {
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

// Mock Note constructor - this is the default export
const NoteConstructor = jest.fn(data => {
  const noteInstance = {
    ...data,
    save: jest.fn().mockResolvedValue({ ...data, _id: data._id || 'generated-note-id' }),
    softDelete: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockImplementation(function () {
      return { ...this }
    }),
    toJSON: jest.fn().mockImplementation(function () {
      return { ...this }
    })
  }
  return noteInstance
})

// Set the constructor as the default export
Object.assign(NoteConstructor, mockNoteModel)
mockNoteModel.mockImplementation = NoteConstructor

// Mock Note static methods
mockNoteModel.findOneNotDeleted = jest.fn()
mockNoteModel.findNotDeleted = jest.fn()
mockNoteModel.findNotDeletedAndUpdate = jest.fn()
mockNoteModel.findNotDeletedAndDelete = jest.fn()

// Mock RefreshToken model
export const mockRefreshTokenModel = {
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
  findAndDelete: jest.fn(),
  createToken: jest.fn(),
  select: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis()
}

// Setup common mock behaviors
export const setupUserMocks = () => {
  // Only setup if UserConstructor exists (it might not in some test files)
  if (UserConstructor) {
    UserConstructor.create.mockResolvedValue(createMockUser())
    UserConstructor.findOne.mockResolvedValue(createMockUser())
    UserConstructor.findOneNotDeleted.mockResolvedValue(null) // Default to null for validation
    UserConstructor.findByIdNotDeleted.mockResolvedValue(createMockUser())
    UserConstructor.findNotDeleted.mockResolvedValue([createMockUser()])
    UserConstructor.findNotDeletedAndUpdate.mockResolvedValue(createMockUser())
    UserConstructor.findNotDeletedAndDelete.mockResolvedValue(createMockUser())
    UserConstructor.findById.mockResolvedValue(createMockUser())
    UserConstructor.findByIdAndUpdate.mockResolvedValue(createMockUser())
    UserConstructor.findByIdAndDelete.mockResolvedValue(createMockUser())
    UserConstructor.find.mockResolvedValue([createMockUser()])
    UserConstructor.countDocuments.mockResolvedValue(1)

    // Setup method chaining for common patterns
    UserConstructor.findNotDeleted.mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([createMockUser()])
      })
    })

    UserConstructor.findOneNotDeleted.mockReturnValue({
      select: jest.fn().mockResolvedValue(null) // Default to null for validation
    })

    UserConstructor.findNotDeletedAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue(createMockUser())
    })
  }
}

export const setupNoteMocks = () => {
  mockNoteModel.create.mockResolvedValue(createMockNote())
  mockNoteModel.findOne.mockResolvedValue(createMockNote())
  mockNoteModel.findOneNotDeleted.mockResolvedValue(createMockNote())
  mockNoteModel.findByIdNotDeleted.mockResolvedValue(createMockNote())
  mockNoteModel.findNotDeleted.mockResolvedValue([createMockNote()])
  mockNoteModel.findNotDeletedAndUpdate.mockResolvedValue(createMockNote())
  mockNoteModel.findNotDeletedAndDelete.mockResolvedValue(createMockNote())
  mockNoteModel.findById.mockResolvedValue(createMockNote())
  mockNoteModel.findByIdAndUpdate.mockResolvedValue(createMockNote())
  mockNoteModel.findByIdAndDelete.mockResolvedValue(createMockNote())
  mockNoteModel.find.mockResolvedValue([createMockNote()])
  mockNoteModel.countDocuments.mockResolvedValue(1)
  mockNoteModel.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 1 })

  // Setup method chaining for common patterns
  mockNoteModel.findNotDeleted.mockReturnValue({
    sort: jest.fn().mockResolvedValue([createMockNote()])
  })
}

export const setupRefreshTokenMocks = () => {
  mockRefreshTokenModel.create.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.findOne.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.findOneNotDeleted.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.findByIdNotDeleted.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.findNotDeleted.mockResolvedValue([createMockRefreshToken()])
  mockRefreshTokenModel.findNotDeletedAndUpdate.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.findNotDeletedAndDelete.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.findById.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.findByIdAndUpdate.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.findByIdAndDelete.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.find.mockResolvedValue([createMockRefreshToken()])
  mockRefreshTokenModel.countDocuments.mockResolvedValue(1)
  mockRefreshTokenModel.findAndDelete.mockResolvedValue(createMockRefreshToken())
  mockRefreshTokenModel.createToken.mockResolvedValue(createMockRefreshToken())
}

// Reset all mocks
export const resetAllMocks = () => {
  // Reset UserConstructor methods if it exists
  if (UserConstructor) {
    if (UserConstructor.create) UserConstructor.create.mockReset()
    if (UserConstructor.findOne) UserConstructor.findOne.mockReset()
    if (UserConstructor.findOneNotDeleted) UserConstructor.findOneNotDeleted.mockReset()
    if (UserConstructor.findByIdNotDeleted) UserConstructor.findByIdNotDeleted.mockReset()
    if (UserConstructor.findNotDeleted) UserConstructor.findNotDeleted.mockReset()
    if (UserConstructor.findNotDeletedAndUpdate) UserConstructor.findNotDeletedAndUpdate.mockReset()
    if (UserConstructor.findNotDeletedAndDelete) UserConstructor.findNotDeletedAndDelete.mockReset()
    if (UserConstructor.findById) UserConstructor.findById.mockReset()
    if (UserConstructor.findByIdAndUpdate) UserConstructor.findByIdAndUpdate.mockReset()
    if (UserConstructor.findByIdAndDelete) UserConstructor.findByIdAndDelete.mockReset()
    if (UserConstructor.find) UserConstructor.find.mockReset()
    if (UserConstructor.countDocuments) UserConstructor.countDocuments.mockReset()
  }

  Object.values(mockNoteModel).forEach(mock => {
    if (typeof mock === 'function') mock.mockReset()
  })
  Object.values(mockRefreshTokenModel).forEach(mock => {
    if (typeof mock === 'function') mock.mockReset()
  })
}

// Setup all mocks
export const setupAllMocks = () => {
  setupUserMocks()
  setupNoteMocks()
  setupRefreshTokenMocks()
}
