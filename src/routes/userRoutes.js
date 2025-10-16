import express from 'express';
import { getProfile, getRewards } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.get('/rewards', authMiddleware, getRewards);

export default router;