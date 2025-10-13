import User from '../models/User.js'
import Note from '../models/Note.js'

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findNotDeleted().select('-password').sort({ createdAt: -1 })
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

    const user = await User.findNotDeletedAndUpdate(
      { _id: id },
      { name, email },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
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
    await Note.updateMany(
      { owner: id, deletedAt: null },
      { deletedAt: new Date() }
    )

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

export {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  deleteUser
}
