import User from '../models/User.js'
import Note from '../models/Note.js'
import fs from 'fs'
import path from 'path'

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findNotDeleted().select('-password').sort({ createdAt: -1 })

    // Convert avatar paths to full URLs for all users
    const { protocol } = req
    const host = req.get('host')
    users.forEach(user => {
      if (user.avatar && !user.avatar.startsWith('http')) {
        user.avatar = `${protocol}://${host}/uploads/avatars/${path.basename(user.avatar)}`
      }
    })

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findByIdNotDeleted(id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Convert avatar path to full URL if needed
    if (user.avatar && !user.avatar.startsWith('http')) {
      const { protocol } = req
      const host = req.get('host')
      user.avatar = `${protocol}://${host}/uploads/avatars/${path.basename(user.avatar)}`
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Update user by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email } = req.body

    // Get current user first to check if user exists
    const currentUser = await User.findByIdNotDeleted(id)
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check if email is being updated and if it already exists
    if (email) {
      const existingUser = await User.findOneNotDeleted({ email, _id: { $ne: id } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        })
      }
    }

    // Prepare update data
    const updateData = { name, email }

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists
      if (currentUser.avatar) {
        // Extract filename from full URL if it's a URL, or use as path if it's a relative path
        const oldAvatarPath = currentUser.avatar.startsWith('http')
          ? path.join(process.cwd(), 'uploads/avatars', path.basename(currentUser.avatar))
          : path.join(process.cwd(), currentUser.avatar)
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath)
        }
      }
      // Set new avatar URL with full host
      const { protocol } = req
      const host = req.get('host')
      const avatarUrl = `${protocol}://${host}/uploads/avatars/${path.basename(req.file.path)}`
      updateData.avatar = avatarUrl
    }

    const user = await User.findNotDeletedAndUpdate({ _id: id }, updateData, {
      new: true,
      runValidators: true
    }).select('-password')

    // Convert avatar path to full URL if needed
    if (user.avatar && !user.avatar.startsWith('http')) {
      const { protocol } = req
      const host = req.get('host')
      user.avatar = `${protocol}://${host}/uploads/avatars/${path.basename(user.avatar)}`
    }

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// Update user password
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      })
    }

    // Get user with password
    const user = await User.findOneNotDeleted({ _id: id }).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// Delete user by ID (cascade delete notes)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // First, soft delete all notes belonging to this user
    await Note.updateMany({ owner: id, deletedAt: null }, { deletedAt: new Date() })

    // Then soft delete the user
    const user = await User.findNotDeletedAndDelete({ _id: id })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'User and all associated notes deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get user avatar by ID
const getUserAvatar = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findByIdNotDeleted(id).select('avatar')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Return avatar URL or null
    // If avatar is already a full URL, return it as is
    // If it's a relative path, construct the full URL
    let avatarUrl = null
    if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        avatarUrl = user.avatar
      } else {
        const { protocol } = req
        const host = req.get('host')
        avatarUrl = `${protocol}://${host}/uploads/avatars/${path.basename(user.avatar)}`
      }
    }

    res.status(200).json({
      success: true,
      data: {
        avatarUrl
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export { getAllUsers, getUserById, updateUser, updateUserPassword, deleteUser, getUserAvatar }
