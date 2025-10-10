const express = require('express');
const cors = require('cors');
const noteRoutes = require('./routes/noteRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/notes', noteRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Note Taking API',
    version: '1.0.0',
    endpoints: {
      'GET /api/notes': 'Get all notes',
      'POST /api/notes': 'Create a new note',
      'GET /api/notes/:id': 'Get note by ID',
      'PUT /api/notes/:id': 'Update note by ID',
      'DELETE /api/notes/:id': 'Delete note by ID'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (for future expansion)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

module.exports = app;
