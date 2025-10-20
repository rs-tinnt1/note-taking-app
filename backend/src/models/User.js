import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  deletedAt: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

// Static method for logical deletion
userSchema.statics.findNotDeleted = function (query = {}) {
  return this.find({ ...query, deletedAt: null })
}

userSchema.statics.findOneNotDeleted = function (query = {}) {
  return this.findOne({ ...query, deletedAt: null })
}

userSchema.statics.findByIdNotDeleted = function (id) {
  return this.findOne({ _id: id, deletedAt: null })
}

userSchema.statics.findNotDeletedAndUpdate = function (query, update, options = {}) {
  return this.findOneAndUpdate({ ...query, deletedAt: null }, update, options)
}

userSchema.statics.findNotDeletedAndDelete = function (query) {
  return this.findOneAndUpdate(
    { ...query, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  )
}

// Instance method for logical deletion
userSchema.methods.softDelete = function () {
  this.deletedAt = new Date()
  return this.save()
}

export default mongoose.model('User', userSchema)
