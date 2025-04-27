import express from 'express';
import { registerUser, authUser, getUserProfile } from '../controllers/userController.js';
import { protect } from '../config/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/', registerUser);

// Authenticate user & get token
router.post('/login', authUser);

// Get user profile
router.get('/profile', protect, getUserProfile);

export default router; 