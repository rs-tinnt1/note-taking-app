import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  deleteUser
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// // POST /api/users - Create a new user
// router.post('/', createUser);

// // GET /api/users - Get all users
// router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// PUT /api/users/:id - Update user by ID
router.put('/:id', updateUser);

// PUT /api/users/:id/password - Update user password
router.put('/:id/password', updateUserPassword);

// DELETE /api/users/:id - Delete user by ID (cascade delete notes)
router.delete('/:id', deleteUser);

export default router;
