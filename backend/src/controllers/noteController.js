import Note from '../models/Note.js';

// Create a new note
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const owner = req.user.userId; // Get owner from JWT
    
    const note = new Note({
      title,
      content,
      owner
    });
    
    const savedNote = await note.save();
    
    res.status(201).json({
      success: true,
      data: savedNote
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all notes
const getAllNotes = async (req, res) => {
  try {
    const owner = req.user.userId; // Get owner from JWT
    const notes = await Note.findNotDeleted({ owner })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get note by ID
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const owner = req.user.userId; // Get owner from JWT
    
    const note = await Note.findOneNotDeleted({ _id: id, owner });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update note by ID
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const owner = req.user.userId; // Get owner from JWT
    
    const note = await Note.findNotDeletedAndUpdate(
      { _id: id, owner },
      { title, content },
      { new: true, runValidators: true }
    );
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete note by ID
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const owner = req.user.userId; // Get owner from JWT
    
    const note = await Note.findNotDeletedAndDelete({ _id: id, owner });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote
};
