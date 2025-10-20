// Import mock objects first
import { mockUserModel, resetAllMocks, setupAllMocks } from '../helpers/modelMocks.js'

// Mock the User model first
jest.mock('../../models/User.js', () => mockUserModel)

// Set environment variables
process.env.JWT_SECRET = 'your-secret-key'
process.env.JWT_REFRESH_SECRET = 'your-refresh-secret-key'

// Now import everything else
import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'
import { authenticate } from '../../middleware/auth.js'
import { createMockUser } from '../helpers/mockData.js'

// Create Express app for testing
const app = express()
app.use(express.json())

// Test route that requires authentication
app.get('/protected', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Access granted',
    user: req.user
  })
})

describe('Auth Middleware', () => {
  beforeEach(() => {
    resetAllMocks()
    setupAllMocks()
  })

  describe('Valid Token', () => {
    test('should allow access with valid access token', async () => {
      const mockUser = createMockUser()

      const accessToken = jwt.sign(
        {
          userId: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      )

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('Access granted')
      expect(response.body.user).toBeDefined()
      expect(response.body.user.userId).toBe(mockUser._id)
      expect(response.body.user.email).toBe(mockUser.email)
    })

    test('should attach user information to request object', async () => {
      const mockUser = createMockUser()

      const accessToken = jwt.sign(
        {
          userId: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      )

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.user).toMatchObject({
        userId: mockUser._id,
        email: mockUser.email
      })
    })
  })

  describe('Invalid Token', () => {
    test('should return 401 for missing Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Access token required')
    })

    test('should return 401 for invalid token format', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Access token required')
    })

    test('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid or expired access token')
    })

    test('should return 401 for expired token', async () => {
      const mockUser = createMockUser()
      const expiredToken = jwt.sign(
        {
          userId: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' } // Very short expiration
      )

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10))

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid or expired access token')
    })

    test('should return 401 for refresh token used as access token', async () => {
      const mockUser = createMockUser()
      const refreshToken = jwt.sign(
        {
          userId: mockUser._id,
          type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid or expired access token')
    })

    test('should return 401 for token with wrong secret', async () => {
      const mockUser = createMockUser()
      const wrongSecretToken = jwt.sign(
        {
          userId: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          type: 'access'
        },
        'wrong-secret',
        { expiresIn: '15m' }
      )

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${wrongSecretToken}`)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid or expired access token')
    })
  })

  describe('Error Handling', () => {
    test('should handle malformed JWT', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer malformed.jwt.token')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Invalid or expired access token')
    })

    test('should handle empty token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer ')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain('Access token required')
    })
  })
})
