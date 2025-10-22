// Mock environment variables FIRST
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret'
process.env.JWT_ACCESS_EXPIRY = '15m'
process.env.JWT_REFRESH_EXPIRY = '7d'

// Now import everything else
import jwt from 'jsonwebtoken'
import authService from '../../services/authService.js'

describe('AuthService', () => {
  const testUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User'
  }

  describe('generateAccessToken', () => {
    test('should generate a valid access token', () => {
      const token = authService.generateAccessToken(testUser._id, testUser.email, testUser.name)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      // Verify token can be decoded
      const decoded = jwt.verify(token, 'your-secret-key')
      expect(decoded.userId).toBe(testUser._id.toString())
      expect(decoded.email).toBe(testUser.email)
      expect(decoded.type).toBe('access')
    })

    test('should include correct payload in access token', () => {
      const token = authService.generateAccessToken(testUser._id, testUser.email, testUser.name)
      const decoded = jwt.verify(token, 'your-secret-key')

      expect(decoded).toMatchObject({
        userId: testUser._id,
        email: testUser.email,
        name: testUser.name,
        type: 'access'
      })
    })

    test('should have correct expiration time', () => {
      const token = authService.generateAccessToken(testUser._id, testUser.email, testUser.name)
      const decoded = jwt.verify(token, 'your-secret-key')

      const now = Math.floor(Date.now() / 1000)
      const tokenExp = decoded.exp
      const expectedExp = now + 15 * 60 // 15 minutes

      // Allow 5 seconds tolerance
      expect(Math.abs(tokenExp - expectedExp)).toBeLessThan(5)
    })
  })

  describe('generateRefreshToken', () => {
    test('should generate a valid refresh token', () => {
      const token = authService.generateRefreshToken(testUser._id, testUser.email)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      // Verify token can be decoded
      const decoded = jwt.verify(token, 'your-refresh-secret-key')
      expect(decoded.userId).toBe(testUser._id.toString())
      expect(decoded.type).toBe('refresh')
    })

    test('should include correct payload in refresh token', () => {
      const token = authService.generateRefreshToken(testUser._id, testUser.email)
      const decoded = jwt.verify(token, 'your-refresh-secret-key')

      expect(decoded).toMatchObject({
        userId: testUser._id,
        type: 'refresh'
      })
    })

    test('should have correct expiration time', () => {
      const token = authService.generateRefreshToken(testUser._id, testUser.email)
      const decoded = jwt.verify(token, 'your-refresh-secret-key')

      const now = Math.floor(Date.now() / 1000)
      const tokenExp = decoded.exp
      const expectedExp = now + 7 * 24 * 60 * 60 // 7 days

      // Allow 5 minutes tolerance
      expect(Math.abs(tokenExp - expectedExp)).toBeLessThan(300)
    })
  })

  describe('verifyAccessToken', () => {
    test('should verify a valid access token', () => {
      const token = authService.generateAccessToken(testUser._id, testUser.email, testUser.name)
      const decoded = authService.verifyAccessToken(token)

      expect(decoded).toBeDefined()
      expect(decoded.userId).toBe(testUser._id.toString())
      expect(decoded.email).toBe(testUser.email)
      expect(decoded.type).toBe('access')
    })

    test('should throw error for invalid token', () => {
      const invalidToken = 'invalid-token'

      expect(() => {
        authService.verifyAccessToken(invalidToken)
      }).toThrow()
    })

    test('should throw error for expired token', () => {
      // Create an expired token by mocking the current time
      const expiredToken = jwt.sign(
        {
          userId: testUser._id,
          email: testUser.email,
          name: testUser.name,
          type: 'access'
        },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' } // Very short expiration
      )

      // Wait for token to expire
      setTimeout(() => {
        expect(() => {
          authService.verifyAccessToken(expiredToken)
        }).toThrow()
      }, 10)
    })

    test('should throw error for refresh token used as access token', () => {
      const refreshToken = authService.generateRefreshToken(testUser._id, testUser.email)

      expect(() => {
        authService.verifyAccessToken(refreshToken)
      }).toThrow()
    })
  })

  describe('verifyRefreshToken', () => {
    test('should verify a valid refresh token', () => {
      const token = authService.generateRefreshToken(testUser._id, testUser.email)
      const decoded = authService.verifyRefreshToken(token)

      expect(decoded).toBeDefined()
      expect(decoded.userId).toBe(testUser._id.toString())
      expect(decoded.type).toBe('refresh')
    })

    test('should throw error for invalid token', () => {
      const invalidToken = 'invalid-token'

      expect(() => {
        authService.verifyRefreshToken(invalidToken)
      }).toThrow()
    })

    test('should throw error for expired token', () => {
      // Create an expired token by mocking the current time
      const expiredToken = jwt.sign(
        {
          userId: testUser._id,
          type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '1ms' } // Very short expiration
      )

      // Wait for token to expire
      setTimeout(() => {
        expect(() => {
          authService.verifyRefreshToken(expiredToken)
        }).toThrow()
      }, 10)
    })

    test('should throw error for access token used as refresh token', () => {
      const accessToken = authService.generateAccessToken(
        testUser._id,
        testUser.email,
        testUser.name
      )

      expect(() => {
        authService.verifyRefreshToken(accessToken)
      }).toThrow()
    })
  })

  describe('generateTokenPair', () => {
    test('should generate both access and refresh tokens', () => {
      const tokenPair = authService.generateTokenPair(testUser._id, testUser.email, testUser.name)

      expect(tokenPair).toBeDefined()
      expect(tokenPair.accessToken).toBeDefined()
      expect(tokenPair.refreshToken).toBeDefined()
      expect(typeof tokenPair.accessToken).toBe('string')
      expect(typeof tokenPair.refreshToken).toBe('string')
    })

    test('should generate valid tokens', () => {
      const tokenPair = authService.generateTokenPair(testUser._id, testUser.email, testUser.name)

      // Verify access token
      const accessDecoded = authService.verifyAccessToken(tokenPair.accessToken)
      expect(accessDecoded.userId).toBe(testUser._id)
      expect(accessDecoded.type).toBe('access')

      // Verify refresh token
      const refreshDecoded = authService.verifyRefreshToken(tokenPair.refreshToken)
      expect(refreshDecoded.userId).toBe(testUser._id)
      expect(refreshDecoded.type).toBe('refresh')
    })
  })

  describe('Error Handling', () => {
    test('should use fallback JWT_SECRET when not set', () => {
      const originalSecret = process.env.JWT_SECRET
      process.env.JWT_SECRET = undefined

      const token = authService.generateAccessToken(testUser._id, testUser.email, testUser.name)
      const decoded = jwt.verify(token, 'your-secret-key')

      expect(decoded.userId).toBe(testUser._id.toString())
      expect(decoded.type).toBe('access')

      // Restore original secret
      process.env.JWT_SECRET = originalSecret
    })

    test('should use fallback JWT_REFRESH_SECRET when not set', () => {
      const originalSecret = process.env.JWT_REFRESH_SECRET
      process.env.JWT_REFRESH_SECRET = undefined

      const token = authService.generateRefreshToken(testUser._id, testUser.email)
      const decoded = jwt.verify(token, 'your-refresh-secret-key')

      expect(decoded.userId).toBe(testUser._id.toString())
      expect(decoded.type).toBe('refresh')

      // Restore original secret
      process.env.JWT_REFRESH_SECRET = originalSecret
    })
  })
})
