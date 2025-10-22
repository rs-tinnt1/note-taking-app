// Mock data factory functions for testing

export const createMockUser = (overrides = {}) => ({
  _id: 'mock-user-id-123',
  name: 'Test User',
  email: 'test@example.com',
  password: '$2a$12$hashedpassword',
  deletedAt: null,
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  comparePassword: jest.fn().mockResolvedValue(true),
  softDelete: jest.fn().mockResolvedValue(),
  toJSON: function () {
    const { password: _password, ...userWithoutPassword } = this
    return userWithoutPassword
  },
  ...overrides
})

export const createMockNote = (ownerId = 'mock-user-id-123', overrides = {}) => ({
  _id: 'mock-note-id-123',
  title: 'Test Note',
  content: 'This is test note content',
  owner: ownerId,
  deletedAt: null,
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  softDelete: jest.fn().mockResolvedValue(),
  toJSON: function () {
    return {
      _id: this._id,
      title: this.title,
      content: this.content,
      owner: this.owner,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  },
  ...overrides
})

export const createMockRefreshToken = (overrides = {}) => ({
  _id: 'mock-token-id-123',
  token: 'mock-refresh-token-123',
  userId: 'mock-user-id-123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  deletedAt: null,
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  softDelete: jest.fn().mockResolvedValue(),
  toJSON: function () {
    return {
      _id: this._id,
      token: this.token,
      userId: this.userId,
      expiresAt: this.expiresAt,
      deletedAt: this.deletedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  },
  ...overrides
})

export const createMockUserArray = (count = 3) =>
  Array.from({ length: count }, (_, index) =>
    createMockUser({
      _id: `mock-user-id-${index + 1}`,
      name: `User ${index + 1}`,
      email: `user${index + 1}@example.com`
    })
  )

export const createMockNoteArray = (count = 3, ownerId = 'mock-user-id-123') =>
  Array.from({ length: count }, (_, index) =>
    createMockNote(ownerId, {
      _id: `mock-note-id-${index + 1}`,
      title: `Note ${index + 1}`,
      content: `Content ${index + 1}`
    })
  )

export const createMockRefreshTokenArray = (count = 3, userId = 'mock-user-id-123') =>
  Array.from({ length: count }, (_, index) =>
    createMockRefreshToken({
      _id: `mock-token-id-${index + 1}`,
      token: `mock-refresh-token-${index + 1}`,
      userId: userId
    })
  )

// Common test data
export const testUserData = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
}

export const testNoteData = {
  title: 'Test Note',
  content: 'This is test note content'
}

export const testLoginData = {
  email: 'test@example.com',
  password: 'password123'
}
