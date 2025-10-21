import express from 'express';
import { initiate, verify, getUserRecharges } from '../controllers/rechargeController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/initiate', authMiddleware, initiate);
router.post('/verify', authMiddleware, verify);
router.get('/history', authMiddleware, getUserRecharges);

export default router;