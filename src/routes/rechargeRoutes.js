import express from 'express';
import { initiate, verify } from '../controllers/rechargeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/initiate', authMiddleware, initiate);
router.post('/verify', authMiddleware, verify);

export default router;