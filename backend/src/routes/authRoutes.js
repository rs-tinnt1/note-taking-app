import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

console.log('Auth routes file loaded');

// POST /api/auth/register - Register new user
router.post('/register', (req, res) => {
  console.log('Register route hit');
  register(req, res);
});

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/logout - Logout user (requires auth)
router.post('/logout', authenticate, logout);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshToken);

export default router;
