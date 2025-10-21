import express from 'express';
import { getProfile, getRewards } from '../controllers/userController.js';
import { addWinnerComment } from '../controllers/winnerController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.get('/rewards', authMiddleware, getRewards);
router.post('/winners/:winnerId/comment', authMiddleware, addWinnerComment);

export default router;