import mongoose from 'mongoose'

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, 'Token is required'],
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: { expireAfterSeconds: 0 } // MongoDB TTL index for automatic cleanup
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

// Static method to create refresh token with automatic expiration
refreshTokenSchema.statics.createToken = function (userId, token, expiresInDays = 7) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  return this.create({
    token,
    userId,
    expiresAt
  })
}

// Static method to find and delete token
refreshTokenSchema.statics.findAndDelete = function (token) {
  return this.findOneAndUpdate({ token, deletedAt: null }, { deletedAt: new Date() }, { new: true })
}

// Static method for logical deletion
refreshTokenSchema.statics.findNotDeleted = function (query = {}) {
  return this.find({ ...query, deletedAt: null })
}

refreshTokenSchema.statics.findOneNotDeleted = function (query = {}) {
  return this.findOne({ ...query, deletedAt: null })
}

// Instance method for logical deletion
refreshTokenSchema.methods.softDelete = function () {
  this.deletedAt = new Date()
  return this.save()
}

export default mongoose.model('RefreshToken', refreshTokenSchema)
