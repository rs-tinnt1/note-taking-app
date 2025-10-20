import Note from '../models/Note.js'

// Create a new note
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body
    const owner = req.user.userId // Get owner from JWT

    const note = new Note({
      title,
      content,
      owner
    })

    const savedNote = await note.save()

    res.status(201).json({
      success: true,
      data: savedNote
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// Get all notes with search and pagination
const getAllNotes = async (req, res) => {
  try {
    const owner = req.user.userId // Get owner from JWT

    // Extract query parameters
    const {
      search = '',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))) // Max 100 records per page
    const skip = (pageNum - 1) * limitNum

    // Validate sort parameters
    const validSortFields = ['createdAt', 'updatedAt', 'title']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt'
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    // Build search query
    const searchQuery = { owner, deletedAt: null }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i') // Case-insensitive search
      searchQuery.$or = [
        { title: searchRegex },
        { content: searchRegex }
      ]
    }

    // Get total count for pagination info
    const totalCount = await Note.countDocuments(searchQuery)

    // Get notes with pagination and sorting
    const notes = await Note.find(searchQuery)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum)
    const hasNextPage = pageNum < totalPages
    const hasPrevPage = pageNum > 1

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPrevPage
      },
      search: {
        query: search,
        resultsCount: notes.length
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get note by ID
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params
    const owner = req.user.userId // Get owner from JWT

    const note = await Note.findOneNotDeleted({ _id: id, owner })

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    res.status(200).json({
      success: true,
      data: note
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Update note by ID
const updateNote = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content } = req.body
    const owner = req.user.userId // Get owner from JWT

    const note = await Note.findNotDeletedAndUpdate(
      { _id: id, owner },
      { title, content },
      { new: true, runValidators: true }
    )

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    res.status(200).json({
      success: true,
      data: note
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

// Delete note by ID
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params
    const owner = req.user.userId // Get owner from JWT

    const note = await Note.findNotDeletedAndDelete({ _id: id, owner })

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote
}
