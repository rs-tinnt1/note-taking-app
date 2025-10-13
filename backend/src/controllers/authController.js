import User from '../models/User.js'
import RefreshToken from '../models/RefreshToken.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/authService.js'

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOneNotDeleted({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Create user
    const user = new User({
      name,
      email,
      password
    })

    const savedUser = await user.save()

    // Generate tokens
    const accessToken = generateAccessToken(savedUser._id, savedUser.email)
    const refreshToken = generateRefreshToken(savedUser._id, savedUser.email)

    // Store refresh token in database
    await RefreshToken.createToken(savedUser._id, refreshToken)

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(201).json({
      success: true,
      data: {
        user: savedUser,
        accessToken
      }
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user with password
    const user = await User.findOneNotDeleted({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email)
    const refreshToken = generateRefreshToken(user._id, user.email)

    // Store refresh token in database
    await RefreshToken.createToken(user._id, refreshToken)

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(200).json({
      success: true,
      data: {
        user: userResponse,
        accessToken
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Logout user
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (refreshToken) {
      // Remove refresh token from database
      await RefreshToken.findAndDelete(refreshToken)
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken')

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      })
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)

    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOneNotDeleted({ token: refreshToken })
    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }

    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId, decoded.email)

    res.status(200).json({
      success: true,
      data: {
        accessToken
      }
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    })
  }
}

export {
  register,
  login,
  logout,
  refreshToken
}
