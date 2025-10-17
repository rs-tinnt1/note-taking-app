import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m'
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'

// Generate access token (15 minutes)
export const generateAccessToken = (userOrId, email, name) => {
  const user = typeof userOrId === 'object' ? userOrId : { _id: userOrId, email, name }
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRY }
  )
}

// Generate refresh token (7 days)
export const generateRefreshToken = (userOrId, email) => {
  const user = typeof userOrId === 'object' ? userOrId : { _id: userOrId, email }
  return jwt.sign(
    {
      userId: user._id,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  )
}

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

// Generate token pair
export const generateTokenPair = user => ({
  accessToken: generateAccessToken(user),
  refreshToken: generateRefreshToken(user)
})

// Default export
export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair
}
