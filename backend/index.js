require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');

const port = process.env.PORT || 8080;

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Express server running at http://localhost:${port}`);
      console.log('Note Taking API is ready!');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();