import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [1000, 'Content cannot exceed 1000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Note must belong to a user']
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Static method for logical deletion
noteSchema.statics.findNotDeleted = function(query = {}) {
  return this.find({ ...query, deletedAt: null });
};

noteSchema.statics.findOneNotDeleted = function(query = {}) {
  return this.findOne({ ...query, deletedAt: null });
};

noteSchema.statics.findByIdNotDeleted = function(id) {
  return this.findOne({ _id: id, deletedAt: null });
};

noteSchema.statics.findNotDeletedAndUpdate = function(query, update, options = {}) {
  return this.findOneAndUpdate({ ...query, deletedAt: null }, update, options);
};

noteSchema.statics.findNotDeletedAndDelete = function(query) {
  return this.findOneAndUpdate(
    { ...query, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );
};

// Instance method for logical deletion
noteSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

export default mongoose.model('Note', noteSchema); // collection name is 'notes'
