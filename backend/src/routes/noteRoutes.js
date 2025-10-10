const express = require('express');
const router = express.Router();
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote
} = require('../controllers/noteController');

// POST /api/notes - Create a new note
router.post('/', createNote);

// GET /api/notes - Get all notes
router.get('/', getAllNotes);

// GET /api/notes/:id - Get note by ID
router.get('/:id', getNoteById);

// PUT /api/notes/:id - Update note by ID
router.put('/:id', updateNote);

// DELETE /api/notes/:id - Delete note by ID
router.delete('/:id', deleteNote);

module.exports = router;
