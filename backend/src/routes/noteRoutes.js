import express from 'express';
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all note routes
router.use(authenticate);

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

export default router;
