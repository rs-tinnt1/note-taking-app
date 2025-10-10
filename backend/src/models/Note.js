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
  }
}, {
  // timestamps: true // Uncomment this line when you want to add createdAt and updatedAt
});

export default mongoose.model('Note', noteSchema);
