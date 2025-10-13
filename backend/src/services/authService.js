import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m'
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'

// Generate access token (15 minutes)
export const generateAccessToken = (userId, email) => jwt.sign(
  { userId, email },
  JWT_SECRET,
  { expiresIn: JWT_ACCESS_EXPIRY }
)

// Generate refresh token (7 days)
export const generateRefreshToken = (userId, email) => jwt.sign(
  { userId, email },
  JWT_REFRESH_SECRET,
  { expiresIn: JWT_REFRESH_EXPIRY }
)

// Verify access token
export const verifyAccessToken = token => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    throw new Error('Invalid or expired access token')
  }
}

// Verify refresh token
export const verifyRefreshToken = token => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch {
    throw new Error('Invalid or expired refresh token')
  }
}
