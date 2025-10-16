import express from 'express';
import {
  getDashboardStats,
  getUsers,
  createCoupon,
  getActiveLotteries,
} from '../controllers/adminController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';
import { declareWinner, approveWinner, uploadPoster } from '../controllers/winnerController.js';

const router = express.Router();

router.get('/dashboard/stats', adminMiddleware, getDashboardStats);
router.get('/users', adminMiddleware, getUsers);
router.post('/coupons', adminMiddleware, createCoupon);
router.get('/lotteries/active', adminMiddleware, getActiveLotteries);
router.post('/winners/declare', adminMiddleware, declareWinner);
router.post('/winners/:winnerId/approve', adminMiddleware, approveWinner);
router.post('/winners/:winnerId/upload-poster', adminMiddleware, uploadPoster);

export default router;