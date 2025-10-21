import express from 'express';
import {
  getDashboardStats,
  getUsers,
  createCoupon,
  getActiveLotteries,
  createLottery,
  getActiveLotteriesNew,
  getPendingRecharges,
  processRecharge,
  declareWinner,
  getWinners,
} from '../controllers/adminController.js';
import adminMiddleware from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.get('/dashboard/stats', adminMiddleware, getDashboardStats);
router.get('/users', adminMiddleware, getUsers);
router.post('/coupons', adminMiddleware, createCoupon);
router.post('/lotteries', adminMiddleware, createLottery);
router.get('/lotteries/active', adminMiddleware, getActiveLotteriesNew);
router.get('/recharges/pending', adminMiddleware, getPendingRecharges);
router.post('/recharges/process', adminMiddleware, processRecharge);
router.post('/winners/declare', adminMiddleware, declareWinner);
router.get('/winners', adminMiddleware, getWinners);

export default router;