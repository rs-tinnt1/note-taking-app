import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/note-taking-app';
    
    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected successfully to: ${mongoURI}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
